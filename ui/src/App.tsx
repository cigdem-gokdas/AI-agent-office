import { lazy, Suspense, useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react';
import { useHeadquarters } from './state/store';
import { FairyMark, Icon } from './components/Icon';
import { CinematicBackdrop } from './components/CinematicBackdrop';
import { Inspector } from './components/Inspector';
import { RoomMap } from './scene/RoomMap';
import { OwnerSession } from './components/OwnerControls';
import { submissionID, useOwnerBridge } from './data/ownerBridge';
import { isFreshSnapshot } from './data/types';
const HeadquartersScene = lazy(() => import('./scene/HeadquartersScene'));
function Command() {
  const { commandOpen, setCommand, draft, setDraft, savedDraft, saveDraft, navigate } = useHeadquarters();
  const owner=useOwnerBridge(); const [requestId,setRequestId]=useState(submissionID);
  const [submitted,setSubmitted]=useState(false);
  return <div className={`command-dock ${commandOpen ? 'expanded' : ''}`}>
    {commandOpen ? <section aria-label="CEO draft inbox"><div className="command-title"><span><FairyMark size={18} /> A little note for Coordinator</span><button aria-label="Close draft" onClick={() => setCommand(false)}><Icon name="close" size={15} /></button></div><form onSubmit={event => { event.preventDefault(); if (!owner.connected) { saveDraft(); return; } void owner.act('inbox',{text:draft,requestId}).then(ok=>{if(ok){setDraft('');setRequestId(submissionID());setSubmitted(true);navigate('inbox');}}); }}><label className="sr-only" htmlFor="ceo-draft">Draft an idea for Coordinator</label><input id="ceo-draft" disabled={owner.busy} placeholder="An idea, a question, a little spark…" maxLength={1000} value={draft} onChange={event => setDraft(event.target.value)} autoComplete="off" autoFocus /><button disabled={!draft.trim() || owner.busy} type="submit">{owner.connected ? 'Submit request' : 'Keep draft'} <Icon name="arrow" size={14} /></button></form><OwnerSession/><p role="status">{submitted ? 'Request persisted. Review and confirm routing in the inbox.' : savedDraft ? <>Kept in this tab. No task created. <button onClick={() => setDraft(savedDraft)}>Restore draft</button></> : 'Tab-only draft · No models, uploads or automatic actions.'}<button className="inbox-link" onClick={() => navigate('inbox')}>Runtime inbox</button></p></section> : <button className="command-launch" onClick={() => setCommand(true)}><FairyMark size={22} /><span>A note for Coordinator…</span><span className="key-hint">{owner.connected?'Owner session':'Draft only'}</span><Icon name="plus" size={15} /></button>}
  </div>;
}
function HeadquartersApp() {
  const { page, sceneMode, setScene, panelOpen, setPanel, resetView, focused, snapshot, refresh, navigate, reducedMotion, setReducedMotion, commandOpen } = useHeadquarters();
  const ownerConnected=useOwnerBridge(state=>state.connected);
  useEffect(()=>{if(!ownerConnected)useHeadquarters.getState().clearOperationalSnapshot();},[ownerConnected]);
  const preference = useReducedMotion(); const [now, setNow] = useState(Date.now());
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { setReducedMotion(!!preference); }, [preference, setReducedMotion]);
  useEffect(() => { const clock = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(clock); }, []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key !== 'Escape') return; const state = useHeadquarters.getState(); if (state.commandOpen) state.setCommand(false); else if (state.sceneMode === 'map') state.setScene('3d'); else if (state.focused) state.resetView(); else state.setPanel(false); };
    window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape);
  }, []);
  const pending = snapshot.approvals?.filter(item => item.status === 'pending').length;
  return <MotionConfig reducedMotion={reducedMotion ? 'always' : 'user'}><main className={`world-app ${panelOpen ? 'inspector-open' : ''} ${commandOpen ? 'command-open' : ''}`} aria-label="Fairy Headquarters">
    <CinematicBackdrop /><div className="world-canvas" aria-label="Interactive woodland headquarters"><Suspense fallback={<div className="world-loading"><FairyMark size={48} /><p>Opening the woodland gates…</p></div>}><HeadquartersScene now={now} /></Suspense></div>
    <header className="world-identity"><FairyMark size={35} /><div><strong>Fairy Headquarters</strong><small>FAIRY HEADQUARTERS <span>·</span> OWNER-LED</small></div></header>
    <div className="world-location"><span>✧</span>{focused ? `${snapshot.agents.find(agent => agent.id === focused)?.name || 'Room'} · atelier inspection` : 'The heartwood sanctuary'}<small>UTC</small></div>
    <nav className="world-tools" aria-label="World controls">
      <button aria-label="Return to overview" title="Return to overview" onClick={() => { resetView(); setScene('3d'); }}><Icon name="grid" /><span>Overview</span></button>
      <button aria-label="Room map" title="Room map" aria-pressed={sceneMode === 'map'} onClick={() => setScene(sceneMode === 'map' ? '3d' : 'map')}><Icon name="leaf" /><span>Room map</span></button>
      <button aria-label="Approvals" title="Approvals" aria-pressed={page === 'approvals' && panelOpen} onClick={() => navigate('approvals')}><Icon name="shield" /><span>Approvals</span><i>{pending ?? '—'}</i></button>
      <button aria-label="World settings" title="World settings" onClick={() => navigate('usage')}><Icon name="spark" /><span>Settings</span></button>
    </nav>
    <button className="inspector-toggle" aria-label={panelOpen ? 'Collapse inspector' : 'Expand inspector'} aria-expanded={panelOpen} onClick={() => setPanel(!panelOpen)}><Icon name={panelOpen ? 'close' : 'eye'} size={17} /><span>{panelOpen ? 'Close panel' : 'Looking glass'}</span></button>
    {sceneMode === 'map' && <section className="world-map" aria-label="Room map overlay"><div><p className="eyebrow">YOUR WOODLAND COMPANY</p><h2>Choose an atelier</h2><button aria-label="Close room map" onClick={() => setScene('3d')}><Icon name="close" /></button></div><RoomMap /></section>}
    <AnimatePresence>{panelOpen && <motion.div className="inspector-host" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 18 }} transition={{ duration: .2 }}><Inspector now={now} /></motion.div>}</AnimatePresence>
    <div className="world-caption"><span className={`snapshot-dot ${snapshot.connection === 'available' ? 'connected' : ''}`} /><span>{snapshot.agents.length} ateliers · {snapshot.agents.reduce((sum, agent) => sum + (agent.helpers?.length || 0), 0)} helper profiles<small>{snapshot.source === 'go-cli' ? 'Go snapshot' : 'Visual catalog only'} · {snapshot.asOf ? new Date(snapshot.asOf).toLocaleTimeString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' }) : 'unavailable'}{!isFreshSnapshot(snapshot, now) && ' · refresh for current state'}</small></span></div>
    <div className="world-legend"><Icon name="lock" size={12} /><span>Nothing starts on its own.<small>Ambient magic is decorative. Sleeping helpers have no confirmed run.</small></span></div>
    <Command />
  </main></MotionConfig>;
}

export default function App() {
  return <HeadquartersApp />;
}
