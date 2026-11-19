import React, { useMemo, useState } from "react";
import {
  Activity, Archive, ArrowUpRight, BadgeCheck, BookOpen, ChevronRight,
  CircleHelp, Clock3, FilePlus2, Filter, FolderSearch, Link2, Plus,
  Search, ShieldCheck, Sparkles, Trash2, X
} from "lucide-react";

const starterCases = [];

const blankCase = () => ({
  id: crypto.randomUUID(), name: "", handle: "", category: "Creator case study",
  status: "Research in progress", summary: "", verdict: "Inconclusive",
  confidence: "Low", updated: "Just now", events: [], evidence: [], notes: ""
});

function loadCases() {
  try {
    const saved = localStorage.getItem("aftermotion-cases-v1");
    return saved ? JSON.parse(saved) : starterCases;
  } catch { return starterCases; }
}

function App() {
  const [cases, setCases] = useState(loadCases);
  const [selectedId, setSelectedId] = useState(cases[0]?.id || null);
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [draft, setDraft] = useState(blankCase);
  const [eventDraft, setEventDraft] = useState({ date: new Date().toISOString().slice(0,10), title: "", type: "Signal", note: "" });
  const [evidenceDraft, setEvidenceDraft] = useState({ title: "", url: "", kind: "External link", note: "" });
  const [activeTab, setActiveTab] = useState("overview");

  const selected = cases.find(c => c.id === selectedId) || cases[0];
  const filtered = useMemo(() => cases.filter(c =>
    `${c.name} ${c.handle} ${c.category}`.toLowerCase().includes(query.toLowerCase())
  ), [cases, query]);

  function persist(next) {
    setCases(next);
    localStorage.setItem("aftermotion-cases-v1", JSON.stringify(next));
  }
  function updateSelected(patch) {
    if (!selected) return;
    persist(cases.map(c => c.id === selected.id ? { ...c, ...patch, updated: "Just now" } : c));
  }
  function createCase(e) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    const next = [draft, ...cases];
    persist(next); setSelectedId(draft.id); setDraft(blankCase()); setShowNew(false); setActiveTab("overview");
  }
  function addEvent(e) {
    e.preventDefault();
    if (!eventDraft.title.trim() || !selected) return;
    updateSelected({ events: [...selected.events, { ...eventDraft, id: crypto.randomUUID() }].sort((a,b) => a.date.localeCompare(b.date)) });
    setEventDraft({ date: new Date().toISOString().slice(0,10), title: "", type: "Signal", note: "" });
    setShowEvent(false);
  }
  function addEvidence(e) {
    e.preventDefault();
    if (!evidenceDraft.title.trim() || !evidenceDraft.url.trim() || !selected) return;
    updateSelected({ evidence: [...selected.evidence, { ...evidenceDraft, id: crypto.randomUUID() }] });
    setEvidenceDraft({ title: "", url: "", kind: "External link", note: "" });
    setShowEvidence(false);
  }
  function removeCase() {
    if (!selected || !window.confirm(`Delete the case file for ${selected.name}?`)) return;
    const next = cases.filter(c => c.id !== selected.id);
    persist(next); setSelectedId(next[0]?.id || null);
  }
  function removeItem(key, id) {
    updateSelected({ [key]: selected[key].filter(item => item.id !== id) });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">A.</div><div><strong>AFTERMOTION</strong><span>CREATOR INTELLIGENCE</span></div></div>
        <div className="side-label">WORKSPACE</div>
        <button className="side-link active"><FolderSearch size={17}/> Case files <span className="count">{cases.length}</span></button>
        <button className="side-link" onClick={() => setActiveTab("evidence")}><Archive size={17}/> Evidence vault</button>
        <button className="side-link" onClick={() => setActiveTab("research")}><BookOpen size={17}/> Research notes</button>
        <div className="side-bottom">
          <div className="privacy-card"><ShieldCheck size={17}/><div><b>Evidence first</b><p>Separate verified facts from interpretation. Every claim should have a trail.</p></div></div>
          <div className="profile"><div className="avatar">S</div><div><b>Research workspace</b><span>Local project</span></div><CircleHelp size={16}/></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumb">Workspace <ChevronRight size={14}/> <b>Case files</b></div>
          <div className="top-actions"><span className="local-badge"><span/> LOCAL DATA</span><button className="primary small" onClick={() => { setDraft(blankCase()); setShowNew(true); }}><Plus size={16}/> New case file</button></div>
        </header>

        <section className="page-heading">
          <div><div className="eyebrow">RESEARCH WORKSPACE / 001</div><h1>Creator case files</h1><p>Investigate the events behind a creator's changing cultural relevance.</p></div>
          <div className="heading-meta"><span className="meta-label">RESEARCH MODE</span><b><Activity size={15}/> Evidence-led analysis</b></div>
        </section>

        <div className="content-grid">
          <section className="case-list-panel">
            <div className="panel-head"><div><h2>All investigations</h2><span>{cases.length} case file{cases.length === 1 ? "" : "s"}</span></div><Filter size={16}/></div>
            <div className="searchbox"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search creators..." /></div>
            <div className="case-list">
              {filtered.map(c => <button key={c.id} className={`case-item ${selected?.id === c.id ? "selected" : ""}`} onClick={() => { setSelectedId(c.id); setActiveTab("overview"); }}>
                <div className="case-avatar">{c.name.slice(0,1).toUpperCase()}</div>
                <div className="case-item-copy"><b>{c.name}</b><span>{c.handle || "No handle added"}</span><small>{c.status}</small></div>
                <ChevronRight size={15}/>
              </button>)}
              {filtered.length === 0 && <div className="empty-small">No matching case files.</div>}
            </div>
            <button className="new-case-link" onClick={() => { setDraft(blankCase()); setShowNew(true); }}><FilePlus2 size={16}/> Create an investigation</button>
          </section>

          <section className="detail-panel">
            {!selected ? <div className="empty-state"><FolderSearch size={28}/><h2>No case files yet</h2><p>Create your first investigation to begin.</p><button className="primary" onClick={() => setShowNew(true)}><Plus size={16}/> New case file</button></div> : <>
              <div className="detail-top">
                <div><div className="eyebrow">CASE FILE / {selected.id.slice(-6).toUpperCase()}</div><h2>{selected.name}</h2><div className="handle">{selected.handle || "Creator handle not added"} <span>·</span> {selected.category}</div></div>
                <button className="icon-button danger-ghost" title="Delete case file" onClick={removeCase}><Trash2 size={16}/></button>
              </div>
              <div className="summary-box"><div className="summary-label">INVESTIGATION QUESTION</div><p>{selected.summary || "What events, if any, explain the creator's changing attention and cultural relevance?"}</p></div>
              <nav className="tabs">
                {["overview","evidence","research"].map(t => <button key={t} className={activeTab === t ? "tab active-tab" : "tab"} onClick={() => setActiveTab(t)}>{t === "overview" ? "Timeline" : t === "evidence" ? "Evidence vault" : "Research notes"}</button>)}
              </nav>

              {activeTab === "overview" && <div className="tab-content">
                <div className="section-heading"><div><h3>Event timeline</h3><p>Record dated events and observations in sequence.</p></div><button className="outline small" onClick={() => setShowEvent(true)}><Plus size={15}/> Add event</button></div>
                {selected.events.length === 0 ? <div className="empty-inline">No events recorded. Add the first dated observation.</div> :
                  <div className="timeline">{selected.events.map(ev => <div className="timeline-row" key={ev.id}><div className="timeline-date">{ev.date}</div><div className="timeline-dot"/><div className="timeline-card"><div className="timeline-card-top"><b>{ev.title}</b><button className="tiny-delete" onClick={() => removeItem("events", ev.id)} title="Remove event"><X size={14}/></button></div><span className="tag">{ev.type}</span>{ev.note && <p>{ev.note}</p>}</div></div>)}</div>}
                <div className="section-heading verdict-heading"><div><h3>Current assessment</h3><p>Analyst judgment, not an automated Motion score.</p></div><BadgeCheck size={18}/></div>
                <div className="assessment-grid"><label>Verdict<select value={selected.verdict} onChange={e => updateSelected({verdict:e.target.value})}><option>Inconclusive</option><option>Temporary spike</option><option>Sustained momentum</option><option>Declining attention</option></select></label><label>Confidence<select value={selected.confidence} onChange={e => updateSelected({confidence:e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></label></div>
                <div className="notice"><ShieldCheck size={16}/><span>Keep the verdict proportional to the evidence. If the cause is uncertain, say so.</span></div>
              </div>}

              {activeTab === "evidence" && <div className="tab-content">
                <div className="section-heading"><div><h3>Evidence vault</h3><p>Keep source links attached to the claims they support.</p></div><button className="outline small" onClick={() => setShowEvidence(true)}><Plus size={15}/> Add source</button></div>
                {selected.evidence.length === 0 ? <div className="empty-inline">No sources saved. Add public posts, articles or other verifiable references.</div> : <div className="evidence-list">{selected.evidence.map(src => <div className="evidence-card" key={src.id}><div className="evidence-icon"><Link2 size={17}/></div><div className="evidence-copy"><b>{src.title}</b><span>{src.kind}</span><a href={src.url} target="_blank" rel="noreferrer">{src.url} <ArrowUpRight size={12}/></a>{src.note && <p>{src.note}</p>}</div><button className="tiny-delete" onClick={() => removeItem("evidence",src.id)}><X size={14}/></button></div>)}</div>}
              </div>}

              {activeTab === "research" && <div className="tab-content">
                <div className="section-heading"><div><h3>Analyst notes</h3><p>Record hypotheses, alternative explanations and unanswered questions.</p></div><Sparkles size={18}/></div>
                <textarea className="notes-area" value={selected.notes} onChange={e => updateSelected({notes:e.target.value})} placeholder="What do the sources suggest? What else could explain the change? What evidence would challenge your current interpretation?" />
                <div className="notice"><Clock3 size={16}/><span>Notes are saved automatically in this browser.</span></div>
              </div>}
            </>}
          </section>
        </div>
        <footer className="footer"><span>AFTERMOTION © 2026</span><span>Independent research workspace · Not affiliated with Motion</span><span>v0.1.0</span></footer>
      </main>

      {showNew && <Modal title="Create a case file" onClose={() => setShowNew(false)}><form onSubmit={createCase} className="form-stack">
        <label>Creator / subject name<input autoFocus required value={draft.name} onChange={e => setDraft({...draft,name:e.target.value})} placeholder="e.g. Creator name"/></label>
        <label>X handle or primary profile<input value={draft.handle} onChange={e => setDraft({...draft,handle:e.target.value})} placeholder="@handle"/></label>
        <label>Investigation question<textarea value={draft.summary} onChange={e => setDraft({...draft,summary:e.target.value})} placeholder="What change in attention are you investigating?"/></label>
        <div className="modal-actions"><button type="button" className="outline" onClick={() => setShowNew(false)}>Cancel</button><button className="primary" type="submit">Create case file</button></div>
      </form></Modal>}

      {showEvent && <Modal title="Add timeline event" onClose={() => setShowEvent(false)}><form onSubmit={addEvent} className="form-stack">
        <label>Event title<input autoFocus required value={eventDraft.title} onChange={e => setEventDraft({...eventDraft,title:e.target.value})} placeholder="What happened?"/></label>
        <div className="form-row"><label>Date<input type="date" required value={eventDraft.date} onChange={e => setEventDraft({...eventDraft,date:e.target.value})}/></label><label>Event type<select value={eventDraft.type} onChange={e => setEventDraft({...eventDraft,type:e.target.value})}><option>Signal</option><option>Trigger</option><option>Collaboration</option><option>Platform event</option><option>Open question</option><option>Counter-signal</option></select></label></div>
        <label>Observation / context<textarea value={eventDraft.note} onChange={e => setEventDraft({...eventDraft,note:e.target.value})} placeholder="Describe what you observed. Include source context where possible."/></label>
        <div className="modal-actions"><button type="button" className="outline" onClick={() => setShowEvent(false)}>Cancel</button><button className="primary" type="submit">Save event</button></div>
      </form></Modal>}

      {showEvidence && <Modal title="Add evidence source" onClose={() => setShowEvidence(false)}><form onSubmit={addEvidence} className="form-stack">
        <label>Source title<input autoFocus required value={evidenceDraft.title} onChange={e => setEvidenceDraft({...evidenceDraft,title:e.target.value})} placeholder="Post, article or public source title"/></label>
        <label>Source URL<input type="url" required value={evidenceDraft.url} onChange={e => setEvidenceDraft({...evidenceDraft,url:e.target.value})} placeholder="https://..."/></label>
        <label>Source type<select value={evidenceDraft.kind} onChange={e => setEvidenceDraft({...evidenceDraft,kind:e.target.value})}><option>External link</option><option>X post</option><option>News article</option><option>Video</option><option>Official announcement</option><option>Other</option></select></label>
        <label>What does it support?<textarea value={evidenceDraft.note} onChange={e => setEvidenceDraft({...evidenceDraft,note:e.target.value})} placeholder="Briefly explain why this source matters."/></label>
        <div className="modal-actions"><button type="button" className="outline" onClick={() => setShowEvidence(false)}>Cancel</button><button className="primary" type="submit">Save source</button></div>
      </form></Modal>}
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><div className="modal"><div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={18}/></button></div>{children}</div></div>;
}

export default App;