import type { CSSProperties } from 'react';
import { useHeadquarters } from '../state/store';
import { roomDesign } from './layout';

export function RoomMap({ fallback = false }: { fallback?: boolean }) {
  const { snapshot, selected, inspect, setScene } = useHeadquarters();
  return <div className="room-map" aria-label="Accessible company room map">
    <div className="map-flower">✧</div>
    {snapshot.agents.map((agent, i) => {
      const design = roomDesign(agent.id, i);
      return <button key={agent.id} className={`map-room ${selected === agent.id ? 'is-selected' : ''}`} style={{ left: `${50 + design.position[0] * 4.4}%`, top: `${47 + design.position[2] * 4.3}%`, '--room-color': design.color } as CSSProperties} onClick={() => { inspect(agent.id); setScene('3d'); }} aria-pressed={selected === agent.id}>
        <span className="map-symbol">{agent.id === 'coordinator' ? '✦' : '♧'}</span><strong>{agent.name}</strong><small>{agent.status === 'idle' ? 'Waiting for you' : agent.status === 'running' ? 'Running recorded' : agent.status === 'blocked' ? 'Blocked at snapshot' : 'Executor unavailable'}</small>
      </button>;
    })}
    {fallback && <p className="webgl-note">3D is unavailable in this browser. Every room is accessible in this map.</p>}
  </div>;
}
