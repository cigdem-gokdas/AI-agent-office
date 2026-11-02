export function OwnerSession(){return <p className="small-copy">Public visual shell · Private backend not connected. Drafts stay in this tab.</p>}
export function OwnerRecords({kind}:{kind:'inbox'|'approvals'}){return <p className="empty-note">{kind==='inbox'?'Inbox':'Approvals'} unavailable. No private operational records are included.</p>}
