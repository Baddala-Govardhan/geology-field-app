import PouchDB from "pouchdb";

// Initialize local PouchDB (works offline)
export const localDB = new PouchDB("geology_field_data");

// Get CouchDB URL (uses nginx proxy)
const getCouchDBUrl = () => {
  const hostname = window.location.hostname;
  const port = window.location.port;
  const protocol = window.location.protocol;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}/couchdb/geology-data`;
};

// Initialize remote CouchDB connection
export const remoteDB = new PouchDB(getCouchDBUrl(), {
  skip_setup: true,
});

// Sync handler
let syncHandler = null;
let isOnline = navigator.onLine;

// Initialize database and start sync
export const initDatabase = async () => {
  try {
    // Check if remote database exists
    await remoteDB.info();
    console.log("Remote DB ready");
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
      } catch (createErr) {
        console.error("Error creating CouchDB database:", createErr);
        console.log("Working offline - data will be saved locally and synced when online");
      }
    } else {
      console.error("Error checking CouchDB:", err);
      console.log("Working offline - data will be saved locally and synced when online");
    }
  }

  // Start sync
  startSync();
};

// Start bidirectional sync
export const startSync = () => {
  // Cancel existing sync if any
  if (syncHandler) {
    syncHandler.cancel();
  }

  // Start new sync with retry enabled
  syncHandler = localDB.sync(remoteDB, {
    live: true,
    retry: true,
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
    .on("paused", () => {
      console.log("Sync paused - offline or connection issue");
      updateSyncStatus("paused");
    })
    .on("active", () => {
      console.log("Sync active - connected to server");
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
  return navigator.onLine;
};

// Setup online/offline event listeners
export const setupOnlineOfflineListeners = () => {
  const handleOnline = () => {
    console.log("Internet connection restored - resuming sync");
    isOnline = true;
    startSync();
    updateSyncStatus("syncing");
  };

  const handleOffline = () => {
    console.log("Internet connection lost - working offline");
    isOnline = false;
    updateSyncStatus("offline");
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
};

// Initialize everything
initDatabase();
setupOnlineOfflineListeners();
