import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, Float32BufferAttribute, Matrix4, Quaternion, SphereGeometry, TubeGeometry, Vector3 } from 'three';
import type { Group } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { fairyProfile } from './fairyProfiles';
import { Glow } from './Primitives';
type P = [number, number, number];
function ellipsoid(position: P, scale: P, segments = 16) {
  const geometry = new SphereGeometry(1, segments, 12); geometry.applyMatrix4(new Matrix4().compose(new Vector3(...position), new Quaternion(), new Vector3(...scale))); return geometry;
}
function curve(points: P[], radius: number, segments = 16) { return new TubeGeometry(new CatmullRomCurve3(points.map(p => new Vector3(...p))), segments, radius, 6, false); }
function join(parts: BufferGeometry[]) { const result = mergeGeometries(parts, false)!; parts.forEach(part => part.dispose()); return result; }
export function gownGeometry(style: number, outer = false) {
  const positions: number[] = [], indices: number[] = [], rows = 20, columns = 56;
  const sweep = [.5, .46, .38, .35, .58, .44, .37, .5, .42, .48][style];
  for (let row = 0; row <= rows; row++) for (let column = 0; column <= columns; column++) {
    const t = row / rows, a = column / columns * Math.PI * 2;
    const scallop = Math.cos(a * (5 + style % 4));
    const radius = (.145 + sweep * t ** 1.45) * (1 + Math.sin(a * (14 + style % 3 * 3)) * .045 * t) * (outer ? 1.055 : 1);
    const hem = Math.pow(t, 5) * (.035 + (style % 3) * .013) * scallop;
    positions.push(Math.cos(a) * radius, 1.13 - t * 1.04 + hem, Math.sin(a) * radius * .78);
    if (row < rows && column < columns) { const i = row * (columns + 1) + column; indices.push(i, i + columns + 1, i + 1, i + 1, i + columns + 1, i + columns + 2); }
  }
  const geometry = new BufferGeometry(); geometry.setAttribute('position', new Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}
function wingPoint(u: number, t: number, style: number, lower = false): P {
  const length = [.94, 1.05, 1.17, .98, .91, 1.04, 1.1, 1.16, .87, 1][style];
  const width = Math.sin(Math.PI * t) ** (.7 + style % 3 * .15) * (lower ? .26 : .4 + style % 3 * .04);
  return [t * length + u * width * .65, (lower ? -.42 : .86 + style % 2 * .15) * t + u * width, -.03 + Math.sin(t * Math.PI) * .13 + u * u * .12];
}
function wingGeometry(style: number) {
  const positions: number[] = [], indices: number[] = [], rows = 20, columns = 8;
  for (const lower of [false, true]) {
    const offset = positions.length / 3;
    for (let row = 0; row <= rows; row++) for (let column = 0; column <= columns; column++) {
      positions.push(...wingPoint(column / columns * 2 - 1, row / rows, style, lower));
      if (row < rows && column < columns) { const i = offset + row * (columns + 1) + column; indices.push(i, i + 1, i + columns + 1, i + 1, i + columns + 2, i + columns + 1); }
    }
  }
  const geometry = new BufferGeometry(); geometry.setAttribute('position', new Float32BufferAttribute(positions, 3)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}
function wingVeins(style: number) {
  const parts: BufferGeometry[] = [];
  for (const lower of [false, true]) for (const u of [-1, -.45, .05, .55, 1]) parts.push(curve(Array.from({ length: 13 }, (_, i) => wingPoint(u, i / 12, style, lower)), .0035, 16));
  return join(parts);
}
function hairCurve(points: P[], radius: number, segments = 20) {
  const path = new CatmullRomCurve3(points.map(p => new Vector3(...p))), geometry = new TubeGeometry(path, segments, radius, 6, false), position = geometry.attributes.position;
  for (let row = 0; row <= segments; row++) { const center = path.getPointAt(row / segments), taper = .12 + .88 * (1 - (row / segments) ** 5); for (let side = 0; side <= 6; side++) { const i = row * 7 + side; position.setXYZ(i, center.x + (position.getX(i) - center.x) * taper, center.y + (position.getY(i) - center.y) * taper, center.z + (position.getZ(i) - center.z) * taper); } }
  geometry.computeVertexNormals(); return geometry;
}
function hairGeometry(style: string) {
  const parts: BufferGeometry[] = [];
  const cap = new SphereGeometry(1, 24, 14, 0, Math.PI * 2, 0, Math.PI * .34); cap.scale(.178, .23, .163); cap.translate(0, 1.78, -.015); parts.push(cap);
  const short = style === 'bob' || style === 'wavybob', tied = style === 'bun' || style === 'crown';
  if (tied) { parts.push(ellipsoid([style === 'crown' ? -.1 : 0, 1.9, -.14], [.13, .12, .12])); }
  for (let i = 0; i < (tied ? 9 : 18); i++) {
    const a = .45 + i / (tied ? 8 : 17) * (Math.PI * 2 - .9), x = Math.sin(a) * .154, z = -Math.cos(a) * .132;
    // Keep the central face open, with fringe and side locks framing it.
    if (z > .06 && Math.abs(x) < .1) continue;
    const length = tied ? .22 : short ? .33 : style === 'ponytail' ? .38 : .64 + Math.sin(i * 2) * .08;
    const wave = style === 'straight' ? .005 : style === 'cascade' ? .07 : style === 'waves' ? .055 : .03;
    parts.push(hairCurve([[x * .4, 1.98, z * .4], [x, 1.85, z], [x + Math.sin(i) * wave, 1.67, z + .02], [x + Math.sin(i * 2) * wave, 1.8 - length, z + (short ? -.01 : -.025)]], .025 + i % 3 * .004));
  }
  if (style === 'ponytail') for (let i = 0; i < 6; i++) parts.push(hairCurve([[0, 1.97, -.14], [.12 + i * .008, 1.8, -.22], [.17, 1.45, -.24], [.28, 1.2, -.1]], .024));
  if (style === 'braid' || style === 'sidebraid') for (let i = 0; i < 3; i++) parts.push(hairCurve(Array.from({ length: 18 }, (_, n) => [.17 + Math.sin(n * 1.5 + i * 2.1) * .023, 1.86 - n * .044, (style === 'braid' ? -.12 : .08) + Math.cos(n * 1.5 + i * 2.1) * .024] as P), .022, 30));
  const result = join(parts); const position = result.attributes.position;
  for (let i = 0; i < position.count; i++) position.setXYZ(i, position.getX(i) * .9, 1.79 + (position.getY(i) - 1.79) * .9, position.getZ(i) * .9);
  result.computeVertexNormals(); return result;
}
export function faceGeometry() {
  const geometry = new SphereGeometry(1, 32, 24, 0, Math.PI, 0, Math.PI);
  const position = geometry.attributes.position, uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
    uv.setXY(i, (x + 1) / 2, (y + 1) / 2);
    const nose = Math.exp(-((x / .18) ** 2 + ((y + .16) / .22) ** 2)) * .023;
    position.setXYZ(i, x * .148, 1.79 + y * .197, z * .132 + nose + .001);
  }
  geometry.computeVertexNormals(); return geometry;
}
function residentGeometry(hairStyle: string, style: number) {
  const skin = join([ellipsoid([0, 1.79, 0], [.148, .197, .131], 24), ellipsoid([0, 1.54, 0], [.058, .12, .058]), ...[-1, 1].map(side => ellipsoid([side * .151, 1.79, -.01], [.037, .064, .028])), ...[-1, 1].map(side => ellipsoid([side * .09, .075, .04], [.056, .054, .12]))]);
  const bodice = join([ellipsoid([0, 1.31, -.012], [.206, .27, .112]), ellipsoid([0, 1.13, 0], [.15, .14, .105])]);
  const eyes = join([-1, 1].map(side => ellipsoid([side * .065, 1.825, .121], [.032, .014, .008])));
  const pupils = join([-1, 1].map(side => ellipsoid([side * .065, 1.824, .13], [.009, .011, .004])));
  const lashes = join([-1, 1].map(side => curve([[side * .035, 1.833, .128], [side * .065, 1.839, .127], [side * .098, 1.83, .117]], .0028, 10)));
  const lips = ellipsoid([0, 1.716, .123], [.023, .006, .004]);
  const brows = join([-1, 1].map(side => curve([[side * .035, 1.866, .119], [side * .065, 1.87, .117], [side * .092, 1.862, .103]], .0025, 10)));
  const nose = ellipsoid([0, 1.773, .13], [.014, .022, .013]);
  const gems = join(Array.from({ length: style === 0 ? 9 : 7 }, (_, i) => { const a = i / (style === 0 ? 8 : 6) * Math.PI * 1.6 - .8; return ellipsoid([Math.sin(a) * .18, 1.98 + Math.cos(a * 2) * .012, Math.cos(a) * .135], [.019, style === 0 ? .035 : .018, .018], 10); }));
  const ornaments: BufferGeometry[] = [];
  for (const side of [-1, 1]) { ornaments.push(curve([[0, 1.12, .112], [side * .09, 1.28, .115], [side * .13, 1.47, .08]], .0055)); for (let i = 0; i < 5; i++) ornaments.push(ellipsoid([side * (.025 + i * .025), 1.15 + i * .065, .12], [.021, .038, .007], 8)); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = .145 + [.5, .46, .38, .35, .58, .44, .37, .5, .42, .48][style] * .85; ornaments.push(ellipsoid([Math.cos(a) * r, .2 + Math.cos(a * 2) * .025, Math.sin(a) * r * .78], [.022, .045, .013], 8)); }
  const embroidery = join(ornaments);
  const belt = join(Array.from({ length: 24 }, (_, i) => { const a = i / 24 * Math.PI * 2; return ellipsoid([Math.cos(a) * .155, 1.12, Math.sin(a) * .11], [.014, .018, .014], 8); }));
  const arms = [-1, 1].map(side => join([curve([[side * .19, 1.44, 0], [side * .29, 1.22, .02], [side * .3, 1.03, .12], [side * .22, .96, .22]], .035), ellipsoid([side * .22, .96, .23], [.033, .055, .025])]));
  return { brows, nose, embroidery, skin, bodice, eyes, pupils, lashes, lips, gems, belt, arms, hair: hairGeometry(hairStyle), gown: gownGeometry(style), chiffon: gownGeometry(style, true), wings: wingGeometry(style), veins: wingVeins(style), face: faceGeometry() };
}
export function FairyResident({ id, working = false, animate = true }: { id: string; working?: boolean; animate?: boolean }) {
  const profile = fairyProfile(id), rig = useRef<Group>(null), head = useRef<Group>(null), left = useRef<Group>(null), right = useRef<Group>(null), skirt = useRef<Group>(null), trail = useRef<Group>(null);
  const geometry = useMemo(() => residentGeometry(profile.hairStyle, profile.style), [profile]);
  useEffect(() => () => { for (const value of Object.values(geometry)) if (Array.isArray(value)) value.forEach(g => g.dispose()); else value.dispose(); }, [geometry]);
  const particles = useMemo(() => Float32Array.from(Array.from({ length: 28 }, (_, i) => [Math.sin(i * 2.399) * (.3 + i % 4 * .13), .15 + i * .065, Math.cos(i * 2.399) * .55]).flat()), []);
  const light = useMemo(() => new Color(profile.accent).lerp(new Color('#fff4df'), .3), [profile]);
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime + profile.style * .7, ease = 1 - Math.exp(-Math.min(delta, .1) * 3.5);
    if (rig.current) { const goal = working ? .68 + (animate ? Math.sin(t * 1.45) * .09 : 0) : -.42 + (animate ? Math.sin(t * .8) * .012 : 0); rig.current.position.y += (goal - rig.current.position.y) * ease; rig.current.rotation.z = animate ? Math.sin(t * .55) * (working ? .025 : .008) : 0; }
    const flap = animate ? Math.sin(t * (working ? 4.1 : .85)) * (working ? .66 : .065) : 0;
    if (left.current) left.current.rotation.y = -.4 - flap; if (right.current) right.current.rotation.y = .4 + flap;
    if (head.current) head.current.rotation.y = 0;
    if (skirt.current) { const length = working ? 1 : .58; skirt.current.scale.y += (length - skirt.current.scale.y) * ease; skirt.current.position.y = 1.13 * (1 - skirt.current.scale.y); skirt.current.rotation.z = animate ? Math.sin(t * .9) * (working ? .03 : .006) : 0; skirt.current.rotation.y = animate ? Math.sin(t * .6) * .018 : 0; }
    if (trail.current) { trail.current.rotation.y = animate ? t * .18 : 0; trail.current.position.y = .22 + (animate ? Math.sin(t * .7) * .06 : 0); }
  });
  return <group name={`fairy-resident:${id}`} scale={id === 'coordinator' ? 1.15 : 1}>
    <mesh position={[0, .012, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[.4, .25, 1]}><circleGeometry args={[1, 24]} /><meshBasicMaterial color="#30483b" transparent opacity={working ? .08 : .18} depthWrite={false} /></mesh>
    <group ref={rig}>
      {[-1, 1].map(side => <group key={side} ref={side === -1 ? left : right} position={[side * .07, 1.35, -.13]} scale={[side, 1, 1]}>
        <mesh geometry={geometry.wings}><meshPhysicalMaterial color={profile.wing} side={DoubleSide} transparent opacity={.58} roughness={.2} metalness={.12} iridescence={1} iridescenceIOR={1.3} emissive={profile.aura} emissiveIntensity={working ? .22 : .08} depthWrite={false} /></mesh>
        <mesh geometry={geometry.veins}><meshStandardMaterial color={light} metalness={.35} roughness={.45} emissive={profile.wing} emissiveIntensity={.15} /></mesh>
      </group>)}
      <mesh geometry={geometry.skin} castShadow><meshStandardMaterial color={profile.skin} roughness={.7} /></mesh>
      <mesh geometry={geometry.bodice} castShadow><meshPhysicalMaterial color={profile.dress} sheen={1} sheenColor={profile.accent} sheenRoughness={.7} roughness={.6} /></mesh>
      <group ref={skirt}>
        <mesh geometry={geometry.gown} castShadow receiveShadow><meshPhysicalMaterial color={profile.dress} side={DoubleSide} sheen={1} sheenColor={profile.accent} sheenRoughness={.65} roughness={.6} metalness={.06} /></mesh>
        <mesh geometry={geometry.chiffon}><meshPhysicalMaterial color={profile.accent} transparent opacity={.2} side={DoubleSide} roughness={.5} sheen={1} depthWrite={false} /></mesh>
      </group>
      <mesh geometry={geometry.embroidery}><meshStandardMaterial color={profile.accent} metalness={.35} roughness={.5} /></mesh>
      <mesh geometry={geometry.belt}><meshStandardMaterial color={profile.accent} metalness={.55} roughness={.4} /></mesh>
      {geometry.arms.map((arm, i) => <group key={i} position={[0, working ? 0 : .14, working ? 0 : .14]} rotation={[-.18, 0, 0]}><mesh geometry={arm} castShadow><meshStandardMaterial color={profile.skin} roughness={.7} /></mesh></group>)}
      <group ref={head}>
        <mesh geometry={geometry.hair} castShadow><meshPhysicalMaterial color={profile.hair} roughness={.38} sheen={.65} sheenColor={profile.accent} sheenRoughness={.7} /></mesh>
        <mesh geometry={geometry.eyes}><meshStandardMaterial color="#fff6e9" roughness={.85} /></mesh>
        <mesh geometry={geometry.pupils}><meshStandardMaterial color="#6e625b" roughness={.8} /></mesh>
        <mesh geometry={geometry.lashes}><meshStandardMaterial color="#77615c" /></mesh>
        <mesh geometry={geometry.brows}><meshStandardMaterial color={profile.hair} /></mesh>
        <mesh geometry={geometry.nose}><meshStandardMaterial color={profile.skin} roughness={.85} /></mesh>
        <mesh geometry={geometry.lips}><meshStandardMaterial color="#c68e91" roughness={.9} /></mesh>
        <mesh geometry={geometry.gems}><meshStandardMaterial color={profile.accent} metalness={.4} roughness={.35} emissive={profile.aura} emissiveIntensity={.15} /></mesh>
      </group>
      <Glow color={profile.aura} size={working ? 1.15 : .5} />
    </group>
    {working && <group ref={trail}><points><bufferGeometry><bufferAttribute attach="attributes-position" args={[particles, 3]} /></bufferGeometry><pointsMaterial color={profile.aura} size={.035} transparent opacity={.8} blending={AdditiveBlending} depthWrite={false} /></points></group>}
  </group>;
}
