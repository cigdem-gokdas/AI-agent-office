export type WorldQuality = 'low' | 'balanced' | 'high';
export const qualityProfiles = {
  low: { dpr: 1, fps: 15, shadows: false, shadowSize: 512, decoration: 12, textureWidth: 768 },
  balanced: { dpr: 1.25, fps: 24, shadows: true, shadowSize: 1024, decoration: 22, textureWidth: 1536 },
  high: { dpr: 1.5, fps: 30, shadows: true, shadowSize: 1024, decoration: 32, textureWidth: 1536 },
} as const;
export function scenicAngles(focused: boolean) { return { minAzimuthAngle: focused ? -.82 : -.48, maxAzimuthAngle: focused ? .82 : .48, minPolarAngle: .48, maxPolarAngle: 1.28 }; }
export function faceAsset(mobile:boolean){return `/assets/art105/face${mobile?'-mobile':''}.webp`;}
export function cameraDistanceLimit(width: number, height: number, focused: boolean, helperCount: number) {
  const aspect = Math.max(.2, width / Math.max(1, height));
  const factor = Math.max(1, (focused ? helperCount ? 1.1 : .9 : 1.3) / aspect);
  return focused ? Math.max(21, 11 * factor + 2) : Math.max(62, 35.2 * factor + 3);
}
