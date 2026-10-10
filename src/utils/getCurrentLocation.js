const LOCATION_TIMEOUT_MS = 45000;
const MAX_LOCATION_AGE_MS = 15000;

// Difference between Apple's 2001 epoch and Unix's 1970 epoch.
const APPLE_EPOCH_OFFSET_MS = 978307200000;

const getReadingAge = (timestamp) => {
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return null;
  }

  const now = Date.now();

  // Standard browser timestamp: Unix milliseconds.
  const standardAge = now - timestamp;

  if (
    standardAge >= -5000 &&
    standardAge <= MAX_LOCATION_AGE_MS
  ) {
    return {
      ageMs: standardAge,
      epoch: "unix",
    };
  }

  // Compatibility for Safari's 2001-based timestamp.
  const correctedAge =
    now - (timestamp + APPLE_EPOCH_OFFSET_MS);

  if (
    correctedAge >= -5000 &&
    correctedAge <= MAX_LOCATION_AGE_MS
  ) {
    return {
      ageMs: correctedAge,
      epoch: "apple-2001",
    };
  }

  // Neither interpretation gives a fresh reading.
  return null;
};

export const getCurrentLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error("Geolocation is not supported.")
      );
      return;
    }

    let watchId = null;
    let timer = null;
    let settled = false;
    let lastAccuracy = null;
    let lastRawAgeSeconds = null;

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }

      if (timer !== null) {
        clearTimeout(timer);
      }
    };

    const finish = (error, location = null) => {
      if (settled) return;

      settled = true;
      cleanup();

      if (error) reject(error);
      else resolve(location);
    };

    timer = setTimeout(() => {
      console.warn("[GPS] No fresh location", {
        lastAccuracy,
        lastRawAgeSeconds,
      });

      finish(
        new Error(
          "Unable to obtain a fresh location. Please retry."
        )
      );
    }, LOCATION_TIMEOUT_MS);

    watchId = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) => {
        const { latitude, longitude, accuracy } = coords;

        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude) ||
          !Number.isFinite(accuracy) ||
          accuracy <= 0
        ) {
          return;
        }

        lastAccuracy = accuracy;
        lastRawAgeSeconds = Math.round(
          (Date.now() - timestamp) / 1000
        );

        const reading = getReadingAge(timestamp);

        if (!reading) {
          console.warn("[GPS] Stale location reading", {
            accuracyMeters: accuracy,
            rawAgeSeconds: lastRawAgeSeconds,
          });
          return;
        }

        console.log("[GPS] Valid location:", {
          accuracyMeters: accuracy,
          ageSeconds: Math.round(reading.ageMs / 1000),
          timestampEpoch: reading.epoch,
        });

        finish(null, {
          latitude,
          longitude,
          accuracy,
        });
      },

      (error) => {
        const messages = {
          1: "Location permission denied.",
          2: "Location unavailable.",
          3: "Location request timed out.",
        };

        finish(
          new Error(
            messages[error.code] ||
            "Unable to retrieve location."
          )
        );
      },

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: LOCATION_TIMEOUT_MS,
      }
    );

    if (settled) cleanup();
  });
