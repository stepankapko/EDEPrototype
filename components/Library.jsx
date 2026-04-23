// Data Library: document cards with search + filters
const LibraryView = ({ data }) => {
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("");
  const [region, setRegion] = React.useState("");
  const [selected, setSelected] = React.useState(null);

  const types = [...new Set(data.documents.map(d => d.type))];

  const filtered = data.documents.filter(d => {
    if (type && d.type !== type) return false;
    if (region && d.region !== region) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!d.title.toLowerCase().includes(s) &&
          !d.snippet.toLowerCase().includes(s) &&
          !d.tags.some(t => t.toLowerCase().includes(s))) return false;
    }
    return true;
  });

  const highlight = (text, term) => {
    if (!term) return text;
    const re = new RegExp(`(${term})`, 'gi');
    const parts = text.split(re);
    return parts.map((p, i) => re.test(p) ? <mark key={i}>{p}</mark> : p);
  };

  return (
    <div>
      <div className="filterbar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
          <input className="input" placeholder="Full-text hledání v obsahu dokumentů…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', paddingLeft: 30 }} />
          <div style={{ position: 'absolute', left: 10, top: 9, color: 'var(--ink-400)' }}><Icon name="search" size={14}/></div>
        </div>
        <select className="select" value={type} onChange={e => setType(e.target.value)}>
          <option value="">Všechny typy</option>
          {types.map(t => <option key={t}>{t}</option>)}
        </select>
        <select className="select" value={region} onChange={e => setRegion(e.target.value)}>
          <option value="">Všechny regiony</option>
          {data.regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
          <option value="—">Bez regionu</option>
        </select>
        <div style={{ marginLeft: 'auto' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>{filtered.length} dokumentů</span>
        </div>
      </div>

      <div className="lib-grid">
        {filtered.map(d => (
          <div key={d.id} className="doc-card" onClick={() => setSelected(d)}>
            <div className="doc-head">
              <div className="doc-icon">{d.format}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="doc-title">{highlight(d.title, search)}</div>
                <div className="doc-meta">{d.type} · {d.date} · {d.size}</div>
              </div>
            </div>
            <div className="doc-snippet">{highlight(d.snippet, search)}</div>
            <div className="doc-tags">
              {d.region !== "—" && <Chip tone="terra" dot>{data.regions.find(r => r.code === d.region)?.name || d.region}</Chip>}
              {d.tags.slice(0, 3).map(t => <Chip key={t} tone={t.startsWith('Znak') ? 'plum' : ''}>{t}</Chip>)}
              {d.tags.length > 3 && <Chip>+{d.tags.length - 3}</Chip>}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <div className="doc-icon" style={{ width: 44, height: 54 }}>{selected.format}</div>
              <div style={{ flex: 1 }}>
                <div className="card-sub">{selected.type}</div>
                <h2 className="card-title" style={{ fontSize: 20 }}>{selected.title}</h2>
              </div>
              <button className="btn btn-sm"><Icon name="download" size={12}/> Stáhnout</button>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}><Icon name="x" size={16}/></button>
            </div>
            <div className="modal-body">
              <div className="grid-3" style={{ marginBottom: 20 }}>
                <div><div className="label">Datum</div><div className="mono">{selected.date}</div></div>
                <div><div className="label">Velikost</div><div className="mono">{selected.size}</div></div>
                <div><div className="label">Region</div><div>{data.regions.find(r => r.code === selected.region)?.name || '—'}</div></div>
              </div>

              <div className="label" style={{ marginBottom: 6 }}>AI-generované štítky</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                {selected.tags.map(t => <Chip key={t} tone={t.startsWith('Znak') ? 'plum' : ''}>{t}</Chip>)}
              </div>

              <div className="label" style={{ marginBottom: 6 }}>Náhled obsahu</div>
              <div style={{ padding: 16, background: 'var(--paper-2)', borderRadius: 'var(--radius)', fontSize: 13, lineHeight: 1.6, fontStyle: 'italic', color: 'var(--ink-700)' }}>
                „{selected.snippet}"
                <div style={{ marginTop: 10, fontSize: 11, fontStyle: 'normal', color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>
                  — prvních ~180 znaků · celý dokument indexován pro full-text search
                </div>
              </div>

              {selected.type === "Analýza" && (
                <div style={{ marginTop: 18, padding: 12, background: 'var(--moss-soft)', borderRadius: 'var(--radius)', fontSize: 12, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Icon name="info" size={14}/>
                  <span>Soubor typu <strong>Analýza</strong> — zpracováván samostatným workflow. Spouští se pouze AI tagování témat, nikoli plná analytická pipeline (sentiment, kulturní metriky).</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { LibraryView });
