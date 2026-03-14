import api from "./axios.api.js"
export const getAllPublicTrainers = () => {
  return api.get("/general/fetchAllTrainer");
};

export const getPublicTrainerDetails = (id) => {
  return api.get(`/general/fetchParticularTrainer/${id}`);
};


export const fetchAllPlans = async () => {
  const res = await api.get("/general/plan/fetch/all");
  return res.data.data;
};