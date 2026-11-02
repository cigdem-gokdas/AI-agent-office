import type {AgentDefinition,HeadquartersAdapter} from './types';
import {registrySnapshot} from './types';
// Public visual shell: no private runtime, accounts, model or background work.
export function runtimeAdapter(catalog:AgentDefinition[]):HeadquartersAdapter{return {async read(){return registrySnapshot(catalog);}};}
