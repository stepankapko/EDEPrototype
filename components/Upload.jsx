// Upload flow: 4 steps
const UploadFlow = ({ data, onComplete }) => {
  const [step, setStep] = React.useState(0);
  const [file, setFile] = React.useState(null);
  const [meta, setMeta] = React.useState({
    region: "KUT",
    school: "600046559",
    intervention: "FH",
    date: "2026-04-15",
    hours: 4,
    targetGroup: "Učitelé",
  });
  const [hoveringDrop, setHoveringDrop] = React.useState(false);

  const steps = [
    { label: "Soubor",         desc: "Excel / Word / CSV" },
    { label: "Metadata",       desc: "Region, škola, intervence" },
    { label: "Náhled sloupců", desc: "AI rozpoznané účastníky" },
    { label: "Deduplikace",    desc: "Kontrola shod" },
  ];

  const detectedColumns = [
    { source: "Jméno a příjmení", target: "participant_name", conf: 0.98, samples: ["Jana Nováková", "Petr Horák", "Martina Svobodová"] },
    { source: "Funkce",            target: "role",             conf: 0.94, samples: ["Učitelka 1.st.", "Ředitel", "Učitel 2.st."] },
    { source: "Pracoviště",        target: "school_name",      conf: 0.88, samples: ["ZŠ Palacha", "ZŠ Palacha", "ZŠ Palacha"] },
    { source: "IČO školy",         target: "redizo",           conf: 0.72, samples: ["600046559", "600046559", "600046559"], warning: "Pole označeno jako IČO, systém detekoval REDIZO formát" },
    { source: "Podpis",            target: "— ignorovat —",    conf: 0.30, samples: ["[podpis]", "[podpis]", "[podpis]"], warning: "Sloupec nelze mapovat" },
  ];

  const dedupCandidates = [
    { left: { name: "Jana Nováková", redizo: "600046559", role: "Učitelka 1.st." },
      right:{ name: "J. Nováková",   redizo: "600046559", role: "Učitel 1. stupeň" },
      match: 0.94, prior: 3, action: "merge" },
    { left: { name: "Petr Horák", redizo: "600046559", role: "Ředitel" },
      right:{ name: "Petr Horák", redizo: "600046559", role: "Ředitel" },
      match: 1.00, prior: 7, action: "merge" },
    { left: { name: "Martina Svobodová", redizo: "600046559", role: "Učitelka" },
      right:{ name: "Martina Svobová",   redizo: "600046559", role: "Učitelka 2.st." },
      match: 0.71, prior: 2, action: "review" },
    { left: { name: "Tomáš Dvořák", redizo: "600046559", role: "Asistent pedagoga" },
      right: null, match: 0, prior: 0, action: "new" },
  ];

  const next = () => setStep(s => Math.min(s + 1, 3));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const regionObj = data.regions.find(r => r.code === meta.region);
  const schoolsForRegion = data.schools.filter(s => s.region === meta.region);
  const interventionObj = data.interventions.find(i => i.code === meta.intervention);

  return (
    <div>
      <div className="stepper">
        {steps.map((s, i) => (
          <div key={i} className={`step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
            <div className="step-num">{i < step ? '✓' : i + 1}</div>
            <div>
              <div className="step-label">{s.label}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="card" style={{ padding: 32 }}>
          <div className={`dropzone ${hoveringDrop ? 'hover' : ''}`}
               onDragOver={e => { e.preventDefault(); setHoveringDrop(true); }}
               onDragLeave={() => setHoveringDrop(false)}
               onDrop={e => { e.preventDefault(); setHoveringDrop(false); setFile({ name: "dochazka_FH_workshop_21032026.xlsx", size: "48 kB", rows: 14 }); }}
               onClick={() => setFile({ name: "dochazka_FH_workshop_21032026.xlsx", size: "48 kB", rows: 14 })}>
            <div style={{ display: 'grid', placeItems: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--terra-soft)', color: 'var(--terra)', display: 'grid', placeItems: 'center' }}>
                <Icon name="upload" size={28} />
              </div>
              <div className="dropzone-title">Přetáhněte soubor nebo klikněte</div>
              <div className="dropzone-sub">Prezenční list, výstup z workshopu, zpětná vazba účastníků</div>
              <div className="format-chips">
                <Chip tone="">XLSX</Chip>
                <Chip tone="">DOCX</Chip>
                <Chip tone="">CSV</Chip>
                <Chip tone="">PDF</Chip>
              </div>
            </div>
          </div>

          {file && (
            <div style={{ marginTop: 20, padding: 14, background: 'var(--moss-soft)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 44, background: 'white', borderRadius: 4, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600 }}>XLSX</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{file.name}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>
                  {file.size} · detekováno {file.rows} řádků · UTF-8 ✓
                </div>
              </div>
              <Chip tone="moss" dot>Připraveno</Chip>
            </div>
          )}

          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--ink-500)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Icon name="info" size={14} />
            <span>Osobní údaje jsou zpracovávány v EU. Data se neposílají do veřejných AI API — běží na self-hosted Llama3 v EU regionu. <kbd>GDPR</kbd> <kbd>UTF-8</kbd></span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
            <button className="btn btn-primary" disabled={!file} onClick={next} style={{ opacity: file ? 1 : 0.4 }}>
              Pokračovat k metadatům <Icon name="chevron" size={14} />
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card" style={{ padding: 28 }}>
          <h2 className="card-title" style={{ marginBottom: 4 }}>Povinná metadata akce</h2>
          <div className="card-sub" style={{ marginBottom: 22 }}>Musí být vyplněno · bez nich nelze záznam uložit</div>

          <div className="grid-2" style={{ gap: 18 }}>
            <div className="field">
              <label className="label">Region (ORP)<span className="required">*</span></label>
              <select className="select" value={meta.region} onChange={e => setMeta({ ...meta, region: e.target.value, school: data.schools.find(s => s.region === e.target.value)?.redizo })}>
                {data.regions.filter(r => r.active).map(r => <option key={r.code} value={r.code}>{r.name} ({r.orp})</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Škola / organizace<span className="required">*</span></label>
              <select className="select" value={meta.school} onChange={e => setMeta({ ...meta, school: e.target.value })}>
                {schoolsForRegion.map(s => <option key={s.redizo} value={s.redizo}>{s.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Intervence<span className="required">*</span></label>
              <select className="select" value={meta.intervention} onChange={e => setMeta({ ...meta, intervention: e.target.value })}>
                {data.interventions.map(i => <option key={i.code} value={i.code}>{i.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Datum akce<span className="required">*</span></label>
              <input type="date" className="input" value={meta.date} onChange={e => setMeta({ ...meta, date: e.target.value })} />
            </div>
            <div className="field">
              <label className="label">Cílová skupina</label>
              <select className="select" value={meta.targetGroup} onChange={e => setMeta({ ...meta, targetGroup: e.target.value })}>
                <option>Učitelé</option>
                <option>Ředitelé</option>
                <option>Rodiče</option>
                <option>Všichni</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Délka (hodiny)</label>
              <input type="number" className="input" value={meta.hours} onChange={e => setMeta({ ...meta, hours: +e.target.value })} />
            </div>
          </div>

          <div style={{ marginTop: 24, padding: 14, background: 'var(--paper-2)', borderRadius: 'var(--radius)', fontSize: 12.5 }}>
            <div className="mono" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--ink-500)', marginBottom: 6 }}>Bude propojeno s</div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
              <Chip tone="terra"><Icon name="dot" size={8}/> {regionObj?.name}</Chip>
              <Chip tone="plum"><Icon name="school" size={10}/> {schoolsForRegion.find(s => s.redizo === meta.school)?.name}</Chip>
              <Chip tone="moss">{interventionObj?.name}</Chip>
              <Chip tone="amber">{interventionObj?.pillar}</Chip>
              <Chip>REDIZO {meta.school}</Chip>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button className="btn" onClick={back}>← Zpět</button>
            <button className="btn btn-primary" onClick={next}>Rozpoznat sloupce <Icon name="sparkle" size={14} /></button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card" style={{ padding: 28 }}>
          <div className="row-between" style={{ marginBottom: 8 }}>
            <div>
              <h2 className="card-title">Rozpoznané sloupce</h2>
              <div className="card-sub">AI automaticky detekovala strukturu · zkontrolujte a opravte</div>
            </div>
            <Chip tone="moss" dot>Hotovo za 1.8s</Chip>
          </div>

          <div className="table-wrap" style={{ marginTop: 18 }}>
            <table className="data">
              <thead>
                <tr>
                  <th>Sloupec v souboru</th>
                  <th>Cílové pole</th>
                  <th>Jistota</th>
                  <th>Ukázka dat</th>
                </tr>
              </thead>
              <tbody>
                {detectedColumns.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{c.source}</td>
                    <td>
                      <select className="select" defaultValue={c.target} style={{ fontSize: 12, padding: '4px 8px' }}>
                        <option>{c.target}</option>
                        <option>— ignorovat —</option>
                        <option>participant_name</option>
                        <option>role</option>
                        <option>redizo</option>
                        <option>school_name</option>
                      </select>
                      {c.warning && <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 4, display: 'flex', gap: 4, alignItems: 'center' }}>
                        <Icon name="alert" size={11} /> {c.warning}
                      </div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 4, background: 'var(--ink-100)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${c.conf * 100}%`, height: '100%', background: c.conf > 0.85 ? 'var(--moss)' : c.conf > 0.5 ? 'var(--amber)' : 'var(--terra)' }}/>
                        </div>
                        <span className="mono" style={{ fontSize: 11 }}>{(c.conf * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>
                      {c.samples.slice(0, 2).join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button className="btn" onClick={back}>← Zpět</button>
            <button className="btn btn-primary" onClick={next}>Pokračovat · kontrola shod</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card" style={{ padding: 28 }}>
          <div className="row-between" style={{ marginBottom: 16 }}>
            <div>
              <h2 className="card-title">Deduplikace účastníků</h2>
              <div className="card-sub">Shoda podle jména + REDIZO · historie z 284 předchozích záznamů</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Chip tone="moss">2 shody</Chip>
              <Chip tone="amber">1 ke kontrole</Chip>
              <Chip tone="plum">1 nový</Chip>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {dedupCandidates.map((d, i) => (
              <div key={i} style={{
                border: '1px solid var(--ink-200)',
                borderRadius: 'var(--radius)',
                padding: 14,
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr auto',
                gap: 14,
                alignItems: 'center',
                background: d.action === 'review' ? 'var(--amber-soft)' : 'var(--paper)',
              }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Z nahraného souboru</div>
                  <div style={{ fontWeight: 600, marginTop: 3 }}>{d.left.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{d.left.role} · REDIZO {d.left.redizo}</div>
                </div>

                <div style={{ display: 'grid', placeItems: 'center', gap: 4 }}>
                  {d.right ? (
                    <>
                      <div className="mono" style={{ fontSize: 11, background: d.match > 0.9 ? 'var(--moss)' : d.match > 0.6 ? 'var(--amber)' : 'var(--ink-400)', color: 'white', padding: '2px 8px', borderRadius: 20 }}>
                        {(d.match * 100).toFixed(0)}% shoda
                      </div>
                      <Icon name="link" size={14} />
                    </>
                  ) : (
                    <Chip tone="plum" dot>nový</Chip>
                  )}
                </div>

                <div>
                  {d.right ? (
                    <>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Existující záznam · {d.prior}× účast</div>
                      <div style={{ fontWeight: 600, marginTop: 3 }}>{d.right.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{d.right.role} · REDIZO {d.right.redizo}</div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12.5, color: 'var(--ink-500)', fontStyle: 'italic' }}>Žádný existující záznam — bude vytvořen nový účastník</div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  {d.action === 'merge' && <button className="btn btn-sm btn-primary">✓ Sloučit</button>}
                  {d.action === 'review' && <button className="btn btn-sm btn-terra">Rozhodnout</button>}
                  {d.action === 'new' && <button className="btn btn-sm">Vytvořit</button>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <button className="btn" onClick={back}>← Zpět</button>
            <button className="btn btn-terra" onClick={onComplete}>
              <Icon name="check" size={14} /> Uložit 14 záznamů do pipeline
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { UploadFlow });
