import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture } from 'three';
import type { Group } from 'three';
import { useHeadquarters } from '../state/store';
import { canShowHelperWorking } from '../data/types';
import type { AgentSnapshot } from '../data/types';
import { RestingRabbit } from './Companions';
import { Block, Glow, Orb } from './Primitives';
import type { Point } from './Primitives';
export function helperPosition(index: number, count: number): Point {
  const side = index % 2 ? 1 : -1;
  return index === count - 1 && count % 2 ? [0, .1, -1.65] : [side * 1.95, .1, -.8 + Math.floor(index / 2) * 1.35];
}
function SleepMark({ animate }: { animate: boolean }) {
  const sprite = useRef<import('three').Sprite>(null);
  useFrame(({ clock }) => { if (sprite.current) sprite.current.position.y = .78 + (animate ? Math.sin(clock.elapsedTime * .8) * .04 : 0); });
  const texture = useMemo(() => { const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 64; const ctx = canvas.getContext('2d')!; ctx.font = 'italic 32px Georgia'; ctx.strokeStyle = '#50604c'; ctx.lineWidth = 3; ctx.strokeText('z z z', 8, 42); ctx.fillStyle = '#fff0ce'; ctx.fillText('z z z', 8, 42); return new CanvasTexture(canvas); }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return <sprite ref={sprite} position={[.35, .78, .12]} scale={[.52, .26, 1]}><spriteMaterial map={texture} transparent depthWrite={false} /></sprite>;
}
function SleepingCompanion({ animate }: { animate: boolean }) {
  const root = useRef<Group>(null);
  useFrame(({ clock }) => { if (root.current) root.current.scale.y = 1 + (animate ? Math.sin(clock.elapsedTime * .9) * .018 : 0); });
  return <group ref={root}><RestingRabbit /><SleepMark animate={animate} /></group>;
}
function AlertRabbit({ animate }: { animate: boolean }) {
  const root = useRef<Group>(null);
  useFrame(({ clock }) => { if (root.current) root.current.rotation.y = animate ? Math.sin(clock.elapsedTime * 1.8) * .12 : 0; });
  return <group ref={root}>
    <Orb position={[0, .3, 0]} scale={[.2, .32, .2]} color="#f0e4ce" />
    <Orb position={[0, .65, .04]} scale={[.21, .2, .2]} color="#f5e7d6" />
    {[-1, 1].map(side => <group key={side}><Orb position={[side * .09, .95, 0]} scale={[.055, .25, .06]} color="#ecd7cc" /><Orb position={[side * .09, .68, .214]} scale={[.023, .03, .012]} color="#4d4147" /></group>)}
    <Orb position={[0, .61, .23]} scale={[.025, .02, .014]} color="#c38f99" /><Glow color="#f6d8a5" size={1} />
  </group>;
}
export function HelperStations({ agent, now, animate, color }: { agent: AgentSnapshot; now: number; animate: boolean; color: string }) {
  const snapshot = useHeadquarters(state => state.snapshot), inspectHelper = useHeadquarters(state => state.inspectHelper);
  const helpers = agent.helpers || [];
  return <>{helpers.map((helper, index) => {
    const awake = canShowHelperWorking(helper, agent, snapshot, now);
    return <group key={helper.id} name={`helper:${helper.id}`} position={helperPosition(index, helpers.length)} onClick={event => { event.stopPropagation(); inspectHelper(agent.id, helper.id); }}>
      <Block position={[0, .03, 0]} scale={[.72, .06, .72]} color={color} />
      <group scale={.8} rotation={[0, -index * .2, 0]}>{awake ? <AlertRabbit animate={animate} /> : <SleepingCompanion animate={animate} />}</group>
      <Block position={[0, .29, -.35]} scale={[.5, .06, .24]} color="#bc9575" />
      <Block position={[0, .34, -.34]} scale={[.2, .015, .16]} color="#f3dfbc" />
    </group>;
  })}</>;
}
