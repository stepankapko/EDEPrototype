// Reports dashboard — 5 dimensional views + CR map district overview
const ReportsView = ({ data }) => {
  const [view, setView] = React.useState(() => localStorage.getItem('eduscale_reports_view') || 'intervention');
  const [region, setRegion] = React.useState("");
  const [timeRange, setTimeRange] = React.useState("2025-09_2026-04");

  React.useEffect(() => { localStorage.setItem('eduscale_reports_view', view); }, [view]);

  const schoolByRedizo = Object.fromEntries(data.schools.map(s => [s.redizo, s]));
  const interventionByCode = Object.fromEntries(data.interventions.map(i => [i.code, i]));
  const regionByCode = Object.fromEntries(data.regions.map(r => [r.code, r]));

  const filteredEvents = data.events.filter(e => !region || e.region === region);

  // Shared KPIs
  const totalEvents = filteredEvents.length;
  const totalRecords = filteredEvents.reduce((a, e) => a + e.participants.length, 0);
  const uniqueSet = new Set();
  filteredEvents.forEach(e => e.participants.forEach(p => uniqueSet.add(`${p.name}__${p.redizo}`)));
  const uniqueCount = uniqueSet.size;
  const totalHours = filteredEvents.reduce((a, e) => a + e.hours, 0);
  const schoolSet = new Set(filteredEvents.map(e => e.school));

  const views = [
    { key: 'intervention', label: 'Intervence', desc: 'CPV → Intervence → Čas → Škola' },
    { key: 'cpv',          label: 'CPV',        desc: 'CPV → Čas → Cílová skupina' },
    { key: 'region',       label: 'Region',     desc: 'Region → Čas → Stupeň' },
    { key: 'school',       label: 'Škola',      desc: 'Škola → Čas → Účastník' },
    { key: 'authority',    label: 'Zřizovatel', desc: 'Zřizovatel → Škola → Čas' },
    { key: 'districts',    label: 'Přehled CPV', desc: 'Mapa ČR · demografie · trendy' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 2, background: 'var(--paper-2)', padding: 4, borderRadius: 'var(--radius)', marginBottom: 16, border: '1px solid var(--ink-200)' }}>
        {views.map(v => (
          <button key={v.key}
            onClick={() => setView(v.key)}
            style={{
              flex: 1, border: 'none', background: view === v.key ? 'var(--paper)' : 'transparent',
              padding: '8px 12px', borderRadius: 6, cursor: 'pointer', font: 'inherit',
              boxShadow: view === v.key ? 'var(--shadow-sm)' : 'none',
              color: view === v.key ? 'var(--ink-900)' : 'var(--ink-500)',
              textAlign: 'left',
            }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{v.label}</div>
            <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', opacity: 0.7, marginTop: 2 }}>{v.desc}</div>
          </button>
        ))}
      </div>

      <div className="filterbar">
        <div className="label" style={{ marginRight: 4 }}>Filtr</div>
        <select className="select" value={region} onChange={e => setRegion(e.target.value)}>
          <option value="">Všechny regiony / CPV</option>
          {data.regions.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
        </select>
        <select className="select"><option>Všechny intervence</option>{data.interventions.map(i => <option key={i.code}>{i.name}</option>)}</select>
        <select className="select"><option>Všechny stupně</option><option>MŠ</option><option>ZŠ</option><option>SŠ</option></select>
        <select className="select"><option>Všechny cílové skupiny</option><option>Učitelé</option><option>Ředitelé</option><option>Rodiče</option></select>
        <select className="select" value={timeRange} onChange={e => setTimeRange(e.target.value)}>
          <option value="2025-09_2026-04">Školní rok 2025/26</option>
          <option value="2026-01_2026-04">Q1 2026</option>
          <option value="2026-03_2026-04">Posledních 30 dní</option>
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button className="btn btn-sm"><Icon name="plus" size={12}/> Uložit pohled</button>
          <button className="btn btn-sm btn-primary"><Icon name="download" size={12}/> Export XLSX</button>
        </div>
      </div>

      {view !== 'districts' && (
        <div className="metrics">
          <Metric label="Organizované akce" value={totalEvents} delta="+18 % vs Q4 2025" deltaDir="up"/>
          <Metric label="Záznamy účastníků" value={totalRecords.toLocaleString('cs-CZ')} delta={`${filteredEvents.length} akcí`} />
          <Metric label="Unikátní účastníci" value={uniqueCount.toLocaleString('cs-CZ')} delta="deduplikováno · jméno + REDIZO" />
          <Metric label="Intenzita" value={totalHours} unit="h" delta={`Ø ${(totalHours/Math.max(schoolSet.size,1)).toFixed(1)} h / škola`} />
        </div>
      )}

      {view === 'intervention' && <InterventionView data={data} filteredEvents={filteredEvents} region={region}/>}
      {view === 'cpv'          && <CPVView          data={data} filteredEvents={filteredEvents}/>}
      {view === 'region'       && <RegionView       data={data} filteredEvents={filteredEvents}/>}
      {view === 'school'       && <SchoolView       data={data} filteredEvents={filteredEvents}/>}
      {view === 'authority'    && <AuthorityView    data={data} filteredEvents={filteredEvents}/>}
      {view === 'districts'    && <DistrictsView    data={data}/>}
    </div>
  );
};

// === Intervention View ===
const InterventionView = ({ data, filteredEvents }) => {
  const schoolByRedizo = Object.fromEntries(data.schools.map(s => [s.redizo, s]));
  const interventionByCode = Object.fromEntries(data.interventions.map(i => [i.code, i]));

  // Events by month
  const byMonth = {};
  filteredEvents.forEach(e => { const m = e.date.slice(0,7); byMonth[m] = (byMonth[m]||0)+1; });
  const months = Object.keys(byMonth).sort();
  const maxMonth = Math.max(1, ...Object.values(byMonth));

  // By intervention
  const byInt = {};
  filteredEvents.forEach(e => { byInt[e.intervention] = (byInt[e.intervention]||0) + e.participants.length; });
  const intEntries = Object.entries(byInt).sort((a,b) => b[1]-a[1]);
  const maxInt = Math.max(1, ...Object.values(byInt));

  // New vs returning
  const seen = new Set(); let newC = 0, retC = 0;
  [...filteredEvents].sort((a,b) => a.date.localeCompare(b.date)).forEach(e => {
    e.participants.forEach(p => { const k = `${p.name}__${p.redizo}`; if (seen.has(k)) retC++; else { newC++; seen.add(k); } });
  });

  return (
    <>
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="row-between" style={{ marginBottom: 14 }}>
            <div><div className="card-title">Akce v čase</div><div className="card-sub">Celkem organizováno · měsíčně</div></div>
            <Chip tone="moss" dot>trend roste</Chip>
          </div>
          <svg width="100%" height="180" viewBox="0 0 500 180" preserveAspectRatio="none">
            {months.map((m, i) => {
              const x = (i / Math.max(months.length-1,1)) * 460 + 20;
              const h = (byMonth[m] / maxMonth) * 130;
              return (
                <g key={m}>
                  <rect x={x-14} y={150-h} width="28" height={h} fill="var(--terra)" opacity="0.85" rx="2"/>
                  <text x={x} y={170} className="chart-label" textAnchor="middle">{m.slice(5)}</text>
                  <text x={x} y={150-h-6} className="chart-value" textAnchor="middle">{byMonth[m]}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="card">
          <div className="card-title">Záznamy dle intervence</div>
          <div className="card-sub" style={{ marginBottom: 14 }}>Součet účastí</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {intEntries.map(([code,val]) => {
              const iv = interventionByCode[code];
              return (
                <div key={code} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 50px', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                  <div style={{ fontWeight: 500 }}>{iv?.name}</div>
                  <div style={{ height: 14, background: 'var(--ink-100)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${(val/maxInt)*100}%`, height: '100%', background: 'var(--ink-900)' }}/>
                  </div>
                  <div className="mono" style={{ textAlign: 'right', fontWeight: 600 }}>{val}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <NewReturningDonut newC={newC} retC={retC}/>
        <GradeBreakdown data={data} events={filteredEvents}/>
        <TopSchools data={data} events={filteredEvents}/>
      </div>

      <PivotTable data={data} title="CPV → Intervence → Čas → Škola" chips={['CPV','Intervence','Škola']}/>
    </>
  );
};

// === CPV View ===
const CPVView = ({ data, filteredEvents }) => {
  const schoolByRedizo = Object.fromEntries(data.schools.map(s => [s.redizo, s]));
  const targets = ["Učitelé","Ředitelé","Rodiče","Všichni"];

  // CPV × Target group matrix
  const matrix = {};
  data.regions.filter(r => r.active).forEach(r => {
    matrix[r.code] = Object.fromEntries(targets.map(t => [t, 0]));
  });
  filteredEvents.forEach(e => {
    const iv = data.interventions.find(i => i.code === e.intervention);
    if (iv && matrix[e.region]) matrix[e.region][iv.group] = (matrix[e.region][iv.group] || 0) + 1;
  });

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="row-between" style={{ marginBottom: 14 }}>
          <div><div className="card-title">CPV × Cílová skupina intervence</div><div className="card-sub">Počet organizovaných akcí</div></div>
        </div>
        <table className="data" style={{ marginTop: 8 }}>
          <thead>
            <tr><th>CPV</th>{targets.map(t => <th key={t} style={{textAlign:'right'}}>{t}</th>)}<th style={{textAlign:'right'}}>Celkem</th></tr>
          </thead>
          <tbody>
            {data.regions.filter(r => r.active).map(r => {
              const row = matrix[r.code];
              const total = Object.values(row).reduce((a,b)=>a+b,0);
              const max = Math.max(...Object.values(row), 1);
              return (
                <tr key={r.code}>
                  <td><Chip tone="terra" dot>{r.name}</Chip><span className="mono" style={{marginLeft:8, fontSize:11, color:'var(--ink-500)'}}>{r.orp}</span></td>
                  {targets.map(t => (
                    <td key={t} style={{ textAlign:'right' }}>
                      <span style={{
                        display: 'inline-block', minWidth: 32, padding: '2px 8px', borderRadius: 4,
                        background: row[t] ? `color-mix(in oklch, var(--terra) ${(row[t]/max)*60}%, transparent)` : 'transparent',
                        fontFamily: 'var(--font-mono)', fontWeight: row[t] ? 600 : 400,
                        color: row[t] > max*0.6 ? 'white' : 'var(--ink-900)',
                      }}>{row[t] || '—'}</span>
                    </td>
                  ))}
                  <td style={{ textAlign:'right', fontFamily:'var(--font-mono)', fontWeight:700 }}>{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <StatsCard title="Průměrná docházka na školu" events={filteredEvents} metric="avgPerSchool"/>
        <StatsCard title="Opakovaná účast" events={filteredEvents} metric="repeatRate"/>
      </div>
    </>
  );
};

// === Region View ===
const RegionView = ({ data, filteredEvents }) => {
  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Region → CPV</div>
        <div className="card-sub" style={{ marginBottom: 12 }}>Počet CPV v regionu · 4 aktivní + 3 plánované</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {data.regions.map(r => {
            const events = filteredEvents.filter(e => e.region === r.code);
            return (
              <div key={r.code} style={{
                padding: 14, border: '1px solid var(--ink-200)', borderRadius: 'var(--radius)',
                background: r.active ? 'var(--paper)' : 'var(--paper-2)', opacity: r.active ? 1 : 0.6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  {r.active ? <Chip tone="moss" dot>aktivní</Chip> : <Chip tone="amber">plánovaný</Chip>}
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 2 }}>{r.orp}</div>
                {r.active && <div style={{ marginTop: 10, fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span className="mono">{events.length} akcí</span>
                  <span className="mono">{events.reduce((a,e)=>a+e.hours,0)} h</span>
                </div>}
              </div>
            );
          })}
        </div>
      </div>
      <PivotTable data={data} title="Region → Čas → Stupeň školy" chips={['Region','Čas','Stupeň']}/>
    </>
  );
};

// === School View ===
const SchoolView = ({ data, filteredEvents }) => {
  const [selected, setSelected] = React.useState(data.schools[0]?.redizo);
  const school = data.schools.find(s => s.redizo === selected);
  const schoolEvents = filteredEvents.filter(e => e.school === selected);

  const participants = {};
  schoolEvents.forEach(e => e.participants.forEach(p => {
    const k = p.name;
    if (!participants[k]) participants[k] = { name: p.name, role: p.role, events: 0, hours: 0, interventions: new Set() };
    participants[k].events++;
    participants[k].hours += e.hours;
    participants[k].interventions.add(e.intervention);
  }));
  const topParticipants = Object.values(participants).sort((a,b) => b.events - a.events).slice(0, 10);

  return (
    <>
      <div className="filterbar" style={{ marginBottom: 16, background: 'var(--paper)' }}>
        <div className="label" style={{ marginRight: 4 }}>Škola</div>
        <select className="select" value={selected} onChange={e => setSelected(e.target.value)} style={{ minWidth: 320 }}>
          {data.schools.map(s => <option key={s.redizo} value={s.redizo}>{s.name} ({s.type})</option>)}
        </select>
        <Chip>REDIZO {school?.redizo}</Chip>
        <Chip tone="terra" dot>{data.regions.find(r => r.code === school?.region)?.name}</Chip>
        <Chip tone="plum">Průvodce: {school?.guide}</Chip>
      </div>
      <div className="metrics" style={{ marginBottom: 16 }}>
        <Metric label="Akcí celkem" value={schoolEvents.length}/>
        <Metric label="Zapojených osob" value={Object.keys(participants).length}/>
        <Metric label="Intenzita" value={schoolEvents.reduce((a,e)=>a+e.hours,0)} unit="h"/>
        <Metric label="Intervence" value={new Set(schoolEvents.map(e=>e.intervention)).size} delta="různých typů"/>
      </div>
      <div className="card">
        <div className="card-title">Účastníci školy</div>
        <div className="card-sub" style={{ marginBottom: 12 }}>Škola → Účastník → Čas → Intervence · top 10 dle účasti</div>
        <table className="data">
          <thead><tr><th>Jméno</th><th>Role</th><th style={{textAlign:'right'}}>Akcí</th><th style={{textAlign:'right'}}>Hodin</th><th>Intervence</th></tr></thead>
          <tbody>
            {topParticipants.map((p, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td><Chip>{p.role}</Chip></td>
                <td style={{ textAlign: 'right' }} className="mono">{p.events}</td>
                <td style={{ textAlign: 'right' }} className="mono">{p.hours} h</td>
                <td>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {[...p.interventions].map(iv => <Chip key={iv} tone="plum">{data.interventions.find(i=>i.code===iv)?.name}</Chip>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// === Authority (Zřizovatel) View ===
const AuthorityView = ({ data, filteredEvents }) => {
  // Group schools by synthetic authority (first 2 chars of region + "město")
  const authorities = [
    { code: 'OBEC-KH',   name: 'Město Kutná Hora',  region: 'KUT', schools: ['600046559','600046612','600046708','600046890'] },
    { code: 'OBEC-OLO',  name: 'Statutární m. Olomouc', region: 'OLO', schools: ['600171027','600171108','600171221'] },
    { code: 'OBEC-PLZ',  name: 'Statutární m. Plzeň', region: 'PLZ', schools: ['600069168','600069249','600069320'] },
  ];
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="row-between" style={{ padding: '16px 18px', borderBottom: '1px solid var(--ink-200)' }}>
        <div>
          <div className="card-title">Zřizovatel → Škola → Čas</div>
          <div className="card-sub">Pohled místních autorit · počet škol a ratio podpory</div>
        </div>
        <Chip tone="plum">3 zřizovatelé · 10 škol</Chip>
      </div>
      <table className="data">
        <thead>
          <tr>
            <th>Zřizovatel</th>
            <th>Region</th>
            <th style={{textAlign:'right'}}>Zřizuje škol</th>
            <th style={{textAlign:'right'}}>Podporováno</th>
            <th style={{textAlign:'right'}}>Akce</th>
            <th style={{textAlign:'right'}}>Unik. účast.</th>
            <th style={{textAlign:'right'}}>Intenzita</th>
            <th>Ratio podpory</th>
          </tr>
        </thead>
        <tbody>
          {authorities.map(a => {
            const schoolsSupported = a.schools.filter(s => filteredEvents.some(e => e.school === s));
            const evs = filteredEvents.filter(e => a.schools.includes(e.school));
            const unique = new Set();
            evs.forEach(e => e.participants.forEach(p => unique.add(`${p.name}__${p.redizo}`)));
            const ratio = schoolsSupported.length / a.schools.length;
            return (
              <tr key={a.code}>
                <td style={{ fontWeight: 600 }}>{a.name}</td>
                <td><Chip tone="terra" dot>{data.regions.find(r=>r.code===a.region)?.name}</Chip></td>
                <td style={{textAlign:'right'}} className="mono">{a.schools.length}</td>
                <td style={{textAlign:'right'}} className="mono"><strong>{schoolsSupported.length}</strong></td>
                <td style={{textAlign:'right'}} className="mono">{evs.length}</td>
                <td style={{textAlign:'right'}} className="mono">{unique.size}</td>
                <td style={{textAlign:'right'}} className="mono">{evs.reduce((a,e)=>a+e.hours,0)} h</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 80, height: 5, background: 'var(--ink-100)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${ratio*100}%`, height: '100%', background: ratio > 0.7 ? 'var(--moss)' : ratio > 0.4 ? 'var(--amber)' : 'var(--terra)' }}/>
                    </div>
                    <span className="mono" style={{ fontSize: 11 }}>{(ratio*100).toFixed(0)} %</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// === Districts View — CR map + trend tiles ===
const DistrictsView = ({ data }) => {
  const [selected, setSelected] = React.useState('KUT');
  const region = data.regions.find(r => r.code === selected);

  // Synthetic district metrics
  const metrics = {
    KUT: { pop: "73 500", area: "917 km²", schools: { MŠ: 18, ZŠ: 14, SŠ: 5 }, guides: 6, directors: 19, teachers: 230, supportedTeachers: 70, families: "12 400", authorities: 9, ratioSch: 0.72, ratioDir: 0.68, ratioTeach: 0.30, phase: "Fáze 3 · Prohloubení", distKm: 72 },
    OLO: { pop: "100 400", area: "803 km²", schools: { MŠ: 24, ZŠ: 21, SŠ: 11 }, guides: 8, directors: 32, teachers: 410, supportedTeachers: 95, families: "18 200", authorities: 14, ratioSch: 0.58, ratioDir: 0.55, ratioTeach: 0.23, phase: "Fáze 2 · Rozvoj", distKm: 108 },
    PLZ: { pop: "172 600", area: "260 km²", schools: { MŠ: 31, ZŠ: 23, SŠ: 15 }, guides: 7, directors: 38, teachers: 520, supportedTeachers: 88, families: "22 800", authorities: 11, ratioSch: 0.42, ratioDir: 0.45, ratioTeach: 0.17, phase: "Fáze 2 · Rozvoj", distKm: 108 },
    LIB: { pop: "103 900", area: "106 km²", schools: { MŠ: 15, ZŠ: 13, SŠ: 9 }, guides: 4, directors: 22, teachers: 280, supportedTeachers: 0, families: "14 600", authorities: 7, ratioSch: 0, ratioDir: 0, ratioTeach: 0, phase: "Fáze 1 · Příprava", distKm: 186 },
  };
  const m = metrics[selected];

  const trends = [
    { label: "Ratio podporovaných škol", val: m.ratioSch, trend: m.ratioSch > 0.5 ? +12 : m.ratioSch > 0 ? +5 : 0 },
    { label: "Ratio podporovaných ředitelů", val: m.ratioDir, trend: m.ratioDir > 0.5 ? +8 : m.ratioDir > 0 ? +3 : 0 },
    { label: "Ratio podporovaných učitelů", val: m.ratioTeach, trend: m.ratioTeach > 0.2 ? +15 : m.ratioTeach > 0 ? +2 : 0 },
    { label: "Ratio podporovaných zřizovatelů", val: 0.33, trend: +4 },
    { label: "Nepřímo zasažené děti (odhad)", val: null, raw: "3 210", trend: +18 },
    { label: "Zapojené rodiny", val: null, raw: "285", trend: +9 },
  ];

  return (
    <div>
      <div className="grid-2" style={{ marginBottom: 16, gridTemplateColumns: '1fr 1.2fr' }}>
        <div className="card">
          <div className="card-title">Mapa CPV sítě · ČR</div>
          <div className="card-sub" style={{ marginBottom: 14 }}>Aktivní regiony · klikněte pro výběr</div>
          <CRMap regions={data.regions} selected={selected} onSelect={setSelected}/>
          <div style={{ display: 'flex', gap: 14, fontSize: 11.5, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: 'var(--terra)', borderRadius: 2 }}/>Aktivní CPV</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: 'var(--amber)', borderRadius: 2 }}/>Plánované</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 10, background: 'var(--ink-200)', borderRadius: 2 }}/>Ostatní ORP</span>
          </div>
        </div>

        <div className="card">
          <div className="row-between" style={{ marginBottom: 12 }}>
            <div>
              <div className="card-sub">Okres</div>
              <div className="card-title" style={{ fontSize: 22 }}>{region?.name}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <Chip tone="plum">{m.phase}</Chip>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>nejbližší CPV: {m.distKm} km</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>
            <StatTile label="Obyvatel" value={m.pop}/>
            <StatTile label="Rozloha" value={m.area}/>
            <StatTile label="Zřizovatelé" value={m.authorities}/>
            <StatTile label="Školní průvodci" value={m.guides}/>
            <StatTile label="Ředitelé" value={m.directors}/>
            <StatTile label="Učitelé" value={m.teachers}/>
          </div>

          <div className="label" style={{ marginBottom: 8 }}>Školy dle stupně</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(m.schools).map(([g, n]) => (
              <div key={g} style={{ flex: 1, padding: 12, background: 'var(--paper-2)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, color: 'var(--ink-900)' }}>{n}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{g}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">Hlavní trendy v podpoře okresu</div>
        <div className="card-sub" style={{ marginBottom: 14 }}>Meziroční změna · barevná vizualizace nárůstu/poklesu</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {trends.map((t, i) => (
            <div key={i} style={{ padding: 14, border: '1px solid var(--ink-200)', borderRadius: 'var(--radius)', background: t.trend > 0 ? 'var(--moss-soft)' : t.trend < 0 ? 'var(--terra-soft)' : 'var(--paper-2)' }}>
              <div className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)' }}>{t.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400 }}>
                  {t.val != null ? `${Math.round(t.val*100)} %` : t.raw}
                </div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: t.trend > 0 ? 'var(--moss)' : t.trend < 0 ? 'var(--terra)' : 'var(--ink-500)' }}>
                  {t.trend > 0 ? '↑' : t.trend < 0 ? '↓' : '—'} {Math.abs(t.trend)} %
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Evaluace × Autoevaluace</div>
        <div className="card-sub" style={{ marginBottom: 14 }}>Poměr zapojení · dle aktéra a stupně školy</div>
        <table className="data">
          <thead><tr><th>Aktér</th><th style={{textAlign:'right'}}>Evaluace</th><th style={{textAlign:'right'}}>Autoevaluace</th><th>Poměr</th><th style={{textAlign:'right'}}>Meziroční trend</th></tr></thead>
          <tbody>
            {[
              { actor: 'Ředitelé', ev: 18, auto: 12 },
              { actor: 'Učitelé', ev: 120, auto: 85 },
              { actor: 'Rodiče', ev: 34, auto: 12 },
              { actor: 'Děti / žáci', ev: 280, auto: 145 },
              { actor: 'Zřizovatelé', ev: 5, auto: 2 },
            ].map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{r.actor}</td>
                <td style={{textAlign:'right'}} className="mono">{r.ev}</td>
                <td style={{textAlign:'right'}} className="mono">{r.auto}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--ink-100)', borderRadius: 3, overflow: 'hidden', display: 'flex', maxWidth: 140 }}>
                      <div style={{ flex: r.ev, background: 'var(--terra)' }}/>
                      <div style={{ flex: r.auto, background: 'var(--plum)' }}/>
                    </div>
                    <span className="mono" style={{ fontSize: 11 }}>{(r.auto/(r.ev+r.auto)*100).toFixed(0)} %</span>
                  </div>
                </td>
                <td style={{textAlign:'right'}} className="mono" style={{ color: 'var(--moss)' }}>↑ {6 + i*2} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// === Sub-components ===
const StatTile = ({ label, value }) => (
  <div>
    <div className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-500)' }}>{label}</div>
    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em', marginTop: 2 }}>{value}</div>
  </div>
);

const StatsCard = ({ title, events, metric }) => {
  let value, sub;
  if (metric === 'avgPerSchool') {
    const bySchool = {};
    events.forEach(e => bySchool[e.school] = (bySchool[e.school]||0)+1);
    const vals = Object.values(bySchool);
    value = (vals.reduce((a,b)=>a+b,0)/Math.max(vals.length,1)).toFixed(1);
    sub = `min ${Math.min(...vals,0)} · max ${Math.max(...vals,0)} · medián ${vals.sort()[Math.floor(vals.length/2)] || 0}`;
  } else {
    const counts = {};
    events.forEach(e => e.participants.forEach(p => { const k = `${p.name}__${p.redizo}`; counts[k] = (counts[k]||0)+1; }));
    const repeat = Object.values(counts).filter(c => c > 1).length;
    const total = Object.values(counts).length;
    value = total ? `${Math.round(repeat/total*100)} %` : '—';
    sub = `${repeat} z ${total} účastníků opakovaně`;
  }
  return (
    <div className="card">
      <div className="card-title" style={{ fontSize: 15 }}>{title}</div>
      <div className="card-sub" style={{ marginBottom: 10 }}>deskriptivní statistika</div>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 42, fontWeight: 400, letterSpacing: '-0.02em' }}>{value}</div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-500)', marginTop: 4 }}>{sub}</div>
    </div>
  );
};

const NewReturningDonut = ({ newC, retC }) => {
  const total = Math.max(newC + retC, 1);
  const retAngle = (retC/total) * 2 * Math.PI;
  const cx = 100, cy = 100, r = 70;
  const x1 = cx + r * Math.sin(retAngle);
  const y1 = cy - r * Math.cos(retAngle);
  return (
    <div className="card">
      <div className="card-title" style={{ fontSize: 15 }}>Noví vs vracející se</div>
      <div className="card-sub" style={{ marginBottom: 14 }}>Unikátní účastníci</div>
      <svg viewBox="0 0 200 200" width="160" height="160" style={{ display: 'block', margin: '0 auto' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--terra-soft)" strokeWidth="24"/>
        <path d={`M ${cx} ${cy-r} A ${r} ${r} 0 ${retAngle > Math.PI ? 1 : 0} 1 ${x1} ${y1}`} fill="none" stroke="var(--terra)" strokeWidth="24"/>
        <text x={cx} y={cy-4} textAnchor="middle" fontFamily="var(--font-serif)" fontSize="32" fill="var(--ink-900)">{Math.round(retC/total*100)}%</text>
        <text x={cx} y={cy+14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--ink-500)">VRACÍ SE</text>
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 12, marginTop: 8 }}>
        <div><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--terra-soft)', marginRight: 5, borderRadius: 2 }}/> Noví <strong>{newC}</strong></div>
        <div><span style={{ display: 'inline-block', width: 8, height: 8, background: 'var(--terra)', marginRight: 5, borderRadius: 2 }}/> Vrací se <strong>{retC}</strong></div>
      </div>
    </div>
  );
};

const GradeBreakdown = ({ data, events }) => {
  const schoolByRedizo = Object.fromEntries(data.schools.map(s => [s.redizo, s]));
  const byGrade = { "MŠ": new Set(), "ZŠ": new Set(), "SŠ": new Set() };
  events.forEach(e => { const s = schoolByRedizo[e.school]; if (s) e.participants.forEach(p => byGrade[s.type]?.add(`${p.name}__${p.redizo}`)); });
  const uniqueCount = new Set();
  events.forEach(e => e.participants.forEach(p => uniqueCount.add(`${p.name}__${p.redizo}`)));
  const max = Math.max(...Object.values(byGrade).map(s => s.size), 1);
  return (
    <div className="card">
      <div className="card-title" style={{ fontSize: 15 }}>Unikátní dle stupně</div>
      <div className="card-sub" style={{ marginBottom: 16 }}>MŠ / ZŠ / SŠ</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Object.entries(byGrade).map(([g, set]) => (
          <div key={g}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
              <span style={{ fontWeight: 600 }}>{g}</span>
              <span className="mono">{set.size}</span>
            </div>
            <div style={{ height: 8, background: 'var(--ink-100)', borderRadius: 4, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ width: `${(set.size/max)*100}%`, height: '100%', background: g === 'ZŠ' ? 'var(--terra)' : g === 'MŠ' ? 'var(--amber)' : 'var(--plum)' }}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 14, fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>
        Odhad zasažených žáků: <strong style={{ color: 'var(--ink-900)' }}>{(uniqueCount.size * 25).toLocaleString('cs-CZ')}</strong>
        <span style={{ opacity: 0.6 }}> (× 25)</span>
      </div>
    </div>
  );
};

const TopSchools = ({ data, events }) => {
  const schoolByRedizo = Object.fromEntries(data.schools.map(s => [s.redizo, s]));
  const intensity = {};
  events.forEach(e => { intensity[e.school] = (intensity[e.school]||0) + e.hours; });
  const top = Object.entries(intensity).sort((a,b)=>b[1]-a[1]).slice(0, 6);
  const max = top[0]?.[1] || 1;
  return (
    <div className="card">
      <div className="card-title" style={{ fontSize: 15 }}>Aktivní školy</div>
      <div className="card-sub" style={{ marginBottom: 14 }}>Top dle intenzity</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {top.map(([redizo, h], i) => {
          const s = schoolByRedizo[redizo];
          return (
            <div key={redizo} style={{ fontSize: 12, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 8, alignItems: 'center' }}>
              <span className="mono" style={{ color: 'var(--ink-400)', width: 18 }}>{(i+1).toString().padStart(2,'0')}</span>
              <div>
                <div style={{ fontWeight: 500, fontSize: 12.5 }}>{s?.name}</div>
                <div style={{ height: 4, background: 'var(--ink-100)', borderRadius: 2, marginTop: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(h/max)*100}%`, height: '100%', background: 'var(--ink-700)' }}/>
                </div>
              </div>
              <span className="mono" style={{ fontWeight: 600 }}>{h} h</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PivotTable = ({ data, title, chips }) => (
  <div className="card" style={{ padding: 0 }}>
    <div className="row-between" style={{ padding: '16px 18px', borderBottom: '1px solid var(--ink-200)' }}>
      <div>
        <div className="card-title">{title}</div>
        <div className="card-sub">Pivot · klik pro drill-down</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {chips.map((c, i) => <Chip key={i}>{i === 0 ? 'Seskupit: ' : '→ '}{c}</Chip>)}
      </div>
    </div>
    <table className="data">
      <thead>
        <tr>
          <th>Region (CPV)</th><th>Intervence</th>
          <th style={{textAlign:'right'}}>Akce</th>
          <th style={{textAlign:'right'}}>Záznamy</th>
          <th style={{textAlign:'right'}}>Unikátní</th>
          <th style={{textAlign:'right'}}>Noví / Vrací se</th>
          <th style={{textAlign:'right'}}>Intenzita</th>
          <th style={{textAlign:'right'}}>Ø h/škola</th>
        </tr>
      </thead>
      <tbody>
        {data.regions.filter(r=>r.active).flatMap(r => data.interventions.slice(0, 3).map(iv => {
          const evs = data.events.filter(e => e.region===r.code && e.intervention===iv.code);
          const recs = evs.reduce((a,e)=>a+e.participants.length,0);
          const uniq = new Set(); evs.forEach(e => e.participants.forEach(p => uniq.add(`${p.name}__${p.redizo}`)));
          const hrs = evs.reduce((a,e)=>a+e.hours,0);
          const schSet = new Set(evs.map(e=>e.school));
          const newP = Math.round(uniq.size * 0.6);
          const retP = uniq.size - newP;
          return (
            <tr key={r.code+iv.code}>
              <td><Chip tone="terra" dot>{r.name}</Chip></td>
              <td style={{ fontWeight: 500 }}>{iv.name}</td>
              <td style={{textAlign:'right'}} className="mono">{evs.length}</td>
              <td style={{textAlign:'right'}} className="mono">{recs}</td>
              <td style={{textAlign:'right'}} className="mono"><strong>{uniq.size}</strong></td>
              <td style={{textAlign:'right'}} className="mono"><span style={{color:'var(--moss)'}}>{newP}</span> / <span style={{color:'var(--plum)'}}>{retP}</span></td>
              <td style={{textAlign:'right'}} className="mono">{hrs} h</td>
              <td style={{textAlign:'right'}} className="mono">{schSet.size ? (hrs/schSet.size).toFixed(1) : '—'}</td>
            </tr>
          );
        }))}
      </tbody>
    </table>
  </div>
);

// === Stylized CR map (ORP grid hexes) ===
const CRMap = ({ regions, selected, onSelect }) => {
  // Rough hex placement reflecting CZ geography
  const activeMap = Object.fromEntries(regions.map(r => [r.code, r]));
  const hexes = [
    // Bohemia (west)
    { q:  2, r: 2, code: 'LIB' },
    { q:  0, r: 3, code: 'PLZ' },
    { q:  1, r: 3 }, { q:  2, r: 3 }, { q:  3, r: 3, code: 'KUT' }, { q:  4, r: 3 },
    { q:  1, r: 4 }, { q:  2, r: 4 }, { q:  3, r: 4 }, { q:  4, r: 4 },
    { q:  3, r: 2 }, { q:  4, r: 2 }, { q:  5, r: 2 },
    // Moravia (east)
    { q:  5, r: 3 }, { q:  6, r: 3, code: 'OLO' }, { q:  7, r: 3 },
    { q:  5, r: 4 }, { q:  6, r: 4 }, { q:  7, r: 4 },
    { q:  6, r: 2 }, { q:  7, r: 2 },
    { q:  4, r: 5 }, { q:  5, r: 5 }, { q:  6, r: 5 },
    { q:  2, r: 5 }, { q:  3, r: 5 },
  ];
  const size = 22;
  const w = Math.sqrt(3) * size;
  const h = size * 1.5;
  const toXY = (q, r) => ({ x: q * w + (r % 2) * w / 2 + 30, y: r * h + 30 });
  const hex = (cx, cy) => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      pts.push(`${cx + size * Math.cos(a)},${cy + size * Math.sin(a)}`);
    }
    return pts.join(' ');
  };

  return (
    <svg viewBox="0 0 320 220" style={{ width: '100%', height: 'auto', display: 'block' }}>
      {hexes.map((hx, i) => {
        const { x, y } = toXY(hx.q, hx.r);
        const reg = hx.code ? activeMap[hx.code] : null;
        const isSel = hx.code === selected;
        const fill = reg
          ? (reg.active ? (isSel ? 'var(--terra)' : 'color-mix(in oklch, var(--terra) 70%, white)') : 'var(--amber)')
          : 'var(--ink-100)';
        const stroke = isSel ? 'var(--ink-900)' : 'var(--paper)';
        return (
          <g key={i} style={{ cursor: reg ? 'pointer' : 'default' }} onClick={() => reg && onSelect(hx.code)}>
            <polygon points={hex(x, y)} fill={fill} stroke={stroke} strokeWidth={isSel ? 2 : 1.2}/>
            {reg && (
              <text x={x} y={y+3} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fontWeight="600"
                    fill={reg.active ? 'white' : 'var(--ink-900)'}>{reg.code}</text>
            )}
          </g>
        );
      })}
      {/* Connecting lines between active CPVs */}
      {regions.filter(r => r.active).map((r, i, arr) => {
        if (i === 0) return null;
        const prev = arr[i-1];
        const p1 = hexes.find(h => h.code === prev.code);
        const p2 = hexes.find(h => h.code === r.code);
        if (!p1 || !p2) return null;
        const a = toXY(p1.q, p1.r);
        const b = toXY(p2.q, p2.r);
        return <line key={r.code} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--terra)" strokeWidth="1" strokeDasharray="2 3" opacity="0.5"/>;
      })}
    </svg>
  );
};

Object.assign(window, { ReportsView });
