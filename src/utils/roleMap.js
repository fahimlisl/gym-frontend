export const ROLE_MAP = {
  admin: {
    label: "Admin",
    endpoint: "/admin/login",
    redirect: "/admin/dashboard",
  },
  trainer: {
    label: "Trainer",
    endpoint: "/trainer/login",
    redirect: "/trainer/dashboard",
  },
  member: {
    label: "Member",
    endpoint: "/user/login",
    redirect: "/member/dashboard",
  },

   cafe: {
    label: "Cafe",
    endpoint: "/cafe/admin/login", 
    redirect: "/cafe/dashboard",
  },
};
