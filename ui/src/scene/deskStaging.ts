export const DESK_RESIDENT_POSITION: [number, number, number] = [.114, .12, -.7];
export function backgroundResetsOverview(detail: number, button: number) { return detail === 2 && button === 0; }
export function overviewNudge(width: number, focused: boolean) { return width < 760 || focused ? 0 : Math.min(64, width * .035); }
