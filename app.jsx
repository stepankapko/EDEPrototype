// Main app
const DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "blue",
  "density": "comfortable",
  "uploadMode": "wizard",
  "headline": "serif",
  "dataState": "populated"
}/*EDITMODE-END*/;

const App = () => {
  const data = window.EDUSCALE_DATA;
  const [route, setRoute] = React.useState(() => localStorage.getItem('eduscale_route') || 'reports');
  const [tweaks, setTweaks] = React.useState(DEFAULTS);
  const [editMode, setEditMode] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  React.useEffect(() => {
    localStorage.setItem('eduscale_route', route);
  }, [route]);

  // Tweaks integration
  React.useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === '__activate_edit_mode') setEditMode(true);
      if (e.data?.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  // Apply accent color override
  React.useEffect(() => {
    const map = {
      blue:   { main: "oklch(0.52 0.14 250)", soft: "oklch(0.94 0.04 250)" },
      teal:   { main: "oklch(0.55 0.10 200)", soft: "oklch(0.94 0.03 200)" },
      indigo: { main: "oklch(0.45 0.15 270)", soft: "oklch(0.93 0.04 270)" },
    };
    const c = map[tweaks.accent] || map.blue;
    document.documentElement.style.setProperty('--terra', c.main);
    document.documentElement.style.setProperty('--terra-soft', c.soft);
  }, [tweaks.accent]);

  React.useEffect(() => {
    document.documentElement.style.setProperty('--font-serif', 'Inter Tight, sans-serif');
  }, [tweaks.headline]);

  React.useEffect(() => {
    const sheet = document.getElementById('density-overrides') || Object.assign(document.createElement('style'), { id: 'density-overrides' });
    sheet.textContent = tweaks.density === 'compact'
      ? `table.data td { padding: 6px 10px !important; } table.data th { padding: 7px 10px !important; }`
      : '';
    if (!sheet.parentElement) document.head.appendChild(sheet);
  }, [tweaks.density]);

  const counts = {
    records: data.events.length,
    library: data.documents.length,
  };

  const crumbsByRoute = {
    upload:  ["EduScale Engine", "Pracovní plocha", "Nahrát data"],
    records: ["EduScale Engine", "Pracovní plocha", "Záznamy"],
    reports: ["EduScale Engine", "Pracovní plocha", "Reporty"],
    library: ["EduScale Engine", "Pracovní plocha", "Knihovna dat"],
  };

  const pageHeadByRoute = {
    upload:  { title: "Nahrát", titleEm: "data", subtitle: "Prezenční listy, zpětné vazby, přepisy. Systém automaticky rozpozná strukturu a propojí s regionem, školou a intervencí." },
    records: { title: "Záznamy", titleEm: "akcí",  subtitle: "Všechny nahrané akce napříč regiony. Klikněte pro detail účastníků a historii změn." },
    reports: { title: "Reporty",  titleEm: "& dashboardy", subtitle: "Agregované pohledy pro evaluační tým. Filtrovat dle CPV / intervence / stupně školy / časového období. Export do Excelu." },
    library: { title: "Knihovna", titleEm: "dat",   subtitle: "Všechny dokumenty — prezenční listy, přepisy rozhovorů, metodiky, analytické výstupy. Full-text search a AI štítky." },
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const empty = tweaks.dataState === 'empty';

  return (
    <div className="app">
      <Sidebar route={route} setRoute={setRoute} counts={counts}/>
      <div className="main">
        <TopBar crumbs={crumbsByRoute[route]} actions={
          <>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>eduscale.online</span>
            <Chip tone="moss" dot>EU · GDPR</Chip>
            <button className="btn btn-sm"><Icon name="plus" size={12}/> Nová akce</button>
          </>
        }/>
        <div className="page">
          <PageHead
            {...pageHeadByRoute[route]}
            actions={route === 'reports' ? (
              <>
                <button className="btn"><Icon name="plus" size={14}/> Nový pohled</button>
                <button className="btn btn-primary"><Icon name="download" size={14}/> Export XLSX</button>
              </>
            ) : route === 'upload' ? null : (
              <button className="btn btn-terra" onClick={() => setRoute('upload')}>
                <Icon name="plus" size={14}/> Nahrát data
              </button>
            )}
          />

          {route === 'upload' && (
            <UploadFlow data={data} onComplete={() => { setRoute('records'); showToast('14 záznamů uloženo · propojeno s Kutnohorsko / ZŠ Palacha / FH'); }}/>
          )}
          {route === 'records' && (
            empty
              ? <EmptyState title="Žádné záznamy" desc="Nahrajte první prezenční list nebo výstup z workshopu. Systém jej rozpozná a strukturovaně uloží." cta="Nahrát data" onCta={() => setRoute('upload')}/>
              : <RecordsView data={data}/>
          )}
          {route === 'reports' && (
            empty
              ? <EmptyState title="Zatím nejsou data" desc="Reporty se objeví jakmile bude v systému alespoň jedna nahraná akce." cta="Nahrát data" onCta={() => setRoute('upload')}/>
              : <ReportsView data={data}/>
          )}
          {route === 'library' && (
            empty
              ? <EmptyState title="Prázdná knihovna" desc="Nahrajte první dokument — metodiku, přepis rozhovoru nebo analytický výstup."/>
              : <LibraryView data={data}/>
          )}
        </div>
      </div>

      {editMode && <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} onClose={() => setEditMode(false)}/>}

      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--ink-900)', color: 'var(--paper)',
          padding: '12px 20px', borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-lg)', fontSize: 13, display: 'flex', gap: 10, alignItems: 'center',
          zIndex: 100,
        }}>
          <Icon name="check" size={14}/>
          {toast}
        </div>
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
