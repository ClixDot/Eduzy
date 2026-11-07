/** Fired by “Take a dashboard tour” (Admin Profile → Help & support) to replay the tour. */
export const TOUR_EVENT = 'eduzy-admin:tour';
/** Asks the admin shell to open/close the off-canvas sidebar on small screens. */
export const SIDEBAR_EVENT = 'eduzy-admin:sidebar';

export function startTour(step = 0) {
  window.dispatchEvent(new CustomEvent(TOUR_EVENT, { detail: { step } }));
}
