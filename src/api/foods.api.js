import api from "./axios.api.js";

export const fetchAllFoods = () =>
  api.get("/trainer/getAllFoods", {
    withCredentials: true,
  });

export const addFoodViaN8N = (foodName) =>
  api.post(
    "/trainer/addFoodtoDB",
    { foodName },
    { withCredentials: true }
  );
  
