import { create } from 'zustand';
export interface RenderSample { view: string; fps: number; calls: number; triangles: number; geometries: number; textures: number; pixelRatio: number; heapMB: number | null; seconds: number; }
export const useRenderSample = create<{ sample: RenderSample | null; setSample(sample: RenderSample): void }>(set => ({ sample: null, setSample: sample => set({ sample }) }));
