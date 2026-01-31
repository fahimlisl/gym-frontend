import api from "./axios.api";

export const fetchAllCafeItem = () =>
  api.get("/cafe/admin/fetchAllCafeItem");

export const toggleCafeItemAvailability = (id) =>
  api.patch(`/cafe/admin/toggleAvailability/${id}`);

export const logoutCafeAdmin = () =>
  api.post("/cafe/admin/logout");
