export interface AgentDefinition {
  id: string; name: string; role: string; runtime: string; skills: string[];
  helpers?: HelperDefinition[]; tools?: string[]; permissions?: string[]; filesystemAccess?: string;
}
export interface HelperDefinition {
  id: string; parent: string; role: string; runtime: string; tools: string[]; skills: string[]; permissions: string[];
}
export interface HelperObservation { status: AgentStatus; activeTask: string | null; confirmedRunning: boolean }
export type AgentStatus = 'idle' | 'running' | 'blocked' | 'unavailable';
export interface ObservedMetric { value: number | null; accuracy: 'exact' | 'estimated' | 'unavailable'; source: string }
export interface AgentSnapshot extends AgentDefinition {
  status: AgentStatus; activeTask: string | null; confirmedRunning: boolean;
  input: ObservedMetric; output: ObservedMetric;
  helperObservations?: Record<string, HelperObservation>;
}
export interface ApprovalSummary { id: string; agent: string; kind: string; status: string; execution: string; at: string }
export interface InboxSummary { id: string; agent: string; review: string; execution: string; at: string }
export interface ActivityItem { id: string; agent: string; label: string; at: string }
export interface HeadquartersSnapshot {
  source: 'go-cli' | 'registry-only'; asOf: string | null; connection: 'available' | 'unavailable';
  agents: AgentSnapshot[]; approvals: ApprovalSummary[] | null; inbox: InboxSummary[] | null;
  activity: ActivityItem[]; input: ObservedMetric; output: ObservedMetric;
  notice: string;
}
export interface HeadquartersAdapter { read(signal?: AbortSignal): Promise<HeadquartersSnapshot> }
export const unknownMetric = (): ObservedMetric => ({ value: null, accuracy: 'unavailable', source: 'Not exposed by an authorized runtime source' });
export function registrySnapshot(catalog: AgentDefinition[]): HeadquartersSnapshot {
  return { source: 'registry-only', asOf: null, connection: 'unavailable',
    agents: catalog.map(agent => ({ ...agent, status: 'unavailable', activeTask: null, confirmedRunning: false, input: unknownMetric(), output: unknownMetric() })),
    approvals: null, inbox: null, activity: [], input: unknownMetric(), output: unknownMetric(),
    notice: 'Registry loaded. Runtime snapshot unavailable; no activity or account usage is assumed.' };
}
export function isFreshSnapshot(snapshot: HeadquartersSnapshot, now = Date.now()): boolean {
  const at = snapshot.asOf ? Date.parse(snapshot.asOf) : NaN;
  return snapshot.connection === 'available' && Number.isFinite(at) && now >= at && now - at < 15_000;
}
export function canShowWorking(agent: AgentSnapshot, snapshot: HeadquartersSnapshot, now = Date.now()): boolean {
  return agent.status === 'running' && agent.confirmedRunning && !!agent.activeTask && isFreshSnapshot(snapshot, now);
}
export function canShowHelperWorking(helper: HelperDefinition, agent: AgentSnapshot, snapshot: HeadquartersSnapshot, now = Date.now()): boolean {
  const observation = agent.helperObservations?.[helper.id];
  return helper.parent === agent.id && canShowWorking(agent, snapshot, now) && observation?.status === 'running' && observation.confirmedRunning && !!observation.activeTask;
}
