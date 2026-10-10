export const ROLE_MAP = {
  admin: {
    label: "Admin",
    basePath: "/admin",
    loginEndpoint: "/admin/login",
    sessionEndpoint: "/admin/get/me",
    redirect: "/admin/dashboard",
  },

  trainer: {
    label: "Trainer",
    basePath: "/trainer",
    loginEndpoint: "/trainer/login",
    sessionEndpoint: "/trainer/fetchSelf",
    redirect: "/trainer/dashboard",
  },

  member: {
    label: "Member",
    basePath: "/user",
    loginEndpoint: "/user/login",

    // no auto redirect for members
    sessionEndpoint: null,

    redirect: "/member/dashboard",
  },
};