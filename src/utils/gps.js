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
        error: "Geolocation not supported by this browser",
        manualEntry: true,
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          manualEntry: false,
        });
      },
      (error) => {
        // GPS failed - user may need to enter manually
        let errorMessage = "Unable to retrieve location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
          default:
            errorMessage = "Unknown location error";
            break;
        }
        resolve({
          latitude: null,
          longitude: null,
          error: errorMessage,
          manualEntry: true,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

export const formatGPSString = (latitude, longitude) => {
  if (latitude && longitude) {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
  return "";
};

