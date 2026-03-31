import api from "./axios.api.js";

export const fetchAllFoods = () =>
  api.get("/admin/getAllFoods", {
    withCredentials: true,
  });

export const addFoodViaN8N = (foodName) =>
  api.post(
    "/admin/addFoodtoDB",
    { foodName },
    { withCredentials: true }
  );
  
// export const fetchAllFoods = () =>
//   api.get("/trainer/getAllFoods", {
//     withCredentials: true,
//   });

// export const addFoodViaN8N = (foodName) =>
//   api.post(
//     "/trainer/addFoodtoDB",
//     { foodName },
//     { withCredentials: true }
//   );
  
