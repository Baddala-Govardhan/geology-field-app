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

  // Start sync
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
  // After initialization, check if we should show synced status
  setTimeout(() => {
    if (isConnectedToCouchDB && navigator.onLine) {
      // If sync is active and no errors, show synced
      if (syncHandler && syncHandler.state === 'active') {
        updateSyncStatus("synced");
      }
    }
  }, 3000);
});
setupOnlineOfflineListeners();
