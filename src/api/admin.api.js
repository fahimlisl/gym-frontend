import api from "./axios.api.js"; // your axios instance

const fetchAllMembers = () =>
  api.get("/admin/fetchAllUser");


export const fetchParticularUser = (id) => {
  return api.get(`/admin/fetchParticularUser/${id}`);
};

export const registerMember = (formData) => {
  return api.post(
    "/admin/registerUser",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const fetchAllTrainers = () => {
  return api.get("/admin/fetchAllTrainer");
};

export const assignPT = (memberId, trainerId, payload) => {
  return api.post(
    `/admin/personal-training/${memberId}/${trainerId}`,
    payload
  );
};


export const fetchParticularTrainer = (id) => {
  return api.get(`/admin/fetchParticularTrainer/${id}`);
};

export const renewMembership = (userId, data) =>
  api.patch(`/admin/renewalSubscription/${userId}`, data);


/* ================= PERSONAL TRAINING ================= */

// export const assignPT = (memberId, trainerId, payload) => {
//   return axios.post(
//     `/personal-training/${memberId}/${trainerId}`,
//     payload
//   );
// };

export const renewPT = (memberId, trainerId, payload) => {
  return api.post(
    `/admin/personal-training-renewal/${memberId}/${trainerId}`,
    payload
  );
};

// trainers


export const registerTrainer = (formData) =>
  api.post("/admin/register-trainer", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const editTrainer = (id, data) =>
  api.patch(`/admin/edit-trainer/${id}`, data);

export const deleteTrainer = (id) =>
  api.delete(`/admin/destroy-trainer/${id}`);


export const fetchAllTransactions = () =>
  api.get("/admin/fetchAllTransactions");

export const calculateTotalInLet = () =>
  api.get("/admin/calculateTotalInLet");


export {fetchAllMembers}
