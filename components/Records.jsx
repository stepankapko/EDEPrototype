// Records browser: filterable table of events + participants
const RecordsView = ({ data }) => {
  const [region, setRegion] = React.useState("");
  const [intervention, setIntervention] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [selected, setSelected] = React.useState(null);

  const schoolByRedizo = Object.fromEntries(data.schools.map(s => [s.redizo, s]));
  const interventionByCode = Object.fromEntries(data.interventions.map(i => [i.code, i]));
  const regionByCode = Object.fromEntries(data.regions.map(r => [r.code, r]));

  const filtered = data.events.filter(e => {
    if (region && e.region !== region) return false;
    if (intervention && e.intervention !== intervention) return false;
    if (search) {
      const s = search.toLowerCase();
      const sc = schoolByRedizo[e.school];
      if (!sc?.name.toLowerCase().includes(s) && !e.id.toLowerCase().includes(s)) return false;
    }
    return true;
  }).slice(0, 30);

  return (
    <div>
      <div className="filterbar">
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <input className="input" placeholder="Hledat školu, ID akce…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', paddingLeft: 30 }} />
          <div style={{ position: 'absolute', left: 10, top: 9, color: 'var(--ink-400)' }}><Icon name="search" size={14}/></div>
        </div>
        <select className="select" value={region} onChange={e => setRegion(e.target.value)}>
          <option value="">Všechny regiony</option>
          {data.regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
        </select>
        <select className="select" value={intervention} onChange={e => setIntervention(e.target.value)}>
          <option value="">Všechny intervence</option>
          {data.interventions.map(i => <option key={i.code} value={i.code}>{i.name}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>
            {filtered.length} / {data.events.length} záznamů
          </span>
          <button className="btn btn-sm"><Icon name="download" size={12}/> Export .xlsx</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>ID</th>
              <th>Datum</th>
              <th>Region</th>
              <th>Škola</th>
              <th>Intervence</th>
              <th style={{ textAlign: 'right' }}>Účastníci</th>
              <th style={{ textAlign: 'right' }}>Hodiny</th>
              <th>Nahráno</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => {
              const s = schoolByRedizo[e.school];
              const iv = interventionByCode[e.intervention];
              const r = regionByCode[e.region];
              return (
                <tr key={e.id} onClick={() => setSelected(e)} style={{ cursor: 'pointer' }}>
                  <td className="mono">{e.id}</td>
                  <td className="mono">{e.date}</td>
                  <td><Chip tone="terra" dot>{r?.name}</Chip></td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s?.name}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>{s?.type} · {s?.redizo}</div>
                  </td>
                  <td><Chip tone="moss">{iv?.name}</Chip></td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{e.participants.length}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{e.hours} h</td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>{e.uploadedBy.split('@')[0]}</td>
                  <td><Icon name="chevron" size={14}/></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && <RecordDetail event={selected} data={data} onClose={() => setSelected(null)} />}
    </div>
  );
};

const RecordDetail = ({ event, data, onClose }) => {
  const s = data.schools.find(x => x.redizo === event.school);
  const iv = data.interventions.find(x => x.code === event.intervention);
  const r = data.regions.find(x => x.code === event.region);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="card-sub">Záznam akce · {event.id}</div>
            <h2 className="card-title" style={{ fontSize: 22 }}>{iv?.name} — {s?.name}</h2>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ marginLeft: 'auto' }}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body">
          <div className="grid-3" style={{ marginBottom: 18 }}>
            <div><div className="label">Datum</div><div className="mono">{event.date}</div></div>
            <div><div className="label">Region</div><div>{r?.name}</div></div>
            <div><div className="label">Intenzita</div><div className="mono">{event.hours} h</div></div>
            <div><div className="label">Nahrál</div><div className="mono" style={{ fontSize: 12 }}>{event.uploadedBy}</div></div>
            <div><div className="label">Soubor</div><div className="mono" style={{ fontSize: 11 }}>{event.filename}</div></div>
            <div><div className="label">Znak</div><div>{iv?.pillar}</div></div>
          </div>

          <div className="label" style={{ marginBottom: 8 }}>Účastníci ({event.participants.length})</div>
          <div className="table-wrap" style={{ maxHeight: 320, overflow: 'auto' }}>
            <table className="data">
              <thead><tr><th>Jméno</th><th>Role</th><th>REDIZO</th><th style={{textAlign:'right'}}>Historie</th></tr></thead>
              <tbody>
                {event.participants.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td><Chip>{p.role}</Chip></td>
                    <td className="mono">{p.redizo}</td>
                    <td style={{ textAlign: 'right' }} className="mono">{(i % 4) + 1}× účast</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, fontSize: 11.5, color: 'var(--ink-500)', display: 'flex', gap: 6, alignItems: 'center' }}>
            <Icon name="clock" size={12}/>
            <span className="mono">Change log: vytvořeno {event.uploadedAt} · žádné pozdější úpravy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { RecordsView });
