import api from "./axios.api.js";

const endpoint = (trainerId) =>
  `/admin/trainer/${encodeURIComponent(trainerId)}/schedule`;

export const getTrainerSchedule = async (trainerId) => {
  const { data } = await api.get(endpoint(trainerId));
  return data.data?.schedule ?? null;
};

export const saveTrainerSchedule = async (trainerId, payload) => {
  const { data } = await api.put(endpoint(trainerId), payload);
  return data.data?.schedule ?? null;
};

export const deactivateTrainerSchedule = async (trainerId) => {
  const { data } = await api.delete(endpoint(trainerId));
  return data;
};
