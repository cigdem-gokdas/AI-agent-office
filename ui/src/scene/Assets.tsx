import {useMemo} from 'react';
import {useGLTF} from '@react-three/drei';
import {Box3,Vector3} from 'three';
import type {Group,Mesh,MeshStandardMaterial} from 'three';
import type {Point} from './Primitives';
export type ModelName='books' | 'desk' | 'deskcorner' | 'bookcaseclosedwide' | 'bookcaseopen' | 'chaircushion' | 'chairdesk' | 'laptop' | 'computerkeyboard' | 'computerscreen' | 'lamproundtable' | 'lamproundfloor' | 'loungechairrelax' | 'flower-purpleb' | 'flower-redc' | 'mushroom-redgroup' | 'mushroom-tangroup' | 'bridge-woodround' | 'cliff-waterfall-rock';
const path=(name:string)=>`/assets/vendor/kenney/${name}.glb`;
function normalized(scene: Group, height: number) {
  const box = new Box3().setFromObject(scene), size = box.getSize(new Vector3()), center = box.getCenter(new Vector3());
  if (!Number.isFinite(size.y) || size.y <= 0) throw new Error('Invalid local model dimensions');
  return { scale: height / size.y, offset: [-center.x, -box.min.y, -center.z] as Point };
}
export function Model({ name, position = [0, 0, 0], height = 1, rotation = 0, scale = [1, 1, 1] }: { name: ModelName; position?: Point; height?: number; rotation?: number; scale?: Point }) {
  const gltf = useGLTF(path(name), false, false);
  const instance = useMemo(() => {
    const scene = gltf.scene.clone(true);
    scene.traverse(object => { if ((object as Mesh).isMesh) { object.castShadow = true; object.receiveShadow = true; if (name.startsWith('bookcase') || name.startsWith('desk')) { const mesh = object as Mesh; for (const mat of (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as MeshStandardMaterial[]) mat.color.set('#ba987b'); } } });
    return { scene, ...normalized(scene, height) };
  }, [gltf.scene, height, name]);
  return <group name={`licensed-model:${name}`} position={position} rotation={[0, rotation, 0]} scale={scale} dispose={null}>
    <group scale={instance.scale}><primitive object={instance.scene} position={instance.offset} /></group>
  </group>;
}
