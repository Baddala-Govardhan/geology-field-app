import PouchDB from "pouchdb";

export const STUDENT_ID_CONFIG = {
  maxLength: 14,
  placeholderExample: "012617684",
  placeholderNewExample: "012617684",
};

const STUDENT_ID_KEY = "geology_student_id";
const IP_FALLBACK_KEY = "geology_ip_id";
const DEVICE_ID_KEY = "geology_author_id";
const SKIP_STUDENT_ID_PROMPT_KEY = "geology_skip_student_id_prompt";
const STUDENT_ID_MAX_DEVICES = 3;
export function getStudentId() {
  const id = localStorage.getItem(STUDENT_ID_KEY);
  return id ? id.trim() : null;
}

export function setStudentId(id) {
  const trimmed = (id || "").trim().slice(0, STUDENT_ID_CONFIG.maxLength);
  if (trimmed) {
    localStorage.setItem(STUDENT_ID_KEY, trimmed);
  } else {
    localStorage.removeItem(STUDENT_ID_KEY);
  }
}

export function getSkipStudentIdPrompt() {
  return localStorage.getItem(SKIP_STUDENT_ID_PROMPT_KEY) === "true";
}

export function setSkipStudentIdPrompt(skip) {
  if (skip) {
    localStorage.setItem(SKIP_STUDENT_ID_PROMPT_KEY, "true");
  } else {
    localStorage.removeItem(SKIP_STUDENT_ID_PROMPT_KEY);
  }
}

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = "d_" + Math.random().toString(36).slice(2) + "_" + Date.now();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getAuthorId() {
  return getStudentId() || localStorage.getItem(IP_FALLBACK_KEY) || getDeviceId();
}

export async function initIpFallback() {
  if (getStudentId()) return;
  try {
    const res = await fetch("https://api.ipify.org?format=json", { method: "GET" });
    const data = await res.json();
    const ip = (data && data.ip) ? String(data.ip).replace(/\./g, "_") : null;
    if (ip) {
      const id = "ip_" + ip;
      localStorage.setItem(IP_FALLBACK_KEY, id);
      if (isConnectedToCouchDB) startSync();
    }
  } catch (e) {
    console.warn("Could not get IP for fallback ID:", e);
  }
}

export const localDB = new PouchDB("geology_field_data");

