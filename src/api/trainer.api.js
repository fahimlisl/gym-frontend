import api from "./axios.api.js";
import { getCurrentLocation } from "../utils/getCurrentLocation.js";

export const fetchAssignedStudents = () =>
  api.get("/trainer/fetchAssignedStudents");

export const trainerLogout = () =>
  api.post("/trainer/logout");

export const trainerChangePassword = (payload) =>
  api.patch("/trainer/change/password", payload);

export const getTrainerSelf = async () => {
  const response = await api.get("/trainer/fetchSelf");
  return response;
};

export const markTrainerAttendance = async (
  faceBlobs,
  { onStage } = {}
) => {
  if (!Array.isArray(faceBlobs) || faceBlobs.length !== 3) {
    throw new Error(
      "Exactly three fresh camera captures are required."
    );
  }

  for (const blob of faceBlobs) {
    if (!(blob instanceof Blob) || blob.size === 0) {
      throw new Error(
        "A camera capture is missing or empty."
      );
    }

    if (blob.size > 5 * 1024 * 1024) {
      throw new Error(
        "One camera image is too large (5 MB maximum)."
      );
    }
  }

  onStage?.("location");

  const {
    latitude,
    longitude,
    accuracy,
  } = await getCurrentLocation();

  const formData = new FormData();

  faceBlobs.forEach((blob, index) => {
    formData.append(
      "face",
      blob,
      `trainer-attendance-${index + 1}.jpg`
    );
  });

  formData.append("latitude", String(latitude));
  formData.append("longitude", String(longitude));
  formData.append("accuracy", String(accuracy));

  onStage?.("verifying");

  const { data } = await api.post(
    "/trainer/attendance/verify",
    formData,
    {
      timeout: 120000,
    }
  );

  return data;
};
