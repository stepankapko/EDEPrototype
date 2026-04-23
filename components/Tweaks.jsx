// Tweaks panel — exposed controls
const TweaksPanel = ({ tweaks, setTweaks, onClose }) => {
  const set = (k, v) => {
    const next = { ...tweaks, [k]: v };
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [k]: v } }, '*');
  };
  return (
    <div className="tweaks-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h4>Tweaks</h4>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--ink-300)', cursor: 'pointer' }}><Icon name="x" size={14}/></button>
      </div>

      <div className="tweak-row">
        <label>Accent barva</label>
        <div className="tweak-seg">
          {[
            { k: "blue",   c: "oklch(0.52 0.14 250)" },
            { k: "teal",   c: "oklch(0.55 0.10 200)" },
            { k: "indigo", c: "oklch(0.45 0.15 270)" },
          ].map(a => (
            <button key={a.k} className={tweaks.accent === a.k ? 'on' : ''}
                    style={{ background: tweaks.accent === a.k ? a.c : 'transparent' }}
                    onClick={() => set('accent', a.k)}>{a.k}</button>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <label>Hustota tabulek</label>
        <div className="tweak-seg">
          {["comfortable","compact"].map(d => (
            <button key={d} className={tweaks.density === d ? 'on' : ''} onClick={() => set('density', d)}>{d === 'comfortable' ? 'komfortní' : 'kompaktní'}</button>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <label>Upload flow</label>
        <div className="tweak-seg">
          {["wizard","single"].map(m => (
            <button key={m} className={tweaks.uploadMode === m ? 'on' : ''} onClick={() => set('uploadMode', m)}>{m === 'wizard' ? '4 kroky' : '1 stránka'}</button>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <label>Typografie titulů</label>
        <div className="tweak-seg">
          {["serif","sans"].map(t => (
            <button key={t} className={tweaks.headline === t ? 'on' : ''} onClick={() => set('headline', t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="tweak-row">
        <label>Stav dat</label>
        <div className="tweak-seg">
          {["populated","empty"].map(s => (
            <button key={s} className={tweaks.dataState === s ? 'on' : ''} onClick={() => set('dataState', s)}>{s === 'populated' ? 'naplněno' : 'prázdný stav'}</button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 10.5, color: 'var(--ink-400)', marginTop: 10, lineHeight: 1.5 }}>
        Změny se zachovají při obnovení stránky.
      </div>
    </div>
  );
};

// Empty state placeholder
const EmptyState = ({ title, desc, cta, onCta }) => (
  <div className="card" style={{ padding: 56, textAlign: 'center' }}>
    <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: '50%', background: 'var(--paper-2)', display: 'grid', placeItems: 'center', color: 'var(--ink-400)' }}>
      <Icon name="file" size={24}/>
    </div>
    <h3 className="card-title" style={{ fontSize: 20 }}>{title}</h3>
    <div className="muted" style={{ maxWidth: 340, margin: '6px auto 20px', fontSize: 13 }}>{desc}</div>
    {cta && <button className="btn btn-terra" onClick={onCta}>{cta}</button>}
  </div>
);

Object.assign(window, { TweaksPanel, EmptyState });
