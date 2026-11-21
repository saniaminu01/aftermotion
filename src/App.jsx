
import React, { useMemo, useState } from "react";
import {
  Activity, Archive, ArrowUpRight, BadgeCheck, BookOpen, ChevronRight,
  CircleHelp, Clock3, FilePlus2, Filter, FolderSearch, Link2, Plus,
  Search, ShieldCheck, Sparkles, Trash2, X, LayoutDashboard
} from "lucide-react";

const STORAGE_KEY = "aftermotion-cases-v1";
const starterCases = [];

const blankCase = () => ({
  id: crypto.randomUUID(),
  name: "",
  handle: "",
  category: "Creator case study",
  status: "Research in progress",
  summary: "",
  verdict: "Inconclusive",
  confidence: "Low",
  updated: "Just now",
  events: [],
  evidence: [],
  notes: ""
});

function loadCases() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return starterCases;
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return starterCases;

    return parsed.map(c => ({
      ...c,
      events: Array.isArray(c.events) ? c.events : [],
      evidence: Array.isArray(c.evidence) ? c.evidence : [],
      notes: typeof c.notes === "string" ? c.notes : ""
    }));
  } catch {
    return starterCases;
  }
}

function App() {
  const [cases, setCases] = useState(loadCases);
  const [selectedId, setSelectedId] = useState(() => {
    const saved = loadCases();
    return saved[0]?.id || null;
  });
  const [view, setView] = useState("overview");
  const [activeTab, setActiveTab] = useState("overview");
  const [query, setQuery] = useState("");
  const [evidenceQuery, setEvidenceQuery] = useState("");
  const [notesQuery, setNotesQuery] = useState("");
  const [evidenceCaseFilter, setEvidenceCaseFilter] = useState("all");
  const [notesCaseFilter, setNotesCaseFilter] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [draft, setDraft] = useState(blankCase);
  const [eventDraft, setEventDraft] = useState({
    date: new Date().toISOString().slice(0, 10),
    title: "", type: "Signal", note: ""
  });
  const [evidenceDraft, setEvidenceDraft] = useState({
    title: "", url: "", kind: "External link", note: ""
  });

  const selected = cases.find(c => c.id === selectedId) || cases[0] || null;

  const filteredCases = useMemo(() => cases.filter(c =>
    `${c.name} ${c.handle} ${c.category}`.toLowerCase().includes(query.toLowerCase())
  ), [cases, query]);

  const allEvidence = useMemo(() => cases.flatMap(c =>
    c.evidence.map(item => ({ ...item, caseId: c.id, caseName: c.name, handle: c.handle }))
  ), [cases]);

  const allNotes = useMemo(() => cases
    .filter(c => c.notes.trim())
    .map(c => ({ id: c.id, caseId: c.id, caseName: c.name, handle: c.handle, notes: c.notes, updated: c.updated })),
  [cases]);

  const filteredEvidence = useMemo(() => allEvidence.filter(item => {
    const matchesQuery = `${item.title} ${item.url} ${item.note} ${item.caseName} ${item.kind}`
      .toLowerCase().includes(evidenceQuery.toLowerCase());
    const matchesCase = evidenceCaseFilter === "all" || item.caseId === evidenceCaseFilter;
    return matchesQuery && matchesCase;
  }), [allEvidence, evidenceQuery, evidenceCaseFilter]);

  const filteredNotes = useMemo(() => allNotes.filter(item => {
    const matchesQuery = `${item.caseName} ${item.handle} ${item.notes}`
      .toLowerCase().includes(notesQuery.toLowerCase());
    const matchesCase = notesCaseFilter === "all" || item.caseId === notesCaseFilter;
    return matchesQuery && matchesCase;
  }), [allNotes, notesQuery, notesCaseFilter]);

  const totalEvents = cases.reduce((sum, c) => sum + c.events.length, 0);

  function persist(next) {
    setCases(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function updateCase(id, patch) {
    persist(cases.map(c => c.id === id
      ? { ...c, ...patch, updated: "Just now" }
      : c
    ));
  }

  function updateSelected(patch) {
    if (!selected) return;
    updateCase(selected.id, patch);
  }

  function openCase(id, tab = "overview") {
    setSelectedId(id);
    setActiveTab(tab);
    setView("cases");
  }

  function createCase(e) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    const next = [draft, ...cases];
    persist(next);
    setSelectedId(draft.id);
    setDraft(blankCase());
    setShowNew(false);
    setActiveTab("overview");
    setView("cases");
  }

  function addEvent(e) {
    e.preventDefault();
    if (!eventDraft.title.trim() || !selected) return;

    updateSelected({
      events: [...selected.events, {
        ...eventDraft,
        id: crypto.randomUUID()
      }].sort((a, b) => a.date.localeCompare(b.date))
    });

    setEventDraft({
      date: new Date().toISOString().slice(0, 10),
      title: "", type: "Signal", note: ""
    });
    setShowEvent(false);
  }

  function addEvidence(e) {
    e.preventDefault();
    if (!evidenceDraft.title.trim() || !evidenceDraft.url.trim() || !selected) return;

    updateSelected({
      evidence: [...selected.evidence, {
        ...evidenceDraft,
        id: crypto.randomUUID()
      }]
    });

    setEvidenceDraft({ title: "", url: "", kind: "External link", note: "" });
    setShowEvidence(false);
  }

  function removeCase() {
    if (!selected || !window.confirm(`Permanently delete "${selected.name}" and ALL its timeline events, evidence records and research notes? This action cannot be undone.`)) return;q
    const next = cases.filter(c => c.id !== selected.id);
    persist(next);
    setSelectedId(next[0]?.id || null);
  }

  function removeItem(key, id, caseId = selected?.id) {
    const target = cases.find(c => c.id === caseId);
    if (!target) return;
    updateCase(caseId, {
      [key]: target[key].filter(item => item.id !== id)
    });
  }

  function startNewCase() {
    setDraft(blankCase());
    setShowNew(true);
  }

  function renderCaseList() {
    return (
      <section className="case-list-panel">
        <div className="panel-head">
          <div>
            <h2>All investigations</h2>
            <span>{cases.length} case file{cases.length === 1 ? "" : "s"}</span>
          </div>
          <Filter size={16} />
        </div>
        <div className="searchbox">
          <Search size={16} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search creators..." />
        </div>
        <div className="case-list">
          {filteredCases.map(c => (
            <button key={c.id} className={`case-item ${selected?.id === c.id ? "selected" : ""}`}
              onClick={() => { setSelectedId(c.id); setActiveTab("overview"); }}>
              <div className="case-avatar">{c.name.slice(0, 1).toUpperCase()}</div>
              <div className="case-item-copy">
                <b>{c.name}</b>
                <span>{c.handle || "No handle added"}</span>
                <small>{c.status}</small>
              </div>
              <ChevronRight size={15} />
            </button>
          ))}
          {filteredCases.length === 0 && (
            <div className="empty-small">{cases.length ? "No matching case files." : "No investigations created yet."}</div>
          )}
        </div>
        <button className="new-case-link" onClick={startNewCase}>
          <FilePlus2 size={16} /> Create an investigation
        </button>
      </section>
    );
  }

  function renderCaseDetail() {
    if (!selected) {
      return (
        <section className="detail-panel">
          <div className="empty-state">
            <FolderSearch size={30} />
            <h2>No case files yet</h2>
            <p>Create your first investigation to begin documenting public evidence.</p>
            <button className="primary" onClick={startNewCase}><Plus size={16} /> New investigation</button>
          </div>
        </section>
      );
    }

    return (
      <section className="detail-panel">
        <div className="detail-top">
          <div>
            <div className="eyebrow">CASE FILE / {selected.id.slice(-6).toUpperCase()}</div>
            <h2>{selected.name}</h2>
            <div className="handle">{selected.handle || "Creator handle not added"} <span>·</span> {selected.category}</div>
          </div>
          <button className="icon-button danger-ghost" title="Delete case file" onClick={removeCase}><Trash2 size={16} /></button>
        </div>

        <div className="summary-box">
          <div className="summary-label">INVESTIGATION QUESTION</div>
          <p>{selected.summary || "What events, if any, explain the creator's changing attention and cultural relevance?"}</p>
        </div>

        <nav className="tabs">
          {["overview", "evidence", "research"].map(t => (
            <button key={t} className={activeTab === t ? "tab active-tab" : "tab"}
              onClick={() => setActiveTab(t)}>
              {t === "overview" ? "Timeline" : t === "evidence" ? "Evidence" : "Research notes"}
            </button>
          ))}
        </nav>

        {activeTab === "overview" && (
          <div className="tab-content">
            <div className="section-heading">
              <div><h3>Event timeline</h3><p>Record dated events and observations in sequence.</p></div>
              <button className="outline small" onClick={() => setShowEvent(true)}><Plus size={15} /> Add event</button>
            </div>
            {selected.events.length === 0 ? (
              <div className="empty-inline">No events recorded. Add the first dated observation.</div>
            ) : (
              <div className="timeline">
                {selected.events.map(ev => (
                  <div className="timeline-row" key={ev.id}>
                    <div className="timeline-date">{ev.date}</div>
                    <div className="timeline-dot" />
                    <div className="timeline-card">
                      <div className="timeline-card-top">
                        <b>{ev.title}</b>
                        <button className="tiny-delete" onClick={() => removeItem("events", ev.id)} title="Remove event"><X size={14} /></button>
                      </div>
                      <span className="tag">{ev.type}</span>
                      {ev.note && <p>{ev.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="section-heading verdict-heading">
              <div><h3>Current assessment</h3><p>Analyst judgment, not an automated Motion score.</p></div>
              <BadgeCheck size={18} />
            </div>
            <div className="assessment-grid">
              <label>Verdict
                <select value={selected.verdict} onChange={e => updateSelected({ verdict: e.target.value })}>
                  <option>Inconclusive</option><option>Temporary spike</option>
                  <option>Sustained momentum</option><option>Declining attention</option>
                </select>
              </label>
              <label>Confidence
                <select value={selected.confidence} onChange={e => updateSelected({ confidence: e.target.value })}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </label>
            </div>
            <div className="notice"><ShieldCheck size={16} /><span>Keep the verdict proportional to the evidence. If the cause is uncertain, say so.</span></div>
          </div>
        )}

        {activeTab === "evidence" && (
          <div className="tab-content">
            <div className="section-heading">
              <div><h3>Evidence records</h3><p>Keep source links attached to the claims they support.</p></div>
              <button className="outline small" onClick={() => setShowEvidence(true)}><Plus size={15} /> Add source</button>
            </div>
            {selected.evidence.length === 0 ? (
              <div className="empty-inline">No sources saved. Add public posts, articles or other verifiable references.</div>
            ) : (
              <div className="evidence-list">
                {selected.evidence.map(src => (
                  <div className="evidence-card" key={src.id}>
                    <div className="evidence-icon"><Link2 size={17} /></div>
                    <div className="evidence-copy">
                      <b>{src.title}</b><span>{src.kind}</span>
                      <a href={src.url} target="_blank" rel="noreferrer">{src.url} <ArrowUpRight size={12} /></a>
                      {src.note && <p>{src.note}</p>}
                    </div>
                    <button className="tiny-delete" onClick={() => removeItem("evidence", src.id)} title="Remove source"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "research" && (
          <div className="tab-content">
            <div className="section-heading">
              <div><h3>Analyst notes</h3><p>Record hypotheses, alternative explanations and unanswered questions.</p></div>
              <Sparkles size={18} />
            </div>
            <textarea className="notes-area" value={selected.notes}
              onChange={e => updateSelected({ notes: e.target.value })}
              placeholder="What do the sources suggest? What else could explain the change? What evidence would challenge your current interpretation?" />
            <div className="notice"><Clock3 size={16} /><span>Notes are saved automatically in this browser.</span></div>
          </div>
        )}
      </section>
    );
  }

  function renderOverview() {
    return (
      <>
        <section className="page-heading">
          <div>
            <div className="eyebrow">INVESTIGATION COMMAND CENTRE</div>
            <h1>Intelligence beyond <em>the influence.</em></h1>
            <p>Your investigation command centre. Track creator cases, examine evidence and document what the public record actually supports.</p>
          </div>
          <button className="primary" onClick={startNewCase}><Plus size={16} /> New investigation</button>
        </section>

        <section className="dashboard-metrics">
          <Metric label="Total investigations" value={cases.length} icon={<FolderSearch size={17} />} />
          <Metric label="Evidence records" value={allEvidence.length} icon={<Archive size={17} />} />
          <Metric label="Timeline events" value={totalEvents} icon={<Clock3 size={17} />} />
          <Metric label="Research notes" value={allNotes.length} icon={<BookOpen size={17} />} />
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-head">
            <div><h2>Recent investigations</h2><p>Your creator cases and their current status.</p></div>
            <button className="text-link" onClick={() => setView("cases")}>View all cases <ArrowUpRight size={14} /></button>
          </div>
          {cases.length === 0 ? (
            <div className="dashboard-empty">
              <FolderSearch size={30} />
              <h3>Nothing to investigate. Yet.</h3>
              <p>Create your first case file to begin documenting public evidence, building timelines and testing hypotheses.</p>
              <button className="outline small" onClick={startNewCase}><Plus size={15} /> New investigation</button>
            </div>
          ) : (
            <div className="recent-list">
              {cases.slice(0, 6).map(c => (
                <button className="recent-row" key={c.id} onClick={() => openCase(c.id)}>
                  <div className="case-avatar">{c.name.slice(0, 1).toUpperCase()}</div>
                  <div className="recent-name"><b>{c.name}</b><span>{c.handle || "No handle added"}</span></div>
                  <span className="recent-status">{c.status}</span>
                  <span className="recent-count">{c.evidence.length} evidence</span>
                  <span className="recent-count">{c.events.length} events</span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="dashboard-lower">
          <section className="dashboard-panel">
            <div className="dashboard-panel-head"><div><h2>Investigation activity</h2><p>Recent updates from your case files.</p></div><Activity size={17} /></div>
            {cases.length === 0 ? (
              <div className="activity-empty"><Clock3 size={18} /><p>Evidence additions, timeline events and research updates will appear here as your investigations develop.</p></div>
            ) : (
              <div className="activity-list">
                {cases.slice(0, 5).map(c => (
                  <button className="activity-row" key={c.id} onClick={() => openCase(c.id)}>
                    <span className="activity-marker" />
                    <span><b>{c.name}</b><small>{c.events.length} events · {c.evidence.length} evidence records · {c.notes.trim() ? "Notes added" : "No notes yet"}</small></span>
                  </button>
                ))}
              </div>
            )}
          </section>
          <aside className="integrity-panel">
            <div className="eyebrow"><ShieldCheck size={14} /> RESEARCH INTEGRITY</div>
            <h2>Evidence is not interpretation.</h2>
            <p>AFTERMOTION separates documented public information from analyst conclusions. Correlation does not establish causation. Every assessment should remain open to scrutiny.</p>
          </aside>
        </div>
      </>
    );
  }

  function renderEvidenceVault() {
    return (
      <>
        <section className="page-heading">
          <div>
            <div className="eyebrow">GLOBAL SOURCE ARCHIVE</div>
            <h1>Evidence Vault</h1>
            <p>Public sources gathered across your investigations. A saved source is not automatically a verified claim.</p>
          </div>
          <button className="primary" onClick={() => {
            if (!selected) { setView("cases"); startNewCase(); return; }
            setShowEvidence(true);
          }}><Plus size={16} /> Add evidence</button>
        </section>

        <section className="dashboard-metrics">
          <Metric label="Total records" value={allEvidence.length} icon={<Archive size={17} />} />
          <Metric label="Investigations represented" value={new Set(allEvidence.map(x => x.caseId)).size} icon={<FolderSearch size={17} />} />
          <Metric label="Source types" value={new Set(allEvidence.map(x => x.kind)).size} icon={<Link2 size={17} />} />
          <Metric label="Investigations" value={cases.length} icon={<BookOpen size={17} />} />
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-head">
            <div><h2>All evidence records</h2><p>Search and review sources across your case files.</p></div>
            <span className="mono-label">{filteredEvidence.length} RECORDS</span>
          </div>
          <div className="archive-controls">
            <div className="searchbox"><Search size={16} /><input value={evidenceQuery} onChange={e => setEvidenceQuery(e.target.value)} placeholder="Search title, URL, note or creator..." /></div>
            <select value={evidenceCaseFilter} onChange={e => setEvidenceCaseFilter(e.target.value)}>
              <option value="all">All investigations</option>
              {cases.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="text-link" onClick={() => { setEvidenceQuery(""); setEvidenceCaseFilter("all"); }}>Clear filters</button>
          </div>
          {filteredEvidence.length === 0 ? (
            <div className="dashboard-empty">
              <Archive size={29} />
              <h3>{allEvidence.length ? "No matching evidence." : "Your evidence archive starts here."}</h3>
              <p>{allEvidence.length ? "Try changing your search or filters." : "Add public posts, articles and source links to a case file. They will appear here automatically."}</p>
              {cases.length > 0 && <button className="outline small" onClick={() => { setView("cases"); setShowEvidence(true); }}><Plus size={15} /> Add source to selected case</button>}
              {cases.length === 0 && <button className="outline small" onClick={startNewCase}><Plus size={15} /> Create an investigation</button>}
            </div>
          ) : (
            <div className="archive-list">
              {filteredEvidence.map(item => (
                <article className="archive-card" key={`${item.caseId}-${item.id}`}>
                  <div className="evidence-icon"><Link2 size={17} /></div>
                  <div className="archive-card-copy">
                    <b>{item.title}</b>
                    <span>{item.kind} · {item.caseName}</span>
                    <a href={item.url} target="_blank" rel="noreferrer">{item.url} <ArrowUpRight size={12} /></a>
                    {item.note && <p>{item.note}</p>}
                  </div>
                  <button className="text-link" onClick={() => openCase(item.caseId, "evidence")}>Open case</button>
                  <button className="tiny-delete" title="Delete evidence" onClick={() => {
                    if (window.confirm("Delete this evidence record?")) removeItem("evidence", item.id, item.caseId);
                  }}><Trash2 size={14} /></button>
                </article>
              ))}
            </div>
          )}
        </section>
      </>
    );
  }

  function renderResearchNotes() {
    return (
      <>
        <section className="page-heading">
          <div>
            <div className="eyebrow">ANALYST WORKSPACE</div>
            <h1>Research Notes</h1>
            <p>Thinking beyond the evidence. Keep observations, interpretations and open questions visible.</p>
          </div>
        </section>

        <section className="dashboard-metrics">
          <Metric label="Total notes" value={allNotes.length} icon={<BookOpen size={17} />} />
          <Metric label="Investigations with notes" value={allNotes.length} icon={<FolderSearch size={17} />} />
          <Metric label="Open questions" value="—" icon={<CircleHelp size={17} />} />
          <Metric label="Recently updated" value="—" icon={<Clock3 size={17} />} />
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-head">
            <div><h2>All research notes</h2><p>Notes are stored with their associated investigation.</p></div>
            <span className="mono-label">{filteredNotes.length} INVESTIGATIONS</span>
          </div>
          <div className="archive-controls">
            <div className="searchbox"><Search size={16} /><input value={notesQuery} onChange={e => setNotesQuery(e.target.value)} placeholder="Search creator, case or note text..." /></div>
            <select value={notesCaseFilter} onChange={e => setNotesCaseFilter(e.target.value)}>
              <option value="all">All investigations</option>
              {cases.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button className="text-link" onClick={() => { setNotesQuery(""); setNotesCaseFilter("all"); }}>Clear filters</button>
          </div>
          {filteredNotes.length === 0 ? (
            <div className="dashboard-empty">
              <BookOpen size={29} />
              <h3>{allNotes.length ? "No matching notes." : "The next question starts here."}</h3>
              <p>{allNotes.length ? "Try another search or filter." : "Add observations, challenge assumptions and document unanswered questions inside an investigation."}</p>
              <button className="outline small" onClick={() => setView("cases")}>Open Case Files <ArrowUpRight size={14} /></button>
            </div>
          ) : (
            <div className="archive-list">
              {filteredNotes.map(item => (
                <article className="note-archive-card" key={item.id}>
                  <div className="note-card-top">
                    <div><span className="note-category">ANALYST NOTES</span><h3>{item.caseName}</h3><span>{item.handle || "No handle added"}</span></div>
                    <button className="text-link" onClick={() => openCase(item.caseId, "research")}>Open investigation <ArrowUpRight size={14} /></button>
                  </div>
                  <p className="note-preview">{item.notes}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">A.</div>
          <div><strong>AFTERMOTION</strong><span>INVESTIGATIVE INTELLIGENCE</span></div>
        </div>
        <div className="side-label">WORKSPACE</div>
        <button className={`side-link ${view === "overview" ? "active" : ""}`} onClick={() => setView("overview")}><LayoutDashboard size={17} /> Overview</button>
        <button className={`side-link ${view === "cases" ? "active" : ""}`} onClick={() => setView("cases")}><FolderSearch size={17} /> Case files <span className="count">{cases.length}</span></button>
        <button className={`side-link ${view === "evidence" ? "active" : ""}`} onClick={() => setView("evidence")}><Archive size={17} /> Evidence vault <span className="count">{allEvidence.length}</span></button>
        <button className={`side-link ${view === "research" ? "active" : ""}`} onClick={() => setView("research")}><BookOpen size={17} /> Research notes <span className="count">{allNotes.length}</span></button>
        <div className="side-bottom">
          <div className="privacy-card"><ShieldCheck size={17} /><div><b>Evidence first</b><p>Separate documented facts from interpretation. Every claim should have a trail.</p></div></div>
          <div className="profile"><div className="avatar">A</div><div><b>Research workspace</b><span>Local project · Browser storage</span></div><CircleHelp size={16} /></div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="crumb">Workspace <ChevronRight size={14} /> <b>{view === "overview" ? "Overview" : view === "cases" ? "Case files" : view === "evidence" ? "Evidence vault" : "Research notes"}</b></div>
          <div className="top-actions">
            <span className="local-badge"><span /> LOCAL DATA</span>
            <button className="primary small" onClick={startNewCase}><Plus size={16} /> New investigation</button>
          </div>
        </header>

        {view === "overview" && <div className="view-content">{renderOverview()}</div>}
        {view === "cases" && (
          <div className="view-content">
            <section className="page-heading">
              <div><div className="eyebrow">RESEARCH WORKSPACE / 001</div><h1>Creator case files</h1><p>Investigate the events behind a creator's changing cultural relevance.</p></div>
              <div className="heading-meta"><span className="meta-label">RESEARCH MODE</span><b><Activity size={15} /> Evidence-led analysis</b></div>
            </section>
            <div className="content-grid">{renderCaseList()}{renderCaseDetail()}</div>
          </div>
        )}
        {view === "evidence" && <div className="view-content">{renderEvidenceVault()}</div>}
        {view === "research" && <div className="view-content">{renderResearchNotes()}</div>}

        
<footer className="footer">
  <span>AFTERMOTION © 2026</span>
  <span>Independent research workspace · Not affiliated with Motion</span>
  <span>v0.2.0</span>
  <span className="signature">Made with love by Sirney ♥</span>
</footer>

      </main>

      {showNew && (
        <Modal title="Create an investigation" onClose={() => setShowNew(false)}>
          <form onSubmit={createCase} className="form-stack">
            <label>Creator / subject name<input autoFocus required value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Creator name" /></label>
            <label>X handle or primary profile<input value={draft.handle} onChange={e => setDraft({ ...draft, handle: e.target.value })} placeholder="@handle" /></label>
            <label>Investigation question<textarea value={draft.summary} onChange={e => setDraft({ ...draft, summary: e.target.value })} placeholder="What change in attention are you investigating?" /></label>
            <div className="modal-actions"><button type="button" className="outline" onClick={() => setShowNew(false)}>Cancel</button><button className="primary" type="submit">Create case file</button></div>
          </form>
        </Modal>
      )}

      {showEvent && selected && (
        <Modal title="Add timeline event" onClose={() => setShowEvent(false)}>
          <form onSubmit={addEvent} className="form-stack">
            <label>Event title<input autoFocus required value={eventDraft.title} onChange={e => setEventDraft({ ...eventDraft, title: e.target.value })} placeholder="What happened?" /></label>
            <div className="form-row">
              <label>Date<input type="date" required value={eventDraft.date} onChange={e => setEventDraft({ ...eventDraft, date: e.target.value })} /></label>
              <label>Event type<select value={eventDraft.type} onChange={e => setEventDraft({ ...eventDraft, type: e.target.value })}><option>Signal</option><option>Trigger</option><option>Collaboration</option><option>Platform event</option><option>Open question</option><option>Counter-signal</option></select></label>
            </div>
            <label>Observation / context<textarea value={eventDraft.note} onChange={e => setEventDraft({ ...eventDraft, note: e.target.value })} placeholder="Describe what you observed. Include source context where possible." /></label>
            <div className="modal-actions"><button type="button" className="outline" onClick={() => setShowEvent(false)}>Cancel</button><button className="primary" type="submit">Save event</button></div>
          </form>
        </Modal>
      )}

      {showEvidence && selected && (
        <Modal title={`Add evidence · ${selected.name}`} onClose={() => setShowEvidence(false)}>
          <form onSubmit={addEvidence} className="form-stack">
            <label>Source title<input autoFocus required value={evidenceDraft.title} onChange={e => setEvidenceDraft({ ...evidenceDraft, title: e.target.value })} placeholder="Post, article or public source title" /></label>
            <label>Source URL<input type="url" required value={evidenceDraft.url} onChange={e => setEvidenceDraft({ ...evidenceDraft, url: e.target.value })} placeholder="https://" /></label>
            <label>Source type<select value={evidenceDraft.kind} onChange={e => setEvidenceDraft({ ...evidenceDraft, kind: e.target.value })}><option>External link</option><option>X post</option><option>News article</option><option>Video</option><option>Official announcement</option><option>Other</option></select></label>
            <label>What does it support?<textarea value={evidenceDraft.note} onChange={e => setEvidenceDraft({ ...evidenceDraft, note: e.target.value })} placeholder="Briefly explain why this source matters." /></label>
            <div className="modal-actions"><button type="button" className="outline" onClick={() => setShowEvidence(false)}>Cancel</button><button className="primary" type="submit">Save source</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Metric({ label, value, icon }) {
  return (
    <article className="metric">
      <div className="metric-label">{label}{icon}</div>
      <span className="metric-value">{value}</span>
      <div className="metric-caption">LIVE WORKSPACE DATA</div>
    </article>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-head"><h2>{title}</h2><button className="icon-button" onClick={onClose}><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

export default App;
