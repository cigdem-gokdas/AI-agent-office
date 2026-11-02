export interface RoomDesign { color: string; title: string; position: [number, number, number]; }
export const roomDesigns: Record<string, RoomDesign> = {
  coordinator: { color: '#efbd79', title: 'The heartwood study', position: [0, 3.4, 1.2] },
  library: { color: '#bca3ee', title: 'The theorem library', position: [-4.4, 6.3, -6.1] },
  observatory: { color: '#83cce3', title: 'The starlight observatory', position: [2.4, 8.1, -7.5] },
  workshop: { color: '#7fd9bb', title: 'The firefly workshop', position: [8.4, 5, -3.7] },
  studio: { color: '#ed9cba', title: 'The petal studio', position: [8.6, 1.7, 3.4] },
  gallery: { color: '#b6c980', title: 'The laurel gallery', position: [4.8, .4, 8.4] },
  guardian: { color: '#80b9db', title: 'The guardian lantern', position: [-8.5, 2.1, 1.6] },
  moonlight: { color: '#a69ee8', title: 'The moonlit office', position: [-10, 4.9, -4.4] },
  archive: { color: '#dbb37e', title: 'The acorn archive', position: [-6.3, .3, 7] },
  post: { color: '#e4a9c5', title: 'The whispering post', position: [-.8, .1, 9.2] },
};
export function roomDesign(id: string, index = 0): RoomDesign {
  return roomDesigns[id] || { color: '#a2b29a', title: 'A new woodland atelier', position: [Math.cos(index * 2.399) * (13 + Math.floor(index / 8) * 4), 1 + index % 3 * 1.5, Math.sin(index * 2.399) * (13 + Math.floor(index / 8) * 4)] };
}
