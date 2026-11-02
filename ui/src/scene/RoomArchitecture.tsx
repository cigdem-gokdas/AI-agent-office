import { DoubleSide } from 'three';
import { Block, gold, Lantern, Orb, Ring, Round, Stem } from './Primitives';
import { Branch } from './Woodland';
import { Garland } from './Garland';
export function RoomArchitecture({ id, color, selected, hover }: { id: string; color: string; selected: boolean; hover: boolean }) {
  const broad = ['workshop', 'studio', 'guardian'].includes(id), rectangle = ['library', 'workshop', 'archive', 'post'].includes(id);
  const width = broad ? 5.5 : id === 'library' ? 4.9 : 4.25, radius = broad ? 2.7 : 2.2;
  const tint = id === 'guardian' ? '#89939e' : id === 'gallery' ? '#d3c4a8' : '#bb936e';
  return <>
    {rectangle ? <><Block position={[0, -.16, 0]} scale={[width, .3, 4]} color="#735347" /><Block position={[0, .02, 0]} scale={[width - .1, .07, 3.9]} color={tint} />{Array.from({ length: 10 }, (_, i) => <Block key={i} position={[-width / 2 + .22 + i * (width - .44) / 9, .065, 0]} scale={[.015, .01, 3.8]} color="#97735d" />)}</>
      : <><Round position={[0, -.16, 0]} radius={radius} height={.32} color="#71544b" sides={id === 'guardian' ? 8 : id === 'coordinator' ? 6 : 40} /><Round position={[0, .02, 0]} radius={radius - .07} height={.07} color={tint} sides={id === 'guardian' ? 8 : id === 'coordinator' ? 6 : 40} /></>}
    <Ring radius={rectangle ? 1.8 : radius - .1} position={[0, .08, 0]} color={color} glow={selected || hover ? .8 : .2} width={.022} />
    {id === 'library' ? <>
      <Block position={[0, 1.24, -1.78]} scale={[4.7, 2.4, .13]} color="#655274" />
      {[-1, 1].map(side => <group key={side}><Block position={[side * 2.24, 1.24, -.7]} scale={[.12, 2.4, 2.2]} color="#756080" /><Branch color={gold} radius={.055} points={[[side * 2.3, 0, 1.4], [side * 2.3, 2.4, .1], [0, 3.2, -1.5]]} /></group>)}
      <Block position={[0, 2.58, -1.65]} scale={[5, .15, .32]} color={gold} />
    </> : id === 'observatory' ? <>
      <Round position={[0, -.65, 0]} radius={1.35} height={1.2} color="#798d98" sides={8} />
      {[0, 1, 2, 3, 4].map(i => <Stem key={i} from={[Math.cos(i * Math.PI / 4) * 2, .1, -Math.sin(i * Math.PI / 4) * 1.7]} to={[Math.cos(i * Math.PI / 4) * 1.8, 2.8, -Math.sin(i * Math.PI / 4) * 1.5]} color={gold} radius={.07} />)}
      <mesh position={[0, 2.65, -.1]}><sphereGeometry args={[2, 24, 12, Math.PI / 2, Math.PI, 0, Math.PI / 2]} /><meshStandardMaterial color="#4d708b" side={DoubleSide} metalness={.55} roughness={.4} /></mesh>
      <Ring position={[0, 2.7, -.1]} radius={2} color={gold} />
    </> : id === 'workshop' ? <>
      <Block position={[0, 1.1, -1.75]} scale={[5.4, 2.1, .15]} color="#426c61" />
      {[-1, 1].map(side => <group key={side}><Block position={[side * 2.6, 1.3, -.7]} scale={[.13, 2.6, .14]} color={gold} /><Block position={[side * 1.3, 2.65, -.45]} scale={[2.9, .1, 2.7]} rotation={side * .12} color="#7c9d8d" /></group>)}
      <Block position={[0, 2.35, -1.6]} scale={[5.5, .14, .2]} color="#c6a578" />
    </> : id === 'studio' ? <>
      <mesh position={[0, 1.12, -.4]}><cylinderGeometry args={[2.3, 2.3, 2.2, 32, 1, true, Math.PI / 2, Math.PI]} /><meshStandardMaterial color="#98647f" side={DoubleSide} /></mesh>
      {[0, 1, 2, 3, 4].map(i => <Branch key={i} color={i % 2 ? '#e4b4c3' : gold} radius={.07} points={[[Math.cos(i * .785) * 2.5, .1, -Math.sin(i * .785) * 1.7], [Math.cos(i * .785) * 2.3, 2.1, -Math.sin(i * .785) * 1.9], [0, 3.2, -.6]]} />)}
    </> : id === 'gallery' ? <>
      {[-1, 1].flatMap(side => [-1.1, 1.1].map(z => <group key={`${side}-${z}`}><Round position={[side * 1.65, 1.15, z]} radius={.12} height={2.3} color="#d9cab0" sides={10} /><Round position={[side * 1.65, .13, z]} radius={.23} height={.14} color="#e6d7bb" /><Round position={[side * 1.65, 2.3, z]} radius={.24} height={.14} color={gold} /></group>))}
      <Block position={[0, 2.45, -1.2]} scale={[3.8, .18, .3]} color="#d9c3a7" />
    </> : id === 'guardian' ? <>
      <Block position={[0, 1.1, -1.9]} scale={[4.8, 2.1, .2]} color="#586577" />
      {[-1, 1].map(side => <group key={side}><Round position={[side * 2.4, 1.15, -.9]} radius={.28} height={2.25} color="#8e9a9f" sides={6} /><Orb position={[side * 2.4, 2.4, -.9]} scale={[.18, .35, .18]} color={color} glow={.7} /></group>)}
      <Branch color={gold} radius={.06} points={[[-2.5, 1.5, -.4], [0, 3.4, -1.8], [2.5, 1.5, -.4]]} />
    </> : id === 'moonlight' ? <>
      <mesh position={[0, 1.5, -1]} rotation={[0, 0, -.38]}><torusGeometry args={[1.8, .12, 8, 36, Math.PI * 1.45]} /><meshStandardMaterial color="#c6b6e0" emissive="#a291c4" emissiveIntensity={.3} /></mesh>
      <Block position={[0, .8, -1.6]} scale={[2.5, 1.5, .08]} color="#6f668d" />
    </> : id === 'archive' ? <>
      <Block position={[0, 1.15, -1.6]} scale={[4.1, 2.2, .16]} color="#775644" />
      {[-1, 1].map(side => <group key={side}><Stem from={[side * 2, .1, 1.2]} to={[side * 2, 2.5, -.9]} radius={.1} color="#a77b53" /><Stem from={[side * 2, 2.5, -.9]} to={[0, 3.2, -1.3]} radius={.1} color="#a77b53" /></group>)}
      <Block position={[0, 2.55, -.3]} scale={[4.5, .1, 2]} color="#88674c" />
    </> : id === 'post' ? <>
      <Block position={[0, 1, -1.65]} scale={[4.1, 1.9, .12]} color="#956d80" />
      {[-1, 1].map(side => <Branch key={side} color="#bc9279" radius={.09} points={[[side * 1.9, 0, 1.1], [side * 1.9, 2.3, -.5], [0, 3.1, -1]]} />)}
      <mesh position={[0, 3, -.8]} rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[2.6, 1.2, 4, 1, true]} /><meshStandardMaterial color="#96768d" side={DoubleSide} /></mesh>
    </> : <>
      {[-1, 1].map(side => <group key={side}><Stem from={[side * 1.75, .1, -.8]} to={[side * 1.75, 2.7, -.8]} color={gold} radius={.075} /><Branch color={gold} radius={.06} points={[[side * 1.75, 2.6, -.8], [side * 1, 3.5, -1], [0, 3.7, -1]]} /></group>)}
      <Block position={[0, 1, -1.7]} scale={[3.5, 1.8, .1]} color="#77586a" /><Ring position={[0, 1.7, -1.6]} radius={.9} vertical color={color} glow={.25} />
    </>}
    <group scale={[rectangle || broad ? 1.2 : 1, 1, 1]}><Garland color={color} /></group>
    {[-1, 1].map(side => <Lantern key={side} position={[side * (broad ? 2.35 : 1.85), 1.9, .2]} hanging />)}
  </>;
}
