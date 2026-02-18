export const ROLE_MAP = {
  admin: {
    label: "Admin",
    loginEndpoint: "/admin/login",
    basePath: "/admin",
    redirect: "/admin/dashboard",
  },
  trainer: {
    label: "Trainer",
    loginEndpoint: "/trainer/login",
    basePath: "/trainer",
    redirect: "/trainer/dashboard",
  },
  member: {
    label: "Member",
    loginEndpoint: "/user/login",
    basePath: "/user",
    redirect: "/member/dashboard",
  },
  cafe: {
    label: "Cafe",
    loginEndpoint: "/cafe/admin/login",
    basePath: "/cafe/admin",
    redirect: "/cafe/dashboard",
  },
};
