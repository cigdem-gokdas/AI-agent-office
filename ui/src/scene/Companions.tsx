import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BoxGeometry, Color, DoubleSide, Float32BufferAttribute, SphereGeometry, Shape } from 'three';
import type { Group } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Orb, Ring, Stem } from './Primitives';

function Sphere({ position, scale, color }: { position: [number, number, number]; scale: [number, number, number]; color: string }) {
  return <mesh position={position} scale={scale} castShadow><sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={color} roughness={.85} /></mesh>;
}
let sleepingRabbit: ReturnType<typeof mergeGeometries>;
function sleepingRabbitGeometry() {
  if (!sleepingRabbit) {
    const pieces: (SphereGeometry | BoxGeometry)[] = [];
    const part = (position: [number, number, number], scale: [number, number, number], color: string) => {
      const geometry = new SphereGeometry(1, 12, 8); geometry.scale(...scale); geometry.translate(...position); const c = new Color(color); geometry.setAttribute('color', new Float32BufferAttribute(Array.from({ length: geometry.attributes.position.count }, () => [c.r, c.g, c.b]).flat(), 3)); pieces.push(geometry);
    };
    part([0, .27, 0], [.28, .23, .38], '#eee1ca'); part([0, .43, .25], [.22, .21, .22], '#f5e9d6'); part([0, .29, -.36], [.12, .12, .12], '#fbefda');
    for (const side of [-1, 1]) { part([side * .1, .7, .17], [.065, .23, .065], '#eee1ca'); part([side * .1, .71, .222], [.032, .17, .018], '#d9bfb5'); const eye = new BoxGeometry(.065, .014, .018).rotateZ(side * .13).translate(side * .13, .46, .437); const c = new Color('#685e54'); eye.setAttribute('color', new Float32BufferAttribute(Array.from({ length: eye.attributes.position.count }, () => [c.r, c.g, c.b]).flat(), 3)); pieces.push(eye); }
    part([0, .39, .46], [.028, .021, .017], '#c99f93'); sleepingRabbit = mergeGeometries(pieces); pieces.forEach(piece => piece.dispose());
  }
  return sleepingRabbit!;
}
export function RestingRabbit() {
  return <mesh rotation={[0, -.25, 0]} geometry={sleepingRabbitGeometry()} dispose={null}><meshStandardMaterial vertexColors roughness={.85} /></mesh>;
}
