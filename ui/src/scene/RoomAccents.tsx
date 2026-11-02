import { useMemo, useEffect } from 'react';
import { BoxGeometry, SphereGeometry, CylinderGeometry, Color, Float32BufferAttribute } from 'three';
import type { BufferGeometry } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
// Curated secondary objects in one batched draw call per room; no additional lights/shadows.
export function RoomAccents({ id, color }: { id: string; color: string }) {
  const geometry = useMemo(() => {
    const parts: BufferGeometry[] = [];
    const add = (g: BufferGeometry, x: number, y: number, z: number, tint: string) => { g.translate(x,y,z); const c = new Color(tint); g.setAttribute('color', new Float32BufferAttribute(Array.from({length:g.attributes.position.count},()=>[c.r,c.g,c.b]).flat(),3)); parts.push(g); };
    const books = ['library','archive','gallery','coordinator'].includes(id);
    // Side reading / equipment shelf leaves the central desk and approach clear.
    add(new BoxGeometry(.72,.06,.38),1.65,.7,-.4,'#ac896c');
    for(let i=0;i<3;i++) add(new BoxGeometry(books?.34:.18,books?.07:.16,books?.24:.18),1.65+(books?0:(i-1)*.2),.77+i*(books?.075:0),-.4, i%2?color:'#e8d9b8');
    if(['observatory','guardian','workshop'].includes(id)) add(new SphereGeometry(.12,12,8),1.65,1.03,-.4,color);
    if(['studio','post'].includes(id)) for(let i=0;i<3;i++) add(new BoxGeometry(.28,.015,.18),1.65,.81+i*.025,-.36+i*.04,'#f1dfc4');
    // Pair of low golden candles in a dedicated front-corner tray.
    add(new CylinderGeometry(.23,.25,.04,16),-1.55,.13,1.3,'#bb9a69');
    for(const x of [-1.66,-1.45]) { add(new CylinderGeometry(.045,.045,.23,10),x,.265,1.3,'#f6dfb6'); add(new SphereGeometry(.025,8,6),x,.405,1.3,'#ffe8ae'); }
    const merged=mergeGeometries(parts)!;parts.forEach(p=>p.dispose());return merged;
  },[id,color]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry}><meshStandardMaterial vertexColors roughness={.8} emissive="#f0cda4" emissiveIntensity={.055}/></mesh>;
}
