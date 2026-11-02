import { create } from 'zustand';
export interface OwnerInbox { id: string; text: string; agent: string; support: string[]; ambiguous: boolean; review: string; execution: string; runId: string }
export interface OwnerApproval { id: string; action: string; target: string; confirmTarget: string; reason: string; status: string; execution: string; availability: string }
export interface OwnerState { inbox: OwnerInbox[]; approvals: OwnerApproval[]; tasks: {id:string; status:string; agent:string}[]; stopped:boolean }
// Session capability stays in memory only; no local/session storage, URL or bundle secrets.
let csrf = '';
export async function ownerCall<T>(operation:string, value?:unknown):Promise<T> {
 if(!['session','state','inbox','route','decision','logout','snapshot'].includes(operation))throw new Error('Operation unavailable');
 const response=await fetch(`/api/owner/${operation}`, {method:value===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',headers:{'Content-Type':'application/json',...(csrf?{'X-HQ-CSRF':csrf}:{})},...(value===undefined?{}:{body:JSON.stringify(value)}),signal:AbortSignal.timeout(8000)});
 const body=await response.json(); if(response.status===401){csrf='';useOwnerBridge.setState({connected:false,state:null});}
 if(!response.ok) throw new Error(body.error || 'Owner operation unavailable'); return body as T;
}
export function submissionID():string {return crypto.randomUUID().replaceAll('-','');}
interface OwnerBridgeState {connected:boolean; state:OwnerState|null; error:string; busy:boolean; pair(file:File):Promise<void>; refresh():Promise<void>; act(operation:string,value:unknown):Promise<boolean>; logout():Promise<void>}
export const useOwnerBridge=create<OwnerBridgeState>((set,get)=>({connected:false,state:null,error:'',busy:false,
 async pair(file){set({busy:true,error:''});try{if(file.size>256)throw new Error('Invalid pairing file');const key=JSON.parse(await file.text());const session=await ownerCall<{csrf:string}>('session',{pairing:key.pairing});csrf=session.csrf;set({connected:true});await get().refresh();}catch(e){set({error:e instanceof Error?e.message:'Pairing unavailable'});}finally{set({busy:false});}},
 async refresh(){try{const state=await ownerCall<OwnerState>('state');set({state,error:''});}catch(e){set({error:e instanceof Error?e.message:'State unavailable'});}},
 async act(operation,value){if(get().busy)return false;set({busy:true,error:''});try{await ownerCall(operation,value);await get().refresh();return true;}catch(e){set({error:e instanceof Error?e.message:'Operation failed; refresh before retrying'});return false;}finally{set({busy:false});}},
 async logout(){let error='';try{await ownerCall('logout',{});}catch{error='Local view locked; server revocation unconfirmed. Stop the bridge to invalidate the session.';}finally{csrf='';set({connected:false,state:null,error});}}
}));
