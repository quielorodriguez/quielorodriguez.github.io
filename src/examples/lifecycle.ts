// Illustrative only. A tiny state machine shape, not the real lifecycle engine.
type DemoLifecycle = "issued" | "suspended" | "revoked" | "expired";

const allowedTransitions: Record<DemoLifecycle, DemoLifecycle[]> = {
  issued: ["suspended", "revoked", "expired"],
  suspended: ["issued", "revoked", "expired"],
  revoked: [],
  expired: [],
};

function canTransition(from: DemoLifecycle, to: DemoLifecycle): boolean {
  return allowedTransitions[from].includes(to);
}
