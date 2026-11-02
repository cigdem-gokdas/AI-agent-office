// Visual identity only. These profiles grant no capability or runtime state.
export const fairyProfiles = {
  coordinator: { dress: '#fffdf5', accent: '#f4e4bf', hair: '#3e281f', skin: '#eac09c', wing: '#f6d69a', aura: '#ffe0a0', style: 0, hairStyle: 'waves', crown: 'sun' },
  library: { dress: '#b29cd6', accent: '#e6e0f6', hair: '#b5a9bd', skin: '#f0ccba', wing: '#c6bdf4', aura: '#ddd1ff', style: 1, hairStyle: 'braid', crown: 'flowers' },
  observatory: { dress: '#3f739b', accent: '#a7dce5', hair: '#253444', skin: '#bd8c6f', wing: '#95d3f0', aura: '#8ed9ff', style: 2, hairStyle: 'bob', crown: 'stars' },
  workshop: { dress: '#429d87', accent: '#b8dfbc', hair: '#803e32', skin: '#dfae8e', wing: '#88ddc3', aura: '#99ffe0', style: 3, hairStyle: 'ponytail', crown: 'leaves' },
  studio: { dress: '#d383a8', accent: '#f9d2e2', hair: '#bc7b9e', skin: '#edbd9b', wing: '#f6acd6', aura: '#ffbddd', style: 4, hairStyle: 'cascade', crown: 'flowers' },
  gallery: { dress: '#d3a17b', accent: '#f7ddbd', hair: '#634034', skin: '#d3a083', wing: '#edc1a5', aura: '#ffd2ae', style: 5, hairStyle: 'bun', crown: 'laurel' },
  guardian: { dress: '#587985', accent: '#aacbc8', hair: '#d2ddd7', skin: '#a5765f', wing: '#8bbbc7', aura: '#b2e9ea', style: 6, hairStyle: 'crown', crown: 'runes' },
  moonlight: { dress: '#6e629d', accent: '#cbc2e8', hair: '#333253', skin: '#e4bdac', wing: '#b5a9e1', aura: '#d2c6ff', style: 7, hairStyle: 'straight', crown: 'moon' },
  archive: { dress: '#7b9c64', accent: '#d3d6a2', hair: '#94643b', skin: '#c7936a', wing: '#c3d298', aura: '#e4e5ab', style: 8, hairStyle: 'sidebraid', crown: 'leaves' },
  post: { dress: '#ce8f83', accent: '#f5cdb9', hair: '#c66a49', skin: '#f0cbb0', wing: '#f3bcb3', aura: '#ffcab0', style: 9, hairStyle: 'wavybob', crown: 'petals' },
} as const;
export type FairyProfile = typeof fairyProfiles[keyof typeof fairyProfiles];
export function fairyProfile(id: string): FairyProfile { return fairyProfiles[id as keyof typeof fairyProfiles] || fairyProfiles.coordinator; }
