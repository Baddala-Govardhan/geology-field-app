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
      startSync();
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

export const remoteDB = new PouchDB(getCouchDBUrl(), {
  skip_setup: true,
});

// Sync handler
let syncHandler = null;
let isOnline = navigator.onLine;
let isConnectedToCouchDB = false;

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
    if (err.status === 404) {
      // Database doesn't exist, create it
      try {
        const createUrl = getCouchDBUrl();
        await fetch(createUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa("app:app")
          }
        });
        console.log("Created geology-data database in CouchDB");
        isConnectedToCouchDB = true;
      } catch (createErr) {
        console.error("Error creating CouchDB database:", createErr);
        console.log("Working offline - data will be saved locally and synced when online");
        isConnectedToCouchDB = false;
      }
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
        credentials: "include"
      });
      if (res.ok) {
        const existing = await res.json();
        designDoc._rev = existing._rev;
      }
      await fetch(baseUrl + "/_design/filters", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(designDoc),
        credentials: "include"
      });
    } catch (e) {
      console.warn("Could not ensure filter design doc:", e);
    }
  }

  startSync();
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
      // Don't show errors for offline scenarios - this is expected
      if (err.status !== 0 && err.status !== undefined && err.status !== 404) {
        console.error("Sync error:", err);
        updateSyncStatus("error");
      } else {
        console.log("Offline - sync will resume when connection is restored");
        updateSyncStatus("offline");
      }
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

// Check online/offline status
export const checkOnlineStatus = () => {
  return navigator.onLine && isConnectedToCouchDB;
};

// Setup online/offline event listeners
export const setupOnlineOfflineListeners = () => {
  const handleOnline = async () => {
    console.log("Internet connection detected - checking CouchDB connectivity");
    isOnline = true;
    
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
    isOnline = false;
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

// Initialize everything
initDatabase().then(() => {
  if (!getStudentId()) {
    initIpFallback();
  }
  setTimeout(() => {
    if (isConnectedToCouchDB && navigator.onLine) {
      if (syncHandler && syncHandler.state === 'active') {
        updateSyncStatus("synced");
      }
    }
  }, 3000);
});
setupOnlineOfflineListeners();
