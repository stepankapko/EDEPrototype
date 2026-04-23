// EduScale sample data — realistic Eduzměna-style records
window.EDUSCALE_DATA = (() => {
  const regions = [
    { code: "KUT", name: "Kutnohorsko", orp: "Kutná Hora", active: true },
    { code: "OLO", name: "Olomoucko", orp: "Olomouc", active: true },
    { code: "PLZ", name: "Plzeňsko", orp: "Plzeň", active: true },
    { code: "LIB", name: "Liberecko", orp: "Liberec", active: false },
  ];

  const schools = [
    { redizo: "600046559", name: "ZŠ Kutná Hora, Jana Palacha",   region: "KUT", type: "ZŠ", guide: "Lucie Horáková" },
    { redizo: "600046612", name: "ZŠ Čáslav, Masarykova",          region: "KUT", type: "ZŠ", guide: "Lucie Horáková" },
    { redizo: "600046708", name: "MŠ Kutná Hora, Pohádka",         region: "KUT", type: "MŠ", guide: "Lucie Horáková" },
    { redizo: "600046890", name: "Gymnázium Jiřího Ortena",        region: "KUT", type: "SŠ", guide: "Lucie Horáková" },
    { redizo: "600171027", name: "ZŠ Olomouc, Holická",            region: "OLO", type: "ZŠ", guide: "Rolando Svoboda" },
    { redizo: "600171108", name: "ZŠ Olomouc, Komenium",           region: "OLO", type: "ZŠ", guide: "Rolando Svoboda" },
    { redizo: "600171221", name: "MŠ Olomouc, Michalské stromořadí", region: "OLO", type: "MŠ", guide: "Rolando Svoboda" },
    { redizo: "600069168", name: "ZŠ Plzeň, Schwarzova",           region: "PLZ", type: "ZŠ", guide: "Karel Němec" },
    { redizo: "600069249", name: "ZŠ Plzeň, Božkovská",            region: "PLZ", type: "ZŠ", guide: "Karel Němec" },
    { redizo: "600069320", name: "SŠ Plzeň, Křimická",             region: "PLZ", type: "SŠ", guide: "Karel Němec" },
  ];

  const interventions = [
    { code: "FH",  name: "Formativní hodnocení",    group: "Učitelé",    pillar: "Znak 7" },
    { code: "PL",  name: "Pedagogický leadership",  group: "Ředitelé",   pillar: "Znak 2" },
    { code: "SP",  name: "Spolupráce ve sboru",     group: "Učitelé",    pillar: "Znak 3" },
    { code: "WB",  name: "Wellbeing a klima školy", group: "Všichni",    pillar: "Znak 6" },
    { code: "MV",  name: "Mentoring začínajících",  group: "Učitelé",    pillar: "Znak 4" },
    { code: "RO",  name: "Rodiče jako partneři",    group: "Rodiče",     pillar: "Znak 3" },
  ];

  const firstNames = ["Jana","Petr","Martina","Tomáš","Eva","Jan","Kateřina","Michal","Lucie","Pavel","Hana","David","Markéta","Ondřej","Zuzana","Radka","Josef","Barbora","Jakub","Veronika","Marek","Iveta","Adam","Tereza"];
  const lastNames  = ["Nováková","Novák","Svobodová","Svoboda","Horák","Horáková","Dvořák","Dvořáková","Černý","Černá","Procházka","Procházková","Kučera","Kučerová","Veselá","Veselý","Krejčí","Marek","Pospíšil","Pospíšilová"];

  const roles = ["Učitel", "Ředitel", "Zástupce ředitele", "Asistent pedagoga", "Nepedagog"];

  // Generate events
  let rng = 1;
  const rand = () => { rng = (rng * 9301 + 49297) % 233280; return rng / 233280; };
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];

  const events = [];
  const months = [
    "2025-09","2025-10","2025-11","2025-12",
    "2026-01","2026-02","2026-03","2026-04"
  ];
  let eid = 1000;
  for (const m of months) {
    const count = 4 + Math.floor(rand() * 5);
    for (let i = 0; i < count; i++) {
      const s = pick(schools);
      const iv = pick(interventions);
      const day = 1 + Math.floor(rand() * 27);
      const date = `${m}-${String(day).padStart(2,'0')}`;
      const nParticipants = 6 + Math.floor(rand() * 18);
      const participants = [];
      for (let p = 0; p < nParticipants; p++) {
        participants.push({
          name: `${pick(firstNames)} ${pick(lastNames)}`,
          role: pick(roles),
          redizo: s.redizo,
        });
      }
      events.push({
        id: `E-${eid++}`,
        date,
        region: s.region,
        school: s.redizo,
        intervention: iv.code,
        hours: 2 + Math.floor(rand() * 6),
        participants,
        uploadedBy: pick(["lucka@eduzmena.cz","rolo@eduzmena.cz","karel@eduzmena.cz","stepan@eduzmena.cz"]),
        uploadedAt: `${date}T${String(9 + Math.floor(rand()*8)).padStart(2,'0')}:${String(Math.floor(rand()*60)).padStart(2,'0')}:00`,
        filename: `dochazka_${iv.code}_${s.redizo}_${date}.xlsx`,
      });
    }
  }

  // Deduplicated unique participants (by name)
  const uniqueParticipants = new Map();
  for (const e of events) {
    for (const p of e.participants) {
      const key = `${p.name}__${p.redizo}`;
      if (!uniqueParticipants.has(key)) {
        uniqueParticipants.set(key, { name: p.name, role: p.role, redizo: p.redizo, attended: 0, firstSeen: e.date });
      }
      uniqueParticipants.get(key).attended++;
    }
  }

  const documents = [
    { id: "D1", title: "Evaluační zpráva – Kutnohorsko Q4 2025", type: "Analýza",      format: "docx", region: "KUT", date: "2025-12-18", size: "2.3 MB", tags: ["Znak 2","Znak 5","Leadership","ROI"], snippet: "Výsledky po 12 měsících intervence ukazují zřetelný posun v oblasti pedagogického leadershipu…" },
    { id: "D2", title: "Přepis rozhovoru – ředitelka ZŠ Holická", type: "Přepis",       format: "md",   region: "OLO", date: "2026-02-04", size: "84 kB",  tags: ["Znak 3","Spolupráce","Mindset shift"], snippet: "…nejdůležitější změnou bylo, že se sborovna začala scházet dobrovolně, ne jen když musíme…" },
    { id: "D3", title: "Metodika – Formativní hodnocení v praxi", type: "Metodika",     format: "pdf",  region: "—",   date: "2025-06-01", size: "4.1 MB", tags: ["Znak 7","Formativní hodnocení"], snippet: "Metodický materiál pro učitele ZŠ; obsahuje 24 příkladů techniky Exit Ticket…" },
    { id: "D4", title: "Dochazka – workshop FH, ZŠ Palacha",      type: "Docházka",     format: "xlsx", region: "KUT", date: "2026-03-11", size: "32 kB",  tags: ["Docházka","Znak 7"], snippet: "14 účastníků, 6 učitelů 1. stupně, 8 učitelů 2. stupně" },
    { id: "D5", title: "Přepis rozhovoru – učitelský tandem Plzeň",type: "Přepis",       format: "docx", region: "PLZ", date: "2026-01-22", size: "142 kB", tags: ["Znak 3","Mentoring","Kolegialita"], snippet: "…poprvé jsme spolu šli na hospitaci bez toho, aby to někdo nařídil shora…" },
    { id: "D6", title: "Mapa aktérů – Olomoucko",                  type: "Mapa aktérů",  format: "json", region: "OLO", date: "2025-11-09", size: "18 kB",  tags: ["Network","Stakeholders"], snippet: "Interaktivní mapa 34 aktérů regionu – ředitelé, CPV, zřizovatel, ČŠI…" },
    { id: "D7", title: "Zpráva ČŠI – ZŠ Schwarzova",               type: "Vstupní data", format: "pdf",  region: "PLZ", date: "2025-09-15", size: "1.1 MB", tags: ["ČŠI","Inspekce"], snippet: "Inspekční zpráva identifikuje silné stránky v oblasti klimatu…" },
    { id: "D8", title: "Roční analýza – Plzeňsko 2024/25",         type: "Analýza",      format: "pdf",  region: "PLZ", date: "2025-08-20", size: "5.8 MB", tags: ["ROI","Dopad","Znak 1","Znak 4"], snippet: "540 pedagogů zapojeno, průměrná intenzita 12 h / škola / rok…" },
  ];

  return { regions, schools, interventions, events, uniqueParticipants, documents };
})();