const getCouchDBUrl = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}/couchdb/geology-data`;
};

// Nginx injects Basic auth for /couchdb/ — browser does not send credentials.
export const remoteDB = new PouchDB(getCouchDBUrl(), { skip_setup: true });

let syncHandler = null;
let isConnectedToCouchDB = false;

function normalizeStudentId(input) {
  return (input || "").trim().slice(0, STUDENT_ID_CONFIG.maxLength);
}

function studentIdRegistryDocId(studentId) {
  return `student_id_registry:${studentId}`;
}

/**
 * Registers a Student ID in CouchDB and enforces a max-device limit per ID.
 * This prevents two different students from accidentally using the same ID,
 * while still allowing the same student to use the same ID across devices.
 */
export async function registerAndSetStudentId(studentIdInput) {
  const studentId = normalizeStudentId(studentIdInput);

  if (!studentId) {
    return { ok: false, error: "Please enter a Student ID." };
  }

  // Must be able to check CouchDB to prevent collisions.
  const canConnect = await checkCouchDBConnection();
  if (!canConnect) {
    return { ok: false, error: "Connect to the server to set your Student ID (cannot verify uniqueness while offline)." };
  }

  const docId = studentIdRegistryDocId(studentId);
  const deviceId = getDeviceId();

  // Retry loop for conflict on update
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      // Try create first
      const doc = {
        _id: docId,
        type: "student_id_registry",
        studentId,
        devices: [deviceId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await remoteDB.put(doc);

      setStudentId(studentId);
      startSync();
      return { ok: true, isNewRegistration: true, deviceCount: 1, maxDevices: STUDENT_ID_MAX_DEVICES };
    } catch (err) {
      if (err && (err.status === 409 || err.name === "conflict")) {
        try {
          const existing = await remoteDB.get(docId);
          const devices = Array.isArray(existing.devices) ? existing.devices.map(String) : [];
          const normalized = devices.filter(Boolean);

          if (normalized.includes(deviceId)) {
            // This device already counted; allow.
            setStudentId(studentId);
            startSync();
            return { ok: true, isNewRegistration: false, deviceCount: normalized.length, maxDevices: STUDENT_ID_MAX_DEVICES };
          }

          if (normalized.length >= STUDENT_ID_MAX_DEVICES) {
            return {
              ok: false,
              error: `This Student ID is already registered on ${STUDENT_ID_MAX_DEVICES} devices. Please use a different Student ID.`,
            };
          }

          const updated = {
            ...existing,
            devices: [...normalized, deviceId],
            updatedAt: new Date().toISOString(),
          };
          await remoteDB.put(updated);

          setStudentId(studentId);
          startSync();
          return {
            ok: true,
            isNewRegistration: false,
            deviceCount: updated.devices.length,
            maxDevices: STUDENT_ID_MAX_DEVICES,
          };
        } catch (updateErr) {
          // If we collided updating, retry.
          if (updateErr && (updateErr.status === 409 || updateErr.name === "conflict")) {
            continue;
          }
          console.error(updateErr);
          return { ok: false, error: "Failed to register Student ID. Please try again." };
        }
      }

      console.error(err);
      return { ok: false, error: "Failed to register Student ID. Please try again." };
    }
  }

  return { ok: false, error: "Failed to register Student ID. Please try again." };
}

// Check actual connectivity to CouchDB
const checkCouchDBConnection = async () => {
  try {
    await remoteDB.info();
    isConnectedToCouchDB = true;
    return true;
  } catch (err) {
    isConnectedToCouchDB = false;
    return false;
  }
};

// Initialize database and start sync
export const initDatabase = async () => {
  try {
    // Check if remote database exists
    await remoteDB.info();
    console.log("Remote DB ready");
    isConnectedToCouchDB = true;
  } catch (err) {
    const st = err && err.status;
    if (st === 404) {
      // DB must be created by CouchDB init (docker-compose); client cannot use admin creds here
      console.warn("Remote database not found — ensure CouchDB init created geology-data. Working offline until it exists.");
      isConnectedToCouchDB = false;
    } else if (st === 401 || st === 403) {
      console.warn("CouchDB returned 401/403 — check COUCHDB_APP_B64 matches COUCHDB_USER:COUCHDB_PASSWORD in .env.");
      isConnectedToCouchDB = false;
    } else {
      console.error("Error checking CouchDB:", err);
      console.log("Working offline - data will be saved locally and synced when online");
      isConnectedToCouchDB = false;
    }
  }

  if (isConnectedToCouchDB) {
    try {
      const baseUrl = getCouchDBUrl();
      const designDoc = {
        _id: "_design/filters",
        filters: {
          byAuthor: "function(doc, req) { if (!req.query.authorId) return false; return doc.authorId === req.query.authorId; }"
        }
      };
      const res = await fetch(baseUrl + "/_design/filters", {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const existing = await res.json();
        designDoc._rev = existing._rev;
      }
      await fetch(baseUrl + "/_design/filters", {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(designDoc),
      });
    } catch (e) {
      console.warn("Could not ensure filter design doc:", e);
    }
  }

  if (isConnectedToCouchDB) {
    startSync();
  } else {
    updateSyncStatus(navigator.onLine ? "paused" : "offline");
  }
};

// Start bidirectional sync
export const startSync = () => {
  // Cancel existing sync if any
  if (syncHandler) {
    syncHandler.cancel();
  }

  // Set initial status to syncing if online
  if (navigator.onLine) {
    updateSyncStatus("syncing");
  }

  const authorId = getAuthorId();
  syncHandler = localDB.sync(remoteDB, {
    live: true,
    retry: true,
    pull: {
      filter: "filters/byAuthor",
      query_params: { authorId }
    },
    back_off_function: (delay) => {
      if (delay === 0) return 1000;
      return Math.min(delay * 2, 10000);
    }
  })
    .on("change", (info) => {
      console.log("Sync change:", info);
      if (info.direction === 'push') {
        console.log("Data synced to server successfully");
        updateSyncStatus("synced");
      } else if (info.direction === 'pull') {
        console.log("Data received from server");
        updateSyncStatus("synced");
      }
    })
    .on("paused", async () => {
      // Check if we're actually online and can reach CouchDB
      const canConnect = await checkCouchDBConnection();
      if (canConnect && navigator.onLine) {
        console.log("Sync paused temporarily - will retry automatically");
        updateSyncStatus("syncing");
        // Retry sync after a short delay
        setTimeout(() => {
          if (!syncHandler || syncHandler.state === 'paused') {
            startSync();
          }
        }, 2000);
      } else {
        console.log("Sync paused - offline or connection issue");
        if (!navigator.onLine) {
          updateSyncStatus("offline");
        } else {
          updateSyncStatus("paused");
        }
      }
    })
    .on("active", () => {
      console.log("Sync active - connected to server");
      isConnectedToCouchDB = true;
      updateSyncStatus("syncing");
    })
    .on("error", (err) => {
      const st = err && err.status;
      // Offline / unknown host — not a "bug" state
      if (st === 0 || st === undefined || st === 404) {
        console.log("Offline or unreachable — sync will retry when possible");
        updateSyncStatus("offline");
        return;
      }
      if (st === 401 || st === 403) {
        updateSyncStatus("paused");
        return;
      }
      console.error("Sync error:", err);
      updateSyncStatus("error");
    });

  return syncHandler;
};

// Sync status management
let syncStatusCallbacks = [];

export const onSyncStatusChange = (callback) => {
  syncStatusCallbacks.push(callback);
  return () => {
    syncStatusCallbacks = syncStatusCallbacks.filter(cb => cb !== callback);
  };
};

const updateSyncStatus = (status) => {
  syncStatusCallbacks.forEach(cb => cb(status));
};

export async function bootstrapIfSessionPresent() {
  await initDatabase();
  if (!getStudentId()) {
    await initIpFallback();
  }
  setTimeout(() => {
    if (isConnectedToCouchDB && navigator.onLine && syncHandler && syncHandler.state === "active") {
      updateSyncStatus("synced");
    }
  }, 3000);
}

// Check online/offline status
export const checkOnlineStatus = () => {
  return navigator.onLine && isConnectedToCouchDB;
};

// Setup online/offline event listeners
export const setupOnlineOfflineListeners = () => {
  const handleOnline = async () => {
    console.log("Internet connection detected - checking CouchDB connectivity");
    
    // Verify we can actually reach CouchDB
    const canConnect = await checkCouchDBConnection();
    if (canConnect) {
      console.log("CouchDB reachable - resuming sync");
      startSync();
      updateSyncStatus("syncing");
    } else {
      console.log("Internet available but CouchDB not reachable - check Docker containers");
      updateSyncStatus("paused");
    }
  };

  const handleOffline = () => {
    console.log("Internet connection lost - working offline");
    isConnectedToCouchDB = false;
    updateSyncStatus("offline");
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Also check periodically if sync is paused but we're online
  setInterval(async () => {
    if (navigator.onLine && (!syncHandler || syncHandler.state === 'paused')) {
      const canConnect = await checkCouchDBConnection();
      if (canConnect) {
        console.log("Auto-resuming sync - connection restored");
        startSync();
      }
    }
  }, 10000); // Check every 10 seconds

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
};

setupOnlineOfflineListeners();
