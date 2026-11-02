import { useEffect, useMemo } from 'react';
import { AdditiveBlending, BoxGeometry, ConeGeometry, TorusGeometry, SphereGeometry, MeshStandardMaterial, CanvasTexture, DoubleSide, Quaternion, SRGBColorSpace, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
export type Point = [number, number, number];
export const wood = '#624135', gold = '#d9ae6e';
export function Block({ position, scale, color = wood, rotation = 0 }: { position: Point; scale: Point; color?: string; rotation?: number }) {
  return <mesh position={position} rotation={[0, rotation, 0]} castShadow receiveShadow><boxGeometry args={scale} /><meshStandardMaterial color={color} roughness={.72} /></mesh>;
}
export function Orb({ position = [0, 0, 0], scale = [1, 1, 1], color, glow = 0 }: { position?: Point; scale?: Point; color: string; glow?: number }) {
  return <mesh position={position} scale={scale} castShadow={!glow}><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} roughness={.6} /></mesh>;
}
export function Round({ position, radius, height, color, sides = 40 }: { position: Point; radius: number; height: number; color: string; sides?: number }) {
  return <mesh position={position} castShadow receiveShadow><cylinderGeometry args={[radius, radius * 1.04, height, sides]} /><meshStandardMaterial color={color} roughness={.8} /></mesh>;
}
export function Ring({ radius, position = [0, 0, 0], color = gold, width = .03, vertical = false, glow = 0 }: { radius: number; position?: Point; color?: string; width?: number; vertical?: boolean; glow?: number }) {
  return <mesh position={position} rotation={vertical ? [0, 0, 0] : [-Math.PI / 2, 0, 0]}><torusGeometry args={[radius, width, 5, 48]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={glow} metalness={.5} roughness={.4} /></mesh>;
}
export function Stem({ from, to, radius = .04, color = wood }: { from: Point; to: Point; radius?: number; color?: string }) {
  const dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
  const length = Math.hypot(dx, dy, dz);
  return <group position={from} quaternion={new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(dx, dy, dz).normalize())}><mesh position={[0, length / 2, 0]} castShadow><cylinderGeometry args={[radius * .65, radius, length, 7]} /><meshStandardMaterial color={color} roughness={.9} /></mesh></group>;
}
let lanternGlow: CanvasTexture | undefined;
function glowTexture() {
  if (!lanternGlow) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(32, 32, 1, 32, 32, 32);
    gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(.2, '#ffffffaa'); gradient.addColorStop(1, '#ffffff00');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64); lanternGlow = new CanvasTexture(canvas);
  }
  return lanternGlow;
}
export function Glow({ color, size = 1 }: { color: string; size?: number }) {
  return <sprite scale={[size, size, 1]}><spriteMaterial map={glowTexture()} color={color} transparent opacity={.32} blending={AdditiveBlending} depthWrite={false} /></sprite>;
}
const lanternShapes = new Map<boolean, ReturnType<typeof mergeGeometries>>();
const lanternGold = new MeshStandardMaterial({ color: gold, metalness: .5, roughness: .4 });
const lanternBulb = new SphereGeometry(1, 10, 8);
function lanternShape(hanging: boolean) {
  if (!lanternShapes.has(hanging)) {
    const stem = new BoxGeometry(.025, .65, .025).translate(0, hanging ? .36 : -.3, 0);
    const top = new ConeGeometry(.21, .15, 8).translate(0, .23, 0);
    const bottom = new ConeGeometry(.21, .15, 8).rotateX(Math.PI).translate(0, -.23, 0);
    const ring = new TorusGeometry(.17, .03, 5, 24).rotateX(-Math.PI / 2);
    const pieces = [stem, top, bottom, ring]; lanternShapes.set(hanging, mergeGeometries(pieces)); pieces.forEach(piece => piece.dispose());
  }
  return lanternShapes.get(hanging)!;
}
export function Lantern({ position, color = '#ffcb7b', hanging = false }: { position: Point; color?: string; hanging?: boolean }) {
  return <group position={position} dispose={null}><mesh geometry={lanternShape(hanging)} material={lanternGold} /><mesh geometry={lanternBulb} scale={[.15, .23, .15]}><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} /></mesh><Glow color={color} size={1.1} /></group>;
}
export function Mushroom({ position, size = 1, color = '#e7b0ba' }: { position: Point; size?: number; color?: string }) {
  return <group position={position} scale={size}>
    <mesh position={[0, .25, 0]}><cylinderGeometry args={[.055, .09, .5, 7]} /><meshStandardMaterial color="#eddbb7" /></mesh>
    <mesh position={[0, .48, 0]} scale={[1, .5, 1]}><sphereGeometry args={[.3, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.35} side={DoubleSide} /></mesh>
    <Orb position={[0, .49, 0]} scale={[.18, .025, .18]} color="#ffda8c" glow={1} />
    {[0, 1, 2].map(i => <Orb key={i} position={[Math.sin(i * 2.1) * .15, .6, Math.cos(i * 2.1) * .12]} scale={[.035, .018, .035]} color="#ffefd7" />)}
  </group>;
}
export function Flower({ position, color = '#e9acbf', size = 1 }: { position: Point; color?: string; size?: number }) {
  return <group position={position} scale={size}>
    <Stem from={[0, 0, 0]} to={[.04, .45, 0]} radius={.018} color="#698c70" />
    {Array.from({ length: 5 }, (_, i) => <mesh key={i} position={[Math.sin(i * 1.256) * .1, .45 + Math.cos(i * 1.256) * .1, .025]} scale={[.065, .11, .025]} rotation={[0, 0, -i * 1.256]}><sphereGeometry args={[1, 6, 5]} /><meshStandardMaterial color={color} /></mesh>)}
    <Orb position={[0, .45, .06]} scale={[.045, .045, .025]} color="#f4d896" glow={.3} />
  </group>;
}
export function Plant({ position, size = 1 }: { position: Point; size?: number }) {
  return <group position={position} scale={size}>
    <Round position={[0, .12, 0]} radius={.2} height={.24} color="#937260" sides={9} />
    {[0, 1, 2, 3, 4].map(i => <mesh key={i} position={[Math.sin(i * 2.4) * .16, .4 + i * .05, Math.cos(i * 2.4) * .16]} rotation={[.3, i * 2.4, .4]} scale={[.12, .35, .045]}><sphereGeometry args={[1, 7, 5]} /><meshStandardMaterial color={i % 2 ? '#86ac84' : '#486d58'} /></mesh>)}
  </group>;
}
// Authored decorative signage only; this never contains runtime tasks or owner data.
export function Board({ position, lines, color = '#92d3bc', width = 1.2, height = .85 }: { position: Point; lines: string[]; color?: string; width?: number; height?: number }) {
  const text = lines.join('\n');
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 384;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#203833'; context.fillRect(0, 0, 512, 384);
    context.strokeStyle = color; context.lineWidth = 2; context.strokeRect(18, 18, 476, 348);
    context.fillStyle = color; context.font = '30px Georgia';
    text.split('\n').slice(0, 5).forEach((line, i) => context.fillText(line, 42, 85 + i * 56));
    const value = new CanvasTexture(canvas); value.colorSpace = SRGBColorSpace; return value;
  }, [text, color]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <group position={position}><Block position={[0, 0, 0]} scale={[width + .1, height + .1, .1]} color={gold} /><mesh position={[0, 0, .056]}><planeGeometry args={[width, height]} /><meshStandardMaterial map={texture} roughness={.7} emissive="#ffffff" emissiveMap={texture} emissiveIntensity={.35} /></mesh></group>;
}
