import { api } from "./auth.api";


export const fetchPublicSupplements = async () => {
  const res = await api.get(
    "general/fetch-supplements"
  );
  return res.data.data;
};

export const fetchPublicSupplementById = async (id) => {
  const res = await api.get(
    `general/fetchParticularSupp/${id}`
  );
  return res.data.data;
};

/* ========= ADMIN ========= */

export const fetchAdminSupplements = async () => {
  const res = await api.get(
    "/admin/fetch-supplements"
  );
  return res.data.data;
};

export const addSupplement = async (formData) => {
  return api.post(
    "/admin/add-supplement",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const deleteSupplement = async (id) => {
  return api.delete(
    `/admin/destroy-supplement/${id}`
  );
};
