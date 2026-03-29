import api from "./axios.api.js";

export const fetchAllMembers = () =>
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

export const assignPT = (memberId, trainerId, planId, payload) => {
  return api.post(
    `/admin/personal-training/${memberId}/${trainerId}/${planId}`,
    payload
  );
};
 


export const fetchParticularTrainer = (id) => {
  return api.get(`/admin/fetchParticularTrainer/${id}`);
};

export const renewMembership = (userId, data) =>
  api.patch(`/admin/renewalSubscription/${userId}`, data);


// personal training
export const renewPT = (memberId, trainerId, planId, payload) => {
  return api.post(
    `/admin/personal-training-renewal/${memberId}/${trainerId}/${planId}`,
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


// revenew part 
export const fetchDashboardRevenue = () =>
  api.get("/admin/dashboard-revenue");

export const fetchRevenueBySource = () =>
  api.get("/admin/revenue-by-source");

export const fetchRecentTransactions = () =>
  api.get("/admin/recent-transactions");


// cafe
export const fetchAllCafeItem = () =>
  api.get("/admin/fetchAllCafeItem");

export const destroyCafeItem = (id) =>
  api.delete(`/admin/destroy-item/${id}`);

export const editCafeItem = (id, data) =>
  api.post(`/admin/edit-item/${id}`, data);

export const addCafeItem = (formData) =>
  api.post("/admin/add-item", formData);

export const toggleCafeItemAvailability = (id) =>
  api.patch(`/admin/toggleAvailability/${id}`);

// cafe admin staff
export const addCafeAdmin = (data) =>
  api.post("/admin/add-cafe-admin", data);

export const fetchAllCafeAdmin = () =>
  api.get("/admin/fetchAllCafeAdmin");

export const destroyCafeAdmin = (id) =>
  api.delete(`/admin/destroyCafeAdmin/${id}`);


export const getCafeCategories = async () => {
  const { data } = await api.get("/admin/get/cafe/categories");
  return data.data;
};

export const addCafeCategory = async (name) => {
  const { data } = await api.post("/admin/add/cafe/category", { name });
  return data.data;
};

// plans
export const fetchAllPlans = () => api.get("/admin/plan/fetch/all");
export const addPlan = (data) => api.post("/admin/plan/add", data);
export const destroyPlan = (id) => api.delete(`/admin/plan/destroy/${id}`);
export const addBenefit = (id, data) => api.patch(`/admin/plan/add/benefit/${id}`, data);
export const removeBenefit = (planId, benefitId) =>
  api.patch(`/admin/plan/remove/benefit/${planId}/${benefitId}`);
export const editPlan = (id,data) => api.patch(`/admin/plan/edit/${id}`,data)

export const createPaymentIn = (data) =>
  api.post("/admin/add/payment/in", data); 