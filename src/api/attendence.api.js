import api from "./axios.api.js";

export const markAttendance = (data) =>
  api.post("/admin/mark/attendence", data);

export const getTodayAttendance = () =>
  api.get("/admin/today/attendence");

export const getMonthlyAttendance = (month) =>
  api.get(`/admin/month/attendence?month=${month}`);

export const getMemberMonthlyAttendance = (memberId, month) =>
  api.get(`/admin/month/attendence/${memberId}?month=${month}`);
