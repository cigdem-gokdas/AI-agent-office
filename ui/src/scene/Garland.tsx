import { useEffect, useRef } from 'react';
import { Color, Object3D } from 'three';
import type { InstancedMesh } from 'three';
// Instance leaves and blossoms to keep the richer room dressing inexpensive.
export function Garland({ color }: { color: string }) {
  const leaves = useRef<InstancedMesh>(null), flowers = useRef<InstancedMesh>(null);
  useEffect(() => {
    const dummy = new Object3D();
    for (let i = 0; i < 64; i++) {
      const a = i < 38 ? i / 37 * Math.PI : (i - 38) / 26 * Math.PI * 2;
      const x = Math.cos(a) * 1.8, y = i < 38 ? .4 + Math.sin(a) * 2.5 : .16, z = i < 38 ? -.54 - Math.sin(a) * .45 : Math.sin(a) * 1.8;
      dummy.position.set(x, y, z); dummy.rotation.set(.2, .2, a + i * .3); dummy.scale.set(.09, .22, .04); dummy.updateMatrix(); leaves.current?.setMatrixAt(i, dummy.matrix);
      if (i < 22) {
        const b = i < 14 ? i / 13 * Math.PI : (i - 14) / 8 * Math.PI * 2;
        dummy.position.set(Math.cos(b) * 1.75, i < 14 ? .5 + Math.sin(b) * 2.43 : .25, i < 14 ? -.42 - Math.sin(b) * .45 : Math.sin(b) * 1.75);
        dummy.rotation.set(0, 0, b); dummy.scale.set(.085, .075, .065); dummy.updateMatrix(); flowers.current?.setMatrixAt(i, dummy.matrix);
        flowers.current?.setColorAt(i, new Color(i % 3 ? color : '#f0d1b3'));
      }
    }
    for (const mesh of [leaves.current, flowers.current]) if (mesh) { mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; mesh.computeBoundingSphere(); }
  }, [color]);
  return <>
    <instancedMesh ref={leaves} args={[undefined, undefined, 64]}><sphereGeometry args={[1, 6, 5]} /><meshStandardMaterial color="#638a69" roughness={.9} /></instancedMesh>
    <instancedMesh ref={flowers} args={[undefined, undefined, 22]}><icosahedronGeometry args={[1, 1]} /><meshStandardMaterial color="#ffffff" roughness={.7} /></instancedMesh>
  </>;
}
