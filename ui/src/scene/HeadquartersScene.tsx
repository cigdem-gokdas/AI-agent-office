import { Component, memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentRef, ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { BakeShadows, OrbitControls, useProgress } from '@react-three/drei';
import { PerspectiveCamera, Raycaster, Vector2, Vector3 } from 'three';
import type { Group } from 'three';
import { RoomMap } from './RoomMap';
import { useHeadquarters } from '../state/store';
import { canShowWorking } from '../data/types';
import type { AgentSnapshot } from '../data/types';
import { roomDesign } from './layout';

import { DESK_RESIDENT_POSITION, backgroundResetsOverview, overviewNudge } from './deskStaging';
import { RoomAccents } from './RoomAccents';
import { FloralTerraces } from './FloralTerraces';
import { FairyResident } from './FairyResident';
import { PerformanceSampler } from './Performance';
import { qualityProfiles, scenicAngles, cameraDistanceLimit } from './quality';
import { Block, Glow, Lantern, Orb, Ring } from './Primitives';
import { RoomProps } from './RoomProps';
import { RoomArchitecture } from './RoomArchitecture';
import { Branch, RenderCadence, Woodland } from './Woodland';
import { Model } from './Assets';
import { HelperStations, helperPosition } from './Helpers';

const Atelier = memo(function Atelier({ agent, index, working, animate, now }: { agent: AgentSnapshot; index: number; working: boolean; animate: boolean; now: number }) {
  const selected = useHeadquarters(state => state.selected), focused = useHeadquarters(state => state.focused), snapshot = useHeadquarters(state => state.snapshot);
  const inspect = useHeadquarters(state => state.inspect);
  const design = roomDesign(agent.id, index), central = agent.id === 'coordinator';
  const room = useRef<Group>(null), [hover, setHover] = useState(false);
  const approvals = snapshot.approvals?.some(item => item.agent === agent.id && item.status === 'pending');
  useFrame(({ clock }, delta) => {
    if (!room.current) return;
    const goal = animate && !focused ? Math.sin(clock.elapsedTime * .22 + index) * .012 : 0;
    room.current.rotation.y += (goal - room.current.rotation.y) * Math.min(1, delta * 4);
    room.current.position.y += ((hover && animate ? .045 : 0) - room.current.position.y) * Math.min(1, delta * 6);
  });
  useEffect(() => () => { document.body.style.cursor = ''; }, []);
  return <group name={`room:${agent.id}`} position={design.position} onClick={event => { event.stopPropagation(); inspect(agent.id); }} onPointerOver={event => { event.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer'; }} onPointerOut={() => { setHover(false); document.body.style.cursor = ''; }}>
    <group ref={room}>
      <group scale={[1.14, 1, 1.14]}>
      <RoomArchitecture id={agent.id} color={design.color} selected={selected === agent.id} hover={hover} />
      <Suspense fallback={null}><group position={[0, 0, 0]}><RoomProps id={agent.id} color={design.color} detailed={true} /></group></Suspense>
      <RoomAccents id={agent.id} color={design.color} />
      <Suspense fallback={null}></Suspense>
      <Model name={agent.id === 'workshop' || agent.id === 'studio' ? 'deskcorner' : 'desk'} height={.78} position={[.1, .1, .16]} />
      <Model name={agent.id === 'workshop' ? 'chairdesk' : 'chaircushion'} height={.85} position={[.1, .1, -.8]} rotation={Math.PI} />
      <Model name="lamproundtable" height={.42} position={[-.6, .89, .4]} />
      <Block position={[.4, .9, .65]} scale={[.32, .015, .24]} color="#f5dfbd" rotation={-.1} />
      <Lantern position={[-.7, 1.17, .35]} />
      </group>
      <group position={DESK_RESIDENT_POSITION} rotation={[0, -.1, 0]} onClick={event => { event.stopPropagation(); inspect(agent.id, 'agent'); }}>
        <FairyResident id={agent.id} animate={animate} working={working} />
      </group>
      <HelperStations agent={agent} now={now} animate={animate} color={design.color} />
      <Model name={agent.id === 'studio' ? 'flower-redc' : 'flower-purpleb'} height={.6} position={[-1.85, .1, 1.5]} />
      <Model name={index % 2 ? 'mushroom-tangroup' : 'mushroom-redgroup'} height={.48} position={[1.85, .1, 1.4]} />
      {(central || focused === agent.id) && <group><pointLight position={[-1.4, 2.15, 1]} color="#ffe0b2" intensity={2.2} distance={6.5} decay={2} /><pointLight position={[1.6, 2.7, -1.2]} color={design.color} intensity={1.2} distance={6} decay={2} /></group>}
      {agent.status === 'blocked' && <Orb position={[0, 2.9, .2]} scale={[.06, .06, .06]} color="#e4aa85" glow={.5} />}
      {approvals && <group position={[0, 3.2, .1]}><Ring radius={.15} vertical color="#ffd39b" glow={.6} /><Glow color="#ffd39b" size={.65} /></group>}
    </group>
    <Branch radius={.18} points={[[0, -.4, -1], [-design.position[0] * .14, -1.15, -2], [-design.position[0] * .25, -2, -2.5]]} />
  </group>;
});
const Village = memo(function Village({ now, animate }: { now: number; animate: boolean }) {
  const snapshot = useHeadquarters(state => state.snapshot);
  return <><Woodland animate={animate} /><FloralTerraces />{snapshot.agents.map((agent, index) => <Atelier key={agent.id} agent={agent} index={index} working={canShowWorking(agent, snapshot, now)} animate={animate} now={now} />)}</>;
});
function BackgroundReset() {
  const { gl, camera, scene } = useThree();
  useEffect(() => {
    const ray = new Raycaster(), pointer = new Vector2();
    const reset = (event: MouseEvent) => {
      if (!backgroundResetsOverview(event.detail, event.button)) return;
      const rect = gl.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      ray.setFromCamera(pointer, camera);
      const roomHit = ray.intersectObjects(scene.children, true).some(hit => { let object: typeof hit.object | null = hit.object; while (object) { if (object.name.startsWith('room:')) return true; object = object.parent; } return false; });
      if (!roomHit) useHeadquarters.getState().resetView();
    };
    gl.domElement.addEventListener('dblclick', reset);
    return () => gl.domElement.removeEventListener('dblclick', reset);
  }, [gl, camera, scene]);
  return null;
}
function ViewControls() {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { focused, resetCamera, reducedMotion, panelOpen, snapshot } = useHeadquarters();
  const { camera, size, invalidate } = useThree();
  const destination = useRef({ position: new Vector3(), target: new Vector3(), moving: true });
  const pivot = useRef(new Vector3(0, 4, 0));
  const index = snapshot.agents.findIndex(agent => agent.id === focused);
  useEffect(() => {
    const target = focused ? new Vector3(...roomDesign(focused, index).position).add(new Vector3(0, 1.1, 0)) : new Vector3(0, 4, 1);
    const mobile = size.width < 760, helperCount = snapshot.agents.find(agent => agent.id === focused)?.helpers?.length || 0;
    const factor = focused ? Math.max(1, (helperCount ? 1.1 : .9) / (size.width / size.height)) : Math.max(1, 1.3 / (size.width / size.height));
    const offset = focused ? new Vector3(.7, 3.4, helperCount ? 10.2 : 8.7).multiplyScalar(factor) : new Vector3(2, 12, 33).multiplyScalar(factor);
    useHeadquarters.getState().setCameraMoving(true);
    pivot.current.copy(target); destination.current = { target, position: target.clone().add(offset), moving: true };
    if (camera instanceof PerspectiveCamera) {
      const panel = panelOpen ? size.width >= 1800 ? 380 : size.width > 1100 ? 350 : 320 : 0;
      camera.setViewOffset(size.width, size.height, mobile ? 0 : panel * .42 - overviewNudge(size.width, !!focused), mobile && panelOpen ? size.height * .15 : 0, size.width, size.height);
      camera.updateProjectionMatrix();
    }
    if (reducedMotion) { camera.position.copy(destination.current.position); controls.current?.target.copy(target); controls.current?.update(); destination.current.moving = false; useHeadquarters.getState().setCameraMoving(false); }
    invalidate();
  }, [focused, resetCamera, reducedMotion, panelOpen, camera, size.width, size.height, invalidate, index, snapshot.agents]);
  useFrame((_, delta) => {
    const control = controls.current, goal = destination.current; if (!control) return;
    const angle = control.getAzimuthalAngle();
    const world = document.querySelector<HTMLElement>('.cinematic-world');
    if (world) { world.style.setProperty('--scenic-x', `${Math.max(-22, Math.min(22, angle * 27))}px`); world.style.setProperty('--scenic-y', `${(control.getPolarAngle() - .85) * 14}px`); }
    if (goal.moving) {
      const t = 1 - Math.exp(-Math.min(delta, .05) * 5); camera.position.lerp(goal.position, t); control.target.lerp(goal.target, t); control.update();
      if (camera.position.distanceTo(goal.position) < .02 && control.target.distanceTo(goal.target) < .02) { camera.position.copy(goal.position); control.target.copy(goal.target); goal.moving = false; useHeadquarters.getState().setCameraMoving(false); }
      invalidate();
    } else {
      const range = focused ? 1 : 5;
      control.target.x = Math.max(pivot.current.x - range, Math.min(pivot.current.x + range, control.target.x));
      control.target.z = Math.max(pivot.current.z - range, Math.min(pivot.current.z + range, control.target.z));
      control.target.y = Math.max(pivot.current.y - .5, Math.min(pivot.current.y + .8, control.target.y));
    }
  });
  return <OrbitControls ref={controls} makeDefault minDistance={focused ? 3.5 : 22} maxDistance={cameraDistanceLimit(size.width, size.height, !!focused, snapshot.agents.find(agent => agent.id === focused)?.helpers?.length || 0)} {...scenicAngles(!!focused)} enablePan screenSpacePanning={false} panSpeed={.5} rotateSpeed={.6} zoomSpeed={.65} enableDamping dampingFactor={.09} onStart={() => { destination.current.moving = false; useHeadquarters.getState().setCameraMoving(false); }} />;
}
class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
interface LabelPosition { id: string; parent?: string; name: string; x: number; y: number; visible: boolean; }
function LabelProjection({ agents, onProject }: { agents: AgentSnapshot[]; onProject(labels: LabelPosition[]): void }) {
  const previous = useRef(''), point = useMemo(() => new Vector3(), []), focused = useHeadquarters(state => state.focused);
  const showHelpers = useHeadquarters(state => state.detailLevel === 'helper');
  useFrame(({ camera, size }) => {
    const labels: LabelPosition[] = [];
    agents.forEach((agent, index) => {
      const [x, y, z] = roomDesign(agent.id, index).position;
      point.set(x, y + .05, z + 2.1).project(camera);
      labels.push({ id: agent.id, name: agent.name, x: (point.x + 1) * size.width / 2, y: (1 - point.y) * size.height / 2, visible: (!focused || focused === agent.id) && point.z > -1 && point.z < 1 && Math.abs(point.x) < .98 && Math.abs(point.y) < .97 });
      if (focused === agent.id) (agent.helpers || []).forEach((helper, index, helpers) => {
        const position = helperPosition(index, helpers.length); point.set(x + position[0], y + .95, z + position[2]).project(camera);
        labels.push({ id: helper.id, parent: agent.id, name: helper.id.replaceAll('-', ' '), x: (point.x + 1) * size.width / 2, y: (1 - point.y) * size.height / 2, visible: showHelpers && point.z > -1 && point.z < 1 && Math.abs(point.x) < .98 && Math.abs(point.y) < .97 });
      });
    });
    const key = labels.map(label => `${label.id},${Math.round(label.x)},${Math.round(label.y)},${label.visible}`).join(';');
    if (key !== previous.current) { previous.current = key; onProject(labels); }
  }); return null;
}
export default function HeadquartersScene({ now }: { now: number }) {
  const { snapshot, selected, focused, inspect, inspectHelper, reducedMotion, cameraMoving, quality } = useHeadquarters();
  const [labels, setLabels] = useState<LabelPosition[]>([]), [visible, setVisible] = useState(!document.hidden);
  const onProject = useCallback((next: LabelPosition[]) => setLabels(next), []);
  useEffect(() => { const listener = () => setVisible(!document.hidden); document.addEventListener('visibilitychange', listener); return () => document.removeEventListener('visibilitychange', listener); }, []);
  const animate = !reducedMotion && visible;
  const profile = qualityProfiles[quality];
  const { active: assetsLoading } = useProgress();
  return <SceneBoundary fallback={<RoomMap fallback />}>
    <Canvas shadows={profile.shadows} dpr={[.8, profile.dpr]} frameloop={visible ? 'demand' : 'never'} camera={{ position: [2, 16, 34], fov: 40, near: .2, far: 450 }} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }} onCreated={({ gl }) => { gl.toneMappingExposure = .95; gl.setClearColor('#789b91', 0); }} fallback={<p>Use the Room map control for a text alternative.</p>}>
      <fog attach="fog" args={['#a8c6b4', 40, 115]} />
      <ambientLight intensity={.5} color="#c7dfce" /><hemisphereLight args={['#e3eee0', '#51695b', .8]} />
      <directionalLight position={[-12, 25, 14]} intensity={1.4} color="#ffe7ba" castShadow={profile.shadows} shadow-mapSize={[profile.shadowSize, profile.shadowSize]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={20} shadow-camera-bottom={-15} shadow-normalBias={.06} />
      <directionalLight position={[8, 15, -10]} intensity={.45} color="#b9dfe0" />
      <Suspense fallback={null}><Village now={now} animate={animate} /><BakeShadows /></Suspense>
      <BackgroundReset /><ViewControls /><PerformanceSampler active={animate} /><RenderCadence active={animate} /><LabelProjection agents={snapshot.agents} onProject={onProject} />
    </Canvas>
    <div className="projected-room-labels" data-assets-ready={!assetsLoading} data-camera-moving={cameraMoving} data-view={focused ? 'focused' : 'overview'}>{labels.filter(label => label.visible).map(label => <button key={`${label.parent || ''}:${label.id}`} className={`room-label ${label.parent ? 'helper-label' : selected === label.id ? 'is-selected' : ''}`} style={{ left: label.x, top: label.y }} onClick={() => label.parent ? inspectHelper(label.parent, label.id) : inspect(label.id)} aria-label={label.parent ? `Inspect companion ${label.id}` : `Inspect ${label.name}'s room`} aria-pressed={!label.parent && focused === label.id}><span className="status-dot" /><span>{label.name}</span><span className="tiny-star">{label.parent ? '☾' : '✧'}</span></button>)}</div>
    {assetsLoading && <div className="asset-loading" role="status">Opening local scenery…</div>}
    {focused && <div className="focus-room-title">Drag to orbit this room · Scroll to approach · Right-drag to pan</div>}
  </SceneBoundary>;
}
