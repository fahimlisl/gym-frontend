export const PANEL_SCOPE = {
  MEMBER: "member",
  TRAINER: "trainer",
  ADMIN: "admin",
};

export function getPanelScope() {
  const hostname = window.location.hostname;

  if (hostname === "trainer.alphagym.fit") {
    return PANEL_SCOPE.TRAINER;
  }

  if (hostname === "admin.alphagym.fit") {
    return PANEL_SCOPE.ADMIN;
  }

  if (
    hostname === "alphagym.fit" ||
    hostname === "www.alphagym.fit"
  ) {
    return PANEL_SCOPE.MEMBER;
  }

  if (hostname === "trainer.localhost") {
    return PANEL_SCOPE.TRAINER;
  }

  if (hostname === "admin.localhost") {
    return PANEL_SCOPE.ADMIN;
  }

  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  ) {
    return PANEL_SCOPE.MEMBER;
  }

  return PANEL_SCOPE.MEMBER;
}