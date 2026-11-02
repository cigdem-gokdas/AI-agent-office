import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { qualityProfiles } from './quality';
import { useHeadquarters } from '../state/store';
import { useRenderSample } from '../state/renderObservations';
// Graphics observations only; never model usage or operational task telemetry.
export function PerformanceSampler({ active }: { active: boolean }) {
  const { gl, setDpr, invalidate, size } = useThree();
  const quality = useHeadquarters(state => state.quality), focused = useHeadquarters(state => state.focused);
  const sample = useRef({ start: performance.now(), count: 0, slow: 0 });
  const ceiling = Math.min(qualityProfiles[quality].dpr, size.width < 760 ? 1 : window.devicePixelRatio || 1);
  useEffect(() => { setDpr(ceiling); sample.current = { start: performance.now(), count: 0, slow: 0 }; invalidate(); }, [quality, focused, ceiling, active, setDpr, invalidate]);
  useFrame(() => {
    const value = sample.current; value.count++;
    const elapsed = (performance.now() - value.start) / 1000;
    if (elapsed < 3) return;
    const fps = value.count / elapsed;
    // Only lower resolution after two sustained slow animated samples. Reduced motion is not slow hardware.
    value.slow = active && fps < qualityProfiles[quality].fps * .65 ? value.slow + 1 : 0;
    if (value.slow >= 2 && gl.getPixelRatio() > .8) { setDpr(Math.max(.8, gl.getPixelRatio() - .15)); value.slow = 0; }
    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
    useRenderSample.getState().setSample({ view: focused ? `Room: ${focused}` : 'Headquarters overview', fps: Math.round(fps * 10) / 10, calls: gl.info.render.calls, triangles: gl.info.render.triangles, geometries: gl.info.memory.geometries, textures: gl.info.memory.textures, pixelRatio: gl.getPixelRatio(), heapMB: memory ? Math.round(memory.usedJSHeapSize / 1048576) : null, seconds: Math.round(elapsed * 10) / 10 });
    value.start = performance.now(); value.count = 0;
  });
  return null;
}
