// Icons + small shared components
const Icon = ({ name, size = 16 }) => {
  const paths = {
    upload: <><path d="M12 15V3M12 3L7 8M12 3L17 8" /><path d="M3 15V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V15" /></>,
    records: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9H21M9 4V20" /></>,
    reports: <><path d="M3 3V21H21" /><path d="M7 15L11 11L14 14L19 8" /></>,
    library: <><path d="M4 4H10V20H4ZM10 4H16L18 20H12Z" /><path d="M18 4L22 4L20 20" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21L16 16" /></>,
    filter: <><path d="M4 6H20M7 12H17M10 18H14" /></>,
    check: <><path d="M4 12L9 17L20 6" /></>,
    plus:  <><path d="M12 5V19M5 12H19" /></>,
    x:     <><path d="M18 6L6 18M6 6L18 18" /></>,
    chevron: <><path d="M9 6L15 12L9 18" /></>,
    down: <><path d="M6 9L12 15L18 9" /></>,
    arrow: <><path d="M5 12H19M19 12L13 6M19 12L13 18" /></>,
    download: <><path d="M12 3V15M12 15L7 10M12 15L17 10" /><path d="M3 17V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V17" /></>,
    file: <><path d="M13 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V9L13 2Z" /><path d="M13 2V9H20" /></>,
    users: <><circle cx="9" cy="8" r="4" /><path d="M3 20C3 16.7 5.7 14 9 14S15 16.7 15 20" /><circle cx="17" cy="9" r="3" /><path d="M21 20C21 17.2 19.2 15 17 15" /></>,
    school: <><path d="M3 10L12 4L21 10" /><path d="M5 10V20H19V10" /><rect x="9" y="13" width="6" height="7" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10H21M8 3V7M16 3V7" /></>,
    sparkle: <><path d="M12 3L13.5 9L20 10.5L13.5 12L12 18L10.5 12L4 10.5L10.5 9Z" /></>,
    dot: <><circle cx="12" cy="12" r="4" /></>,
    link: <><path d="M10 13C10.6 13.8 11.4 14.3 12.3 14.5C13.2 14.6 14.1 14.3 14.7 13.7L18.7 9.7C19.8 8.6 19.8 6.8 18.7 5.7C17.6 4.6 15.8 4.6 14.7 5.7L13.4 7" /><path d="M14 11C13.4 10.2 12.6 9.7 11.7 9.5C10.8 9.4 9.9 9.7 9.3 10.3L5.3 14.3C4.2 15.4 4.2 17.2 5.3 18.3C6.4 19.4 8.2 19.4 9.3 18.3L10.6 17" /></>,
    book: <><path d="M4 19.5C4 18 5 17 7 17H20V3H7C5 3 4 4 4 5.5Z" /><path d="M4 19.5V21C4 21 5 20 7 20H20" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7V12L15 14" /></>,
    alert: <><path d="M12 3L21 20H3Z" /><path d="M12 10V14M12 17V17.1" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11V17M12 7V7.1" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15A1.6 1.6 0 0020 13.5L21.4 12.4A1 1 0 0021.6 11.1L19.7 7.9A1 1 0 0018.4 7.5L16.7 8.1A1.6 1.6 0 0115.1 7.8A1.6 1.6 0 0114.1 6.5L13.8 4.7A1 1 0 0012.8 4H10.2A1 1 0 009.2 4.7L8.9 6.5A1.6 1.6 0 017.9 7.8A1.6 1.6 0 016.3 8.1L4.6 7.5A1 1 0 003.3 7.9L1.4 11.1A1 1 0 001.6 12.4L3 13.5A1.6 1.6 0 013.6 15L3 16.5A1.6 1.6 0 012.6 17.6L1.4 12.4" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  );
};

const Logo = () => (
  <div className="logo">
    <div>
      <div className="logo-mark">Edu<em>Scale</em></div>
      <div className="logo-sub">engine · v0.4</div>
    </div>
  </div>
);

const UserCard = () => (
  <div className="user-card">
    <div className="avatar">LH</div>
    <div>
      <div className="user-name">Lucie Horáková</div>
      <div className="user-role">CPV koordinátor · Kutnohorsko</div>
    </div>
  </div>
);

const Sidebar = ({ route, setRoute, counts }) => {
  const items = [
    { key: "upload",  label: "Nahrát data",    icon: "upload"  },
    { key: "records", label: "Záznamy",        icon: "records", count: counts.records },
    { key: "reports", label: "Reporty",        icon: "reports" },
    { key: "library", label: "Knihovna dat",   icon: "library", count: counts.library },
  ];
  return (
    <aside className="sidebar">
      <Logo />
      <div className="nav-section-label">Pracovní plocha</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => (
          <div key={it.key}
               className={`nav-item ${route === it.key ? 'active' : ''}`}
               onClick={() => setRoute(it.key)}>
            <Icon name={it.icon} size={16} />
            <span>{it.label}</span>
            {it.count != null && <span className="nav-count">{it.count}</span>}
          </div>
        ))}
      </nav>

      <div className="nav-section-label" style={{ marginTop: 10 }}>Administrace</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div className="nav-item"><Icon name="school" size={16} /><span>Školy & regiony</span></div>
        <div className="nav-item"><Icon name="users" size={16} /><span>Uživatelé & role</span></div>
        <div className="nav-item"><Icon name="settings" size={16} /><span>Číselníky</span></div>
      </nav>

      <UserCard />
    </aside>
  );
};

const TopBar = ({ crumbs, actions }) => (
  <div className="topbar">
    <div className="crumbs">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ margin: '0 8px', opacity: 0.4 }}>/</span>}
          {i === crumbs.length - 1 ? <strong>{c}</strong> : c}
        </React.Fragment>
      ))}
    </div>
    <div className="topbar-actions">{actions}</div>
  </div>
);

const PageHead = ({ title, titleEm, subtitle, actions }) => (
  <div className="page-head">
    <div>
      <h1 className="page-title">{title} {titleEm && <em>{titleEm}</em>}</h1>
      <div className="page-subtitle">{subtitle}</div>
    </div>
    {actions && <div style={{ display: 'flex', gap: 8 }}>{actions}</div>}
  </div>
);

const Chip = ({ tone = "", children, dot }) => (
  <span className={`chip ${tone}`}>
    {dot && <span className="chip-dot" />}{children}
  </span>
);

const Metric = ({ label, value, unit, delta, deltaDir }) => (
  <div className="metric">
    <div className="metric-label">{label}</div>
    <div className="metric-value">
      {value}{unit && <span className="unit">{unit}</span>}
    </div>
    {delta && <div className={`metric-delta ${deltaDir}`}>
      {deltaDir === 'up' ? '↑' : deltaDir === 'down' ? '↓' : '·'} {delta}
    </div>}
  </div>
);

Object.assign(window, { Icon, Logo, UserCard, Sidebar, TopBar, PageHead, Chip, Metric });
