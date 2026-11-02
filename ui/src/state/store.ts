import { create } from 'zustand';
import catalog from '../data/catalog';
import { registrySnapshot } from '../data/types';
import type { HeadquartersSnapshot } from '../data/types';
import { runtimeAdapter } from '../data/runtimeAdapter';

import type { WorldQuality } from '../scene/quality';

export type Page = 'headquarters' | 'company' | 'approvals' | 'inbox' | 'usage' | 'memory';
interface HeadquartersState {
  quality: WorldQuality; setQuality(value: WorldQuality): void;
  selected: string; focused: string | null; detailLevel: 'room' | 'agent' | 'helper'; selectedHelper: string | null; panelOpen: boolean; commandOpen: boolean;
  cameraMoving: boolean; setCameraMoving(value: boolean): void;
  page: Page; sceneMode: '3d' | 'map'; resetCamera: number; reducedMotion: boolean;
  snapshot: HeadquartersSnapshot; loading: boolean; draft: string; savedDraft: string | null;
  select(id: string): void; inspect(id: string, detail?: 'room' | 'agent'): void; navigate(page: Page): void; setDraft(text: string): void; saveDraft(): void;
  inspectHelper(parent: string, id: string): void; setPanel(value: boolean): void; setCommand(value: boolean): void;
  setScene(mode: '3d' | 'map'): void; resetView(): void; setReducedMotion(value: boolean): void;
  clearOperationalSnapshot(): void;
  refresh(): Promise<void>;
}
const adapter = runtimeAdapter(catalog);
export const useHeadquarters = create<HeadquartersState>((set, get) => ({
  quality: 'balanced', setQuality: quality => { if (['low', 'balanced', 'high'].includes(quality)) set({ quality }); },
  selected: catalog.find(agent => agent.id === 'coordinator')?.id || catalog[0]?.id || '', page: 'headquarters',
  focused: null, detailLevel: 'agent', selectedHelper: null, panelOpen: false, commandOpen: false, cameraMoving: true, sceneMode: '3d', resetCamera: 0, reducedMotion: false,
  clearOperationalSnapshot: () => set({snapshot:registrySnapshot(catalog)}),
  snapshot: registrySnapshot(catalog), loading: false, draft: '', savedDraft: null,
  select: selected => set({ selected, selectedHelper: null, panelOpen: true, page: 'headquarters' }), navigate: page => set({ page, panelOpen: true }),
  inspect: (selected, detailLevel = 'room') => { if (get().snapshot.agents.some(agent => agent.id === selected)) set({ selected, focused: selected, detailLevel, selectedHelper: null, panelOpen: true, page: 'headquarters' }); },
  inspectHelper: (parent, selectedHelper) => { if (get().snapshot.agents.find(agent => agent.id === parent)?.helpers?.some(helper => helper.id === selectedHelper)) set({ selected: parent, focused: parent, selectedHelper, detailLevel: 'helper', panelOpen: true, page: 'headquarters' }); },
  setPanel: panelOpen => set({ panelOpen, cameraMoving: true }), setCommand: commandOpen => set({ commandOpen }),
  setCameraMoving: cameraMoving => set({ cameraMoving }),
  setDraft: draft => set({ draft: draft.slice(0, 1000), savedDraft: null }),
  saveDraft: () => { const text = get().draft.trim(); if (text) set({ savedDraft: text, draft: '' }); },
  setScene: sceneMode => set({ sceneMode }), resetView: () => set(state => ({ focused: null, resetCamera: state.resetCamera + 1 })),
  setReducedMotion: reducedMotion => set({ reducedMotion }),
  refresh: async () => {
    if (get().loading) return;
    set({ loading: true });
    const snapshot = await adapter.read();
    set({ snapshot, loading: false });
  },
}));
