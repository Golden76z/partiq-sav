#!/usr/bin/env node
/**
 * Generates sample product sheet PDFs for PartiQ SAV demo.
 * Pure Node.js — no dependencies. ASCII-safe text only.
 * Usage: node scripts/generate-sample-pdf.js
 */

const fs   = require("fs");
const path = require("path");

// ─── PDF builder ─────────────────────────────────────────────────────────────

function buildPdf(lines) {
  // Each line: { text, x, y, size }
  const streamParts = ["BT"];
  for (const l of lines) {
    const safe = l.text
      .replace(/\\/g, "\\\\")
      .replace(/\(/g,  "\\(")
      .replace(/\)/g,  "\\)");
    streamParts.push(`/F1 ${l.size ?? 11} Tf 1 0 0 1 ${l.x} ${l.y} Tm (${safe}) Tj`);
  }
  streamParts.push("ET");
  const streamContent = streamParts.join("\n");
  const streamBytes   = Buffer.from(streamContent, "ascii");

  const objs  = {
    1: "<< /Type /Catalog /Pages 2 0 R >>",
    2: "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    3: `<< /Type /Page /Parent 2 0 R\n   /MediaBox [0 0 612 842]\n   /Resources << /Font << /F1 4 0 R >> >>\n   /Contents 5 0 R >>`,
    4: "<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>",
    5: `<< /Length ${streamBytes.length} >>\nstream\n${streamContent}\nendstream`,
  };

  const parts   = [];
  const offsets = {};

  parts.push(Buffer.from("%PDF-1.4\n", "ascii"));

  for (const n of [1, 2, 3, 4, 5]) {
    offsets[n] = parts.reduce((s, b) => s + b.length, 0);
    parts.push(Buffer.from(`${n} 0 obj\n${objs[n]}\nendobj\n`, "ascii"));
  }

  const xrefOffset = parts.reduce((s, b) => s + b.length, 0);
  let xref = "xref\n0 6\n0000000000 65535 f \n";
  for (const n of [1, 2, 3, 4, 5]) {
    xref += `${String(offsets[n]).padStart(10, "0")} 00000 n \n`;
  }
  parts.push(Buffer.from(xref, "ascii"));
  parts.push(Buffer.from(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`, "ascii"));

  return Buffer.concat(parts);
}

// ─── Line helpers ─────────────────────────────────────────────────────────────

function t(y, text, size, x = 50) {
  return { x, y, text, size: size ?? 11 };
}

function sep(y) {
  return t(y, "----------------------------------------------------------------", 10);
}

// ─── Build lines for a product ───────────────────────────────────────────────

function productLines(brand, product, reference, category, description, specs, parts, compatible) {
  const lines = [];
  let y = 780;

  lines.push(t(y, `MARQUE: ${brand}`, 14));  y -= 20;
  lines.push(t(y, "TYPE: FICHE_TECHNIQUE", 11)); y -= 12;
  lines.push(sep(y)); y -= 18;

  lines.push(t(y, `PRODUIT: ${product}`, 16)); y -= 20;
  lines.push(t(y, `REFERENCE: ${reference}`, 13)); y -= 18;
  lines.push(t(y, `CATEGORIE: ${category}`, 11)); y -= 12;
  lines.push(sep(y)); y -= 18;

  lines.push(t(y, "DESCRIPTION:", 12)); y -= 16;
  for (const line of description) {
    lines.push(t(y, line, 11)); y -= 14;
  }
  lines.push(sep(y)); y -= 18;

  if (specs.length > 0) {
    lines.push(t(y, "SPECIFICATIONS TECHNIQUES:", 12)); y -= 16;
    for (const s of specs) {
      lines.push(t(y, s, 11)); y -= 14;
    }
    lines.push(sep(y)); y -= 18;
  }

  lines.push(t(y, "PIECES DETACHEES:", 12)); y -= 16;
  lines.push(t(y, "REFERENCE           NOM                              STOCK", 10)); y -= 13;
  for (const p of parts) {
    lines.push(t(y, `${p.ref.padEnd(20)}${p.name.padEnd(33)}${p.stock}`, 10)); y -= 13;
  }
  lines.push(sep(y)); y -= 18;

  if (compatible.length > 0) {
    lines.push(t(y, "COMPATIBILITE PIECES DETACHEES:", 12)); y -= 16;
    for (const c of compatible) {
      lines.push(t(y, `- ${c}`, 10)); y -= 13;
    }
    lines.push(sep(y)); y -= 18;
  }

  lines.push(t(y, "SERVICE APRES-VENTE PARTIQ", 12)); y -= 16;
  lines.push(t(y, `Marque: ${brand}  |  Ref: ${reference}`, 11)); y -= 14;
  lines.push(t(y, "Email: sav@partiq.fr  |  Tel: +33 1 00 00 00 00", 11));

  return lines;
}

// ─── Document definitions ────────────────────────────────────────────────────

const documents = [

  // ── DELABIE TEMPOSTOP ───────────────────────────────────────────────────────
  {
    filename: "DELABIE_TEMPOSTOP_Fiche_Technique.pdf",
    lines: productLines(
      "DELABIE", "TEMPOSTOP", "DEL-TMPS-001", "Robinet temporise - Lavabo collectif",
      [
        "Robinet temporise a poussoir pour lavabo. Corps laiton chrome.",
        "Temporisation reglable 5 a 30 secondes. Debit regule 6 L/min.",
        "Pression 1 a 8 bars. Tete ceramique. Norme EN 200.",
      ],
      [
        "Alimentation     : 1/2 pouce",
        "Debit            : 6 L/min",
        "Pression max     : 8 bars",
        "Temporisation    : 5 a 30 secondes reglable",
        "Materiau corps   : Laiton chrome",
        "Temperature max  : 70 degres C",
      ],
      [
        { ref: "DEL-TMPS-CAR-001", name: "Cartouche temporisee 5-30s",   stock: 42 },
        { ref: "DEL-TMPS-JNT-001", name: "Joint torique 12mm (kit x5)",  stock: 120 },
        { ref: "DEL-TMPS-BTN-001", name: "Bouton poussoir chrome",        stock: 18 },
      ],
      [
        "DEL-TMPS-CAR-001 compatible avec: DEL-TMPS-001, DEL-TMSF-003",
        "DEL-TMPS-JNT-001 compatible avec: DEL-TMPS-001, DEL-TMSF-003, DEL-BLTK-004",
        "DEL-TMPS-BTN-001 compatible avec: DEL-TMPS-001",
      ]
    ),
  },

  // ── DELABIE SECURITHERM ─────────────────────────────────────────────────────
  {
    filename: "DELABIE_SECURITHERM_Fiche_Technique.pdf",
    lines: productLines(
      "DELABIE", "SECURITHERM", "DEL-SCTH-002", "Mitigeur thermostatique",
      [
        "Mitigeur thermostatique anti-brulure avec limiteur de temperature a 38 C.",
        "Ideal pour etablissements de sante. Corps laiton chrome.",
        "Tete thermostatique ceramique haute precision.",
      ],
      [
        "Temperature limite : 38 degres C reglable",
        "Pression           : 1 a 5 bars",
        "Raccordement       : 1/2 pouce",
        "Materiau           : Laiton chrome",
        "Norme              : EN 1111",
      ],
      [
        { ref: "DEL-SCTH-CAR-001", name: "Cartouche thermostatique 38C", stock: 25 },
        { ref: "DEL-SCTH-LIM-001", name: "Limiteur de temperature",       stock: 33 },
      ],
      [
        "DEL-SCTH-CAR-001 compatible avec: DEL-SCTH-002, DVS-THERM-001",
        "DEL-SCTH-LIM-001 compatible avec: DEL-SCTH-002",
      ]
    ),
  },

  // ── DELABIE TEMPOSOFT ───────────────────────────────────────────────────────
  {
    filename: "DELABIE_TEMPOSOFT_Fiche_Technique.pdf",
    lines: productLines(
      "DELABIE", "TEMPOSOFT", "DEL-TMSF-003", "Robinet poussoir",
      [
        "Robinet poussoir avec tete ceramique et corps laiton chrome.",
        "Debit regule 6 L/min. Temporisation fixe 8 secondes.",
        "Montage 1/2 pouce. Usage lavabo collectif.",
      ],
      [
        "Alimentation     : 1/2 pouce",
        "Debit            : 6 L/min regulateur incorpore",
        "Temporisation    : 8 secondes fixe",
        "Materiau         : Laiton chrome",
        "Pression max     : 8 bars",
      ],
      [
        { ref: "DEL-TMSF-CAR-001", name: "Cartouche ceramique temporisee", stock: 35 },
        { ref: "DEL-TMSF-TEP-001", name: "Tete de robinet poussoir",        stock: 22 },
      ],
      [
        "DEL-TMSF-CAR-001 compatible avec: DEL-TMSF-003, DEL-TMPS-001",
        "DEL-TMSF-TEP-001 compatible avec: DEL-TMSF-003",
      ]
    ),
  },

  // ── DELABIE BLUETEK ─────────────────────────────────────────────────────────
  {
    filename: "DELABIE_BLUETEK_Fiche_Technique.pdf",
    lines: productLines(
      "DELABIE", "BLUETEK", "DEL-BLTK-004", "Robinet electronique infrarouge",
      [
        "Robinet electronique a detection infrarouge sans contact.",
        "Alimentation secteur 230V ou batterie lithium 6V.",
        "Detection automatique main, ouverture 0.5 seconde.",
      ],
      [
        "Alimentation     : 230V secteur ou 6V batterie lithium",
        "Portee capteur   : 25 cm",
        "Debit            : 6 L/min regulateur incorpore",
        "Temporisation    : 30 secondes apres derniere detection",
        "Classe           : IP67",
      ],
      [
        { ref: "DEL-BLTK-CAP-001", name: "Capteur infrarouge",      stock: 12 },
        { ref: "DEL-BLTK-PIL-001", name: "Pile lithium 6V",          stock: 85 },
        { ref: "DEL-TMPS-JNT-001", name: "Joint torique 12mm commun",stock: 120 },
      ],
      [
        "DEL-BLTK-CAP-001 compatible avec: DEL-BLTK-004",
        "DEL-BLTK-PIL-001 compatible avec: DEL-BLTK-004",
        "DEL-TMPS-JNT-001 compatible avec: DEL-TMPS-001, DEL-TMSF-003, DEL-BLTK-004",
      ]
    ),
  },

  // ── DELABIE BIOFIL ──────────────────────────────────────────────────────────
  {
    filename: "DELABIE_BIOFIL_Fiche_Technique.pdf",
    lines: productLines(
      "DELABIE", "BIOFIL", "DEL-BIOF-005", "Filtre anti-bacterien",
      [
        "Filtre anti-bacterien point d usage, retention a 0.2 micron.",
        "Duree d utilisation 30 jours. Raccordement 1/2 pouce.",
        "Indique pour eau potable en milieu medical ou alimentaire.",
      ],
      [
        "Retention         : 0.2 micron",
        "Raccordement      : 1/2 pouce",
        "Duree utilisation : 30 jours",
        "Temperature max   : 60 degres C",
        "Pression max      : 6 bars",
      ],
      [
        { ref: "DEL-BIOF-FIL-001", name: "Filtre rechange 0.2 micron", stock: 95 },
        { ref: "DEL-BIOF-RAC-001", name: "Raccord 1/2 pouce pour filtre", stock: 40 },
      ],
      [
        "DEL-BIOF-FIL-001 compatible avec: DEL-BIOF-005",
        "DEL-BIOF-RAC-001 compatible avec: DEL-BIOF-005",
      ]
    ),
  },

  // ── KWC DOMO ────────────────────────────────────────────────────────────────
  {
    filename: "KWC_DOMO_Fiche_Technique.pdf",
    lines: productLines(
      "KWC", "DOMO", "KWC-DOMO-001", "Mitigeur cuisine",
      [
        "Mitigeur cuisine avec bec pivotant 360 degres.",
        "Douchette extractible 2 jets, flexible 1.5m.",
        "Corps laiton, finition inox brosse.",
      ],
      [
        "Bec              : Pivotant 360 degres",
        "Raccordement     : 3/8 pouce",
        "Pression         : 1 a 5 bars",
        "Longueur flexible: 1.5 m",
        "Finition         : Inox brosse",
      ],
      [
        { ref: "KWC-DOMO-CAR-001", name: "Cartouche ceramique 35mm",     stock: 67 },
        { ref: "KWC-DOMO-DOU-001", name: "Douchette extractible 2 jets", stock: 14 },
        { ref: "KWC-ONO-ECO-001",  name: "Economiseur 5L/min commun",    stock: 74 },
      ],
      [
        "KWC-DOMO-CAR-001 compatible avec: KWC-DOMO-001, KWC-ONO-002, KWC-AVA-003",
        "KWC-DOMO-DOU-001 compatible avec: KWC-DOMO-001",
        "KWC-ONO-ECO-001 compatible avec: KWC-DOMO-001, KWC-ONO-002, KWC-AVA-003",
      ]
    ),
  },

  // ── KWC ONO ─────────────────────────────────────────────────────────────────
  {
    filename: "KWC_ONO_Fiche_Technique.pdf",
    lines: productLines(
      "KWC", "ONO", "KWC-ONO-002", "Mitigeur lavabo",
      [
        "Mitigeur lavabo design epure, cartouche ceramique 35mm.",
        "Economiseur d eau integre. Corps laiton chrome.",
        "Bec standard, raccordement 3/8 pouce.",
      ],
      [
        "Raccordement     : 3/8 pouce",
        "Pression         : 1 a 5 bars",
        "Cartouche        : Ceramique 35mm",
        "Economiseur      : 5 L/min integre",
        "Finition         : Chrome",
      ],
      [
        { ref: "KWC-ONO-ECO-001", name: "Economiseur 5L/min",         stock: 74 },
        { ref: "KWC-ONO-POI-001", name: "Poignee de remplacement ONO", stock: 19 },
        { ref: "KWC-DOMO-CAR-001",name: "Cartouche ceramique 35mm",    stock: 67 },
      ],
      [
        "KWC-ONO-ECO-001 compatible avec: KWC-ONO-002, KWC-DOMO-001, KWC-AVA-003",
        "KWC-ONO-POI-001 compatible avec: KWC-ONO-002",
        "KWC-DOMO-CAR-001 compatible avec: KWC-DOMO-001, KWC-ONO-002, KWC-AVA-003",
      ]
    ),
  },

  // ── KWC AVA ─────────────────────────────────────────────────────────────────
  {
    filename: "KWC_AVA_Fiche_Technique.pdf",
    lines: productLines(
      "KWC", "AVA", "KWC-AVA-003", "Robinet cuisine",
      [
        "Robinet cuisine a bec haut articule, corps laiton massif.",
        "Cartouche ceramique longue duree. Finition chrome.",
        "Raccordement 3/8 pouce, pression 1 a 5 bars.",
      ],
      [
        "Bec              : Haut articule",
        "Raccordement     : 3/8 pouce",
        "Pression         : 1 a 5 bars",
        "Materiau         : Laiton massif",
        "Finition         : Chrome",
      ],
      [
        { ref: "KWC-AVA-BEC-001",  name: "Bec cuisine articule haut", stock: 8 },
        { ref: "KWC-DOMO-CAR-001", name: "Cartouche ceramique 35mm",  stock: 67 },
        { ref: "KWC-ONO-ECO-001",  name: "Economiseur 5L/min commun", stock: 74 },
        { ref: "KWC-INOX-CAR-001", name: "Cartouche inox longue duree",stock: 31 },
      ],
      [
        "KWC-AVA-BEC-001 compatible avec: KWC-AVA-003",
        "KWC-DOMO-CAR-001 compatible avec: KWC-DOMO-001, KWC-ONO-002, KWC-AVA-003",
        "KWC-ONO-ECO-001 compatible avec: KWC-ONO-002, KWC-DOMO-001, KWC-AVA-003",
        "KWC-INOX-CAR-001 compatible avec: KWC-INOX-004, KWC-AVA-003",
      ]
    ),
  },

  // ── KWC INOX STAR ───────────────────────────────────────────────────────────
  {
    filename: "KWC_INOX_STAR_Fiche_Technique.pdf",
    lines: productLines(
      "KWC", "INOX STAR", "KWC-INOX-004", "Robinet collectivite",
      [
        "Robinet collectivite tout inox 304L.",
        "Resistant aux produits de nettoyage, demontage facilite.",
        "Usage intensif cuisine professionnelle et collectivite.",
      ],
      [
        "Materiau         : Inox 304L",
        "Raccordement     : 1/2 pouce",
        "Pression         : 1 a 6 bars",
        "Temperature max  : 90 degres C",
        "Norme            : EN 200 collectivite",
      ],
      [
        { ref: "KWC-INOX-CAR-001", name: "Cartouche inox longue duree", stock: 31 },
      ],
      [
        "KWC-INOX-CAR-001 compatible avec: KWC-INOX-004, KWC-AVA-003",
      ]
    ),
  },

  // ── DVS THERMOSTAT DOUCHE ────────────────────────────────────────────────────
  {
    filename: "DVS_THERMOSTAT_DOUCHE_Fiche_Technique.pdf",
    lines: productLines(
      "DVS", "THERMOSTAT DOUCHE", "DVS-THERM-001", "Mitigeur thermostatique douche",
      [
        "Mitigeur thermostatique douche encastre, 2 sorties.",
        "Temperature prereglable 38 degres C, limiteur anti-brulure.",
        "Usage etablissements sanitaires et sportifs.",
      ],
      [
        "Sorties          : 2 (douchette + bain)",
        "Temperature      : Prereglable 38 C",
        "Raccordement     : 1/2 pouce",
        "Pression         : 1 a 5 bars",
        "Norme            : EN 1111",
      ],
      [
        { ref: "DVS-THERM-CAR-001", name: "Cartouche thermostatique DVS", stock: 20 },
        { ref: "DEL-SCTH-CAR-001",  name: "Cartouche thermostatique 38C (commun)", stock: 25 },
      ],
      [
        "DVS-THERM-CAR-001 compatible avec: DVS-THERM-001",
        "DEL-SCTH-CAR-001 compatible avec: DEL-SCTH-002, DVS-THERM-001",
      ]
    ),
  },

  // ── DVS COMPACT ─────────────────────────────────────────────────────────────
  {
    filename: "DVS_COMPACT_Fiche_Technique.pdf",
    lines: productLines(
      "DVS", "COMPACT", "DVS-CMPT-002", "Robinet urinoir",
      [
        "Robinet temporise pour urinoir, debit 1.5 L/chasse.",
        "Corps laiton, alimentation 1/2 pouce.",
        "Usage collectivites, hotels, ERP.",
      ],
      [
        "Alimentation     : 1/2 pouce",
        "Debit chasse     : 1.5 L",
        "Pression         : 1 a 5 bars",
        "Materiau         : Laiton",
        "Temporisation    : Fixe 8 secondes",
      ],
      [
        { ref: "DVS-CMPT-MEM-001", name: "Membrane de chasse 1.5L", stock: 28 },
        { ref: "DVS-CMPT-JNT-001", name: "Kit joints urinoir x6",    stock: 60 },
      ],
      [
        "DVS-CMPT-MEM-001 compatible avec: DVS-CMPT-002",
        "DVS-CMPT-JNT-001 compatible avec: DVS-CMPT-002, DVS-HYG-003",
      ]
    ),
  },

  // ── DVS HYGIENE PRO ─────────────────────────────────────────────────────────
  {
    filename: "DVS_HYGIENE_PRO_Fiche_Technique.pdf",
    lines: productLines(
      "DVS", "HYGIENE PRO", "DVS-HYG-003", "Robinet hygiene",
      [
        "Robinet hygiene commande au coude ou au genou.",
        "Ideal milieu medical et cuisine professionnelle.",
        "Corps inox, bec orientable 360 degres.",
      ],
      [
        "Commande         : Levier coude ou genou",
        "Bec              : Orientable 360 degres",
        "Raccordement     : 1/2 pouce",
        "Pression         : 1 a 6 bars",
        "Materiau         : Inox",
      ],
      [
        { ref: "DVS-HYG-CAR-001", name: "Cartouche commande genou/coude", stock: 16 },
        { ref: "DVS-HYG-BEC-001", name: "Bec orientable 360 degres",      stock: 11 },
        { ref: "DVS-CMPT-JNT-001",name: "Kit joints commun",              stock: 60 },
      ],
      [
        "DVS-HYG-CAR-001 compatible avec: DVS-HYG-003",
        "DVS-HYG-BEC-001 compatible avec: DVS-HYG-003",
        "DVS-CMPT-JNT-001 compatible avec: DVS-CMPT-002, DVS-HYG-003",
      ]
    ),
  },
];

// ─── Generate all PDFs ────────────────────────────────────────────────────────

const outDir = __dirname;

for (const doc of documents) {
  const outPath = path.join(outDir, doc.filename);
  const buffer  = buildPdf(doc.lines);
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ ${doc.filename}  (${buffer.length} bytes)`);
}

console.log(`\nDossier: ${outDir}`);
console.log(`\n${documents.length} fiches generees — une par produit en base de donnees.`);
