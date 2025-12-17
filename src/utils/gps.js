/**
 * GPS utility for collecting location data
 * Automatically gets GPS coordinates when available (phones, devices with GPS)
 * Falls back to manual entry for devices without GPS
 */
export const getGPSLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      // Geolocation not supported
      resolve({
        latitude: null,
        longitude: null,
        error: "Geolocation not supported by this browser. Please enter coordinates manually.",
        manualEntry: true,
      });
      return;
    }

    // Clear any cached location by setting maximumAge to 0
    const options = {
      enableHighAccuracy: true,  // Force GPS, not just network location
      timeout: 30000,  // 30 seconds timeout for better GPS lock
      maximumAge: 0,  // Never use cached location - always get fresh GPS
    };

    console.log("Requesting GPS location with high accuracy...");

    // Use watchPosition to get real-time GPS updates, then stop after first accurate reading
    let watchId;
    let positionCount = 0;
    const maxAttempts = 3; // Try up to 3 times to get accurate location
    
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        positionCount++;
        console.log(`GPS location received (attempt ${positionCount}):`, { 
          lat, 
          lon, 
          accuracy: `${accuracy}m`,
          source: position.coords.altitude !== null ? 'GPS' : 'Network'
        });
        
        // Validate coordinates are reasonable (not 0,0 or obviously wrong)
        if (lat === 0 && lon === 0) {
          if (positionCount < maxAttempts) {
            return; // Keep trying
          }
          navigator.geolocation.clearWatch(watchId);
          resolve({
            latitude: null,
            longitude: null,
            error: "Invalid GPS coordinates received. Please enter coordinates manually.",
            manualEntry: true,
          });
          return;
        }

        // If accuracy is good (< 100m) or we've tried enough times, accept the location
        if (accuracy < 100 || positionCount >= maxAttempts) {
          navigator.geolocation.clearWatch(watchId);
          
          // Warn if accuracy is poor (likely network-based, not GPS)
          if (accuracy > 1000) {
            console.warn("Low accuracy location - may be network-based, not GPS");
          }
          
          resolve({
            latitude: lat,
            longitude: lon,
            accuracy: accuracy,
            error: null,
            manualEntry: false,
          });
        }
      },
      (error) => {
        navigator.geolocation.clearWatch(watchId);
        
        // GPS failed - user may need to enter manually
        let errorMessage = "Unable to retrieve location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please allow location access in your browser settings and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please check your GPS settings or enter coordinates manually.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again or enter coordinates manually.";
            break;
          default:
            errorMessage = "Unknown location error. Please enter coordinates manually.";
            break;
        }
        
        console.error("GPS error:", errorMessage, error);
        
        resolve({
          latitude: null,
          longitude: null,
          error: errorMessage,
          manualEntry: true,
        });
      },
      options
    );
    
    // Fallback timeout - if watchPosition doesn't resolve in 30 seconds, clear it
    setTimeout(() => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
        if (positionCount === 0) {
          resolve({
            latitude: null,
            longitude: null,
            error: "Location request timed out. Please try again or enter coordinates manually.",
            manualEntry: true,
          });
        }
      }
    }, 30000);
  });
};

export const formatGPSString = (latitude, longitude) => {
  if (latitude && longitude) {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
  return "";
};

