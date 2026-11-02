import { useEffect, useMemo, useRef } from 'react';
import { Color, Object3D } from 'three';
import type { InstancedMesh } from 'three';
import { useHeadquarters } from '../state/store';
import { roomDesign } from './layout';
import { fairyProfile } from './fairyProfiles';
// Three shared draw calls for all terrace flowers, scaled by the owner's graphics preset.
export function FloralTerraces() {
  const agents = useHeadquarters(state => state.snapshot.agents), quality = useHeadquarters(state => state.quality);
  const petals = useRef<InstancedMesh>(null), stems = useRef<InstancedMesh>(null), hearts = useRef<InstancedMesh>(null);
  const flowers = useMemo(() => agents.flatMap((agent, index) => {
    const design = roomDesign(agent.id, index), n = quality === 'low' ? 10 : quality === 'high' ? 24 : 16;
    return Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 1.55 + .4, r = ['workshop', 'studio', 'guardian'].includes(agent.id) ? 2.45 : 2; return { x: design.position[0] + Math.cos(a) * r, y: design.position[1] + .12, z: design.position[2] + Math.sin(a) * 1.65, height: .15 + (i % 4) * .055, color: i % 3 ? fairyProfile(agent.id).accent : '#f4d3e1' }; });
  }), [agents, quality]);
  useEffect(() => {
    const dummy = new Object3D();
    flowers.forEach((flower, i) => {
      dummy.position.set(flower.x, flower.y + flower.height / 2, flower.z); dummy.rotation.set(0, 0, .1); dummy.scale.set(.012, flower.height, .012); dummy.updateMatrix(); stems.current?.setMatrixAt(i, dummy.matrix);
      dummy.position.set(flower.x, flower.y + flower.height, flower.z); dummy.scale.set(.035, .025, .035); dummy.updateMatrix(); hearts.current?.setMatrixAt(i, dummy.matrix);
      for (let p = 0; p < 5; p++) { const a = p / 5 * Math.PI * 2; dummy.position.set(flower.x + Math.sin(a) * .046, flower.y + flower.height, flower.z + Math.cos(a) * .046); dummy.rotation.set(.6, a, .2); dummy.scale.set(.028, .015, .064); dummy.updateMatrix(); petals.current?.setMatrixAt(i * 5 + p, dummy.matrix); petals.current?.setColorAt(i * 5 + p, new Color(flower.color)); }
    });
    for (const ref of [petals, stems, hearts]) if (ref.current) { ref.current.instanceMatrix.needsUpdate = true; if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true; ref.current.computeBoundingSphere(); }
  }, [flowers]);
  return <group name="living-floral-terraces"><instancedMesh ref={stems} args={[undefined, undefined, flowers.length]}><cylinderGeometry args={[1, 1, 1, 5]} /><meshStandardMaterial color="#698a63" roughness={.85} /></instancedMesh><instancedMesh ref={petals} args={[undefined, undefined, flowers.length * 5]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial roughness={.7} emissive="#bca57c" emissiveIntensity={.08} /></instancedMesh><instancedMesh ref={hearts} args={[undefined, undefined, flowers.length]}><sphereGeometry args={[1, 8, 6]} /><meshStandardMaterial color="#f4d89b" emissive="#ffdc95" emissiveIntensity={.25} /></instancedMesh></group>;
}
