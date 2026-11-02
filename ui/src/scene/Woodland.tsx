import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { AdditiveBlending, CanvasTexture, CatmullRomCurve3, Object3D, RepeatWrapping, SRGBColorSpace, Vector3 } from 'three';
import type { InstancedMesh, ShaderMaterial } from 'three';
import { gold, Glow, Lantern, Orb, Ring } from './Primitives';
import type { Point } from './Primitives';
import { useHeadquarters } from '../state/store';
import { qualityProfiles } from './quality';
import { roomDesigns } from './layout';
import { Model } from './Assets';
export function RenderCadence({ active }: { active: boolean }) {
  const quality = useHeadquarters(state => state.quality);
  const invalidate = useThree(state => state.invalidate);
  useEffect(() => { if (!active) return; const timer = setInterval(invalidate, 1000 / qualityProfiles[quality].fps); return () => clearInterval(timer); }, [active, invalidate, quality]); return null;
}
let bark: CanvasTexture | undefined;
function barkTexture() {
  if (bark) return bark;
  const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 512;
  const context = canvas.getContext('2d')!; context.fillStyle = '#b4a17d'; context.fillRect(0, 0, 128, 512);
  for (let i = 0; i < 280; i++) { const n = Math.sin(i * 42.31) * 43758.5, v = n - Math.floor(n); context.strokeStyle = i % 4 ? '#514c3f48' : '#71835866'; context.lineWidth = 1 + v * 3; context.beginPath(); context.moveTo(v * 128, (i * 61) % 512); context.bezierCurveTo(v * 128 - 8, (i * 61) % 512 + 20, v * 128 + 6, (i * 61) % 512 + 35, v * 128, (i * 61) % 512 + 65); context.stroke(); }
  bark = new CanvasTexture(canvas); bark.wrapS = bark.wrapT = RepeatWrapping; bark.repeat.set(2, 2); bark.colorSpace = SRGBColorSpace; return bark;
}
export function Branch({ points, radius = .3, color = '#62483e' }: { points: Point[]; radius?: number; color?: string }) {
  const key = points.map(point => point.join(',')).join(';');
  const curve = useMemo(() => new CatmullRomCurve3(key.split(';').map(point => new Vector3(...point.split(',').map(Number) as Point))), [key]);
  return <mesh castShadow receiveShadow><tubeGeometry args={[curve, 18, radius, 7, false]} /><meshStandardMaterial map={radius > .15 ? barkTexture() : undefined} color={color} roughness={.95} /></mesh>;
}
function Footbridge({ from, to }: { from: Point; to: Point }) {
  const planks = useRef<InstancedMesh>(null);
  const signature = [...from, ...to].join(',');
  const points = useMemo(() => { const v = signature.split(',').map(Number); const a = new Vector3(...v.slice(0, 3) as Point), b = new Vector3(...v.slice(3) as Point); const mid = a.clone().lerp(b, .5); mid.y -= .3; const path = new CatmullRomCurve3([a, mid, b]); return Array.from({ length: 20 }, (_, i) => path.getPoint(i / 19)); }, [signature]);
  useEffect(() => { const dummy = new Object3D(); points.forEach((point, i) => { dummy.position.copy(point); dummy.rotation.y = Math.atan2(to[0] - from[0], to[2] - from[2]); dummy.updateMatrix(); planks.current?.setMatrixAt(i, dummy.matrix); }); if (planks.current) { planks.current.instanceMatrix.needsUpdate = true; planks.current.computeBoundingSphere(); } }, [points, signature]);
  return <group>
    <instancedMesh ref={planks} args={[undefined, undefined, 20]} castShadow receiveShadow><boxGeometry args={[.8, .09, .23]} /><meshStandardMaterial color="#bd9269" roughness={.8} /></instancedMesh>
    {[-1, 1].map(side => <Branch key={side} radius={.018} color={gold} points={points.map(point => [point.x + side * .43, point.y + .45, point.z] as Point)} />)}
    {[0, 5, 10, 15, 19].map(i => <group key={i} position={points[i]}><Lantern position={[.43, .5, 0]} /></group>)}
  </group>;
}
export function Fireflies({ animate }: { animate: boolean }) {
  const material = useRef<ShaderMaterial>(null);
  const positions = useMemo(() => Float32Array.from(Array.from({ length: 170 }, (_, i) => [Math.sin(i * 2.399) * (4 + i % 12), -1 + (i % 19) * .76, Math.cos(i * 2.399) * (3 + i % 11)]).flat()), []);
  const uniforms = useMemo(() => ({ phase: { value: 0 } }), []);
  useFrame((_, delta) => { if (animate && material.current) material.current.uniforms.phase.value += Math.min(delta, .1); });
  return <points frustumCulled={false}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><shaderMaterial ref={material} uniforms={uniforms} transparent depthWrite={false} blending={AdditiveBlending}
    vertexShader={'uniform float phase; varying float shine; void main(){vec3 p=position;p.x+=sin(phase*.3+p.y)*.2;p.y+=sin(phase*.5+p.z)*.18;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(100./-mv.z,1.8,7.);shine=.5+.5*sin(phase+p.x*3.);}'}
    fragmentShader={'varying float shine;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.02,d);gl_FragColor=vec4(1.,.8,.49,a*(.4+shine*.5));}'} /></points>;
}
export const Woodland = memo(function Woodland({ animate }: { animate: boolean }) {
  return <>
    <Environment files="/assets/vendor/sunrise-1k.hdr" environmentIntensity={.45} />
    {/* Architecture grows from structural roots; illustrated layers provide the canopy and horizon. */}
    <Branch radius={.85} color="#6d6650" points={[[0, -12, -9], [-1, -2, -9], [0, 5, -10], [1, 10, -13]]} />
    {Object.entries(roomDesigns).map(([id, design]) => <Branch key={`root-${id}`} radius={.3} color="#71624c" points={[[0, -5, -9], [design.position[0] * .55, design.position[1] - 1.5, design.position[2] * .5 - 3], [design.position[0], design.position[1] - .4, design.position[2]]]} />)}
    <mesh position={[0, -1.25, 4]} rotation={[-Math.PI / 2, 0, -.12]} scale={[1.6, 8, 1]}><circleGeometry args={[1, 40]} /><meshPhysicalMaterial color="#8dcbd1" metalness={.5} roughness={.2} transparent opacity={.8} /></mesh>
    <Model name="cliff-waterfall-rock" height={.8} position={[0, -2, 9]} scale={[.4, 1, .4]} />
    <Model name="bridge-woodround" height={1.15} position={[0, -1.15, 6.9]} rotation={Math.PI / 2} scale={[1.1, 1, 1.25]} />
    {Object.entries(roomDesigns).filter(([id]) => id !== 'coordinator').map(([id, design]) => {
      const [x, y, z] = design.position;
      return <Footbridge key={id} from={[x * .4, 2.7 + y * .15, z * .4]} to={[x * .8, y - .25, z * .8]} />;
    })}
    <Fireflies animate={animate} />
  </>;
});
