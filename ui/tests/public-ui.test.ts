import {describe,it,expect,vi} from 'vitest';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import catalog from '../src/data/catalog';
import {runtimeAdapter} from '../src/data/runtimeAdapter';
import {canShowWorking} from '../src/data/types';
describe('public visual shell',()=>{
 it('has ten generic rooms, no private capabilities or invented work',async()=>{const fetch=vi.fn();vi.stubGlobal('fetch',fetch);const snapshot=await runtimeAdapter(catalog).read();expect(catalog).toHaveLength(10);expect(snapshot.connection).toBe('unavailable');expect(snapshot.input.value).toBeNull();for(const agent of snapshot.agents){expect(agent.skills).toEqual([]);expect(agent.permissions).toEqual([]);expect(canShowWorking(agent,snapshot)).toBe(false)}expect(fetch).not.toHaveBeenCalled();vi.unstubAllGlobals();});
 it('pins every shipped asset and embeds model resources locally',()=>{const m=JSON.parse(readFileSync('ui/ASSETS.json','utf8'));for(const item of m.assets){const bytes=readFileSync(item.path);expect(createHash('sha256').update(bytes).digest('hex')).toBe(item.sha256);if(item.path.endsWith('.glb')){expect(bytes.readUInt32LE(0)).toBe(0x46546c67);const length=bytes.readUInt32LE(12);const gltf=JSON.parse(bytes.subarray(20,20+length).toString());for(const row of [...gltf.buffers??[],...gltf.images??[]])expect(!row.uri||row.uri.startsWith('data:')).toBe(true)}}});
 it('contains no private registry loader, API proxy or branded logo assets',()=>{const config=readFileSync('ui/vite.config.ts','utf8');expect(config).not.toContain('proxy:');expect(config).not.toContain('headquartersPlugin');expect(existsSync(resolve('ui/public/assets/room-logos'))).toBe(false);});
});
