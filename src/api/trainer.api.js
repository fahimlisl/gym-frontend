import api from "./axios.api.js";

export const fetchAssignedStudents = () =>
  api.get("/trainer/fetchAssignedStudents");

export const trainerLogout = () =>
  api.post("/trainer/logout");

export const trainerChangePassword = (payload) =>
  api.patch("/trainer/change/password", payload);
