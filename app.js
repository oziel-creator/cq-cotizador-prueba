/* ==========================================================
   Cocinas Quintana — lógica del configurador (prototipo)
   Todo lo que hay aquí es DE EJEMPLO: precios, horarios y teléfono.
   ========================================================== */

/* ---------- TABLA DE PRECIOS — ESTIMADOS DE REFERENCIA ----------
   Estimaciones de mercado (investigadas el 18-nov-2026, MXN, IVA incluido).
   NO son precios oficiales de Cocinas Quintana: Ventas debe confirmarlos antes de publicar.
   Calibración: Paquete Básica (fórmica + herraje normal) ≈ $14,000–$20,000 por ml de cocina completa;
                Paquete Premium (cuarzo + cierre lento)  ≈ $25,000–$40,000 por ml.
   Cada concepto tiene su unidad: "ml" (metro lineal), "u" (pieza), "m2" (metro cuadrado).          */
const PRECIOS = {
  gabInferior:   { unidad: "ml", min: 6600,  max: 9400,  nombre: "Gabinetes inferiores" },   // ≈55 % de la cocina completa
  gabSuperior:   { unidad: "ml", min: 5900,  max: 7600,  nombre: "Gabinetes superiores (hasta techo)" }, // ≈45 %
  cubierta: {
    formica:     { unidad: "m2", min: 2400,  max: 4800,  nombre: "Cubierta de fórmica" },  // ≈ $1,500–$3,000 por ml (63 cm de fondo)
    cuarzo:      { unidad: "m2", min: 12700, max: 22200, nombre: "Cubierta de cuarzo" }    // ≈ $8,000–$14,000 por ml
  },
  salpicadera: {
    formica:     { unidad: "m2", min: 1800,  max: 3500,  nombre: "Salpicadera de fórmica" },
    cuarzo:      { unidad: "m2", min: 9000,  max: 16000, nombre: "Salpicadera de cuarzo" }
  },
  bisagraLenta:  { unidad: "ml", min: 900,   max: 1800,  nombre: "Bisagras cierre lento" },   // por ml de gabinete (inf + sup)
  correderaLenta:{ unidad: "u",  min: 1100,  max: 2200,  nombre: "Correderas cierre lento" },  // por cajón
  altoBrillo:    { unidad: "u",  min: 900,   max: 1600,  nombre: "Alto brillo en superiores" },// por puerta superior
  luzLed:        { unidad: "ml", min: 650,   max: 1200,  nombre: "Luz LED bajo superiores" },
  spots:         { unidad: "u",  min: 450,   max: 850,   nombre: "Spots de iluminación" },
  plafonDeco:    { unidad: "ml", min: 1200,  max: 2200,  nombre: "Plafón decorativo" },
  plafonSup:     { unidad: "ml", min: 900,   max: 1700,  nombre: "Plafón sobre superiores" },
  extraTipo: {   // estructura adicional (costados terminados, volados, soportes) — por pieza
    isla:        { unidad: "u", min: 6000, max: 12000, nombre: "Isla: costados y estructura" },
    barra:       { unidad: "u", min: 4000, max: 8000,  nombre: "Barra: volado y soportes" },
    contrabarra: { unidad: "u", min: 5000, max: 10000, nombre: "Contrabarra: barra elevada" },
    dual:        { unidad: "u", min: 6000, max: 12000, nombre: "Dual: segundo frente" }
  },
  accesorios: {  // precio de referencia por pieza, IVA incluido (sin marcas)
    basurero:    { unidad: "u", min: 9277.68,  max: 9277.68,  nombre: "Basurero doble extraíble 450 mm" },
    especiero:   { unidad: "u", min: 2317.68,  max: 2317.68,  nombre: "Especiero/botellero extraíble 150 mm" },
    giratoria:   { unidad: "u", min: 11597.68, max: 11597.68, nombre: "Giratoria de esquina 3 cuadrantes" }
  }
};
/* SUPUESTOS para convertir metros lineales en piezas y áreas (confirmar con Ventas): */
const SUPUESTOS = {
  fondoCubierta: 0.63,        // m (cubierta 63 cm × 3.5 cm)
  altoSalpicadera: 0.55,      // m entre cubierta y gabinetes superiores
  mlPorPuertaSuperior: 0.5,   // ~1 puerta superior cada 0.5 ml
  cajonesPorMl: 2.5,          // ~1 cajonera de 3 cajones cada 1.2 ml de inferior
  mlPorSpot: 1.0, spotsMin: 2 // ~1 spot por ml de cocina, mínimo 2
};
const WHATSAPP_VENTAS = "528139924992"; // WhatsApp ventas Cocinas Quintana: 81 3992 4992

const NOMBRES = {
  tipo: { lineal: "Lineal", u: "En U", paralela: "Paralela", escuadra: "En escuadra (L)", isla: "Con isla", barra: "Con barra", contrabarra: "Contrabarra", dual: "Dual" },
  acabado: { mate: "Mate", brillo: "Alto brillo" },
  extra: { led: "Luz LED", spots: "Spots", plafdec: "Plafón decorativo", plafsup: "Plafón sobre superiores", salpi: "Salpicadera" },
  acc: { basurero: "Basurero doble", especiero: "Especiero", giratoria: "Giratoria de esquina" },
  cubierta: { formica: "Fórmica", cuarzo: "Cuarzo" },
  herraje: { normal: "Normal", lento: "Cierre lento" },
  alcance: { inf: "Solo inferior", sup: "Solo superior", ambas: "Inferior y superior" }
};
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const q = new URLSearchParams(location.search);
const S = { tipo: null, cubierta: null, herraje: null, alcance: null, acabado: null, extras: [], acc: [], largo: null, ancho: null, alto: null, fotos: [], paso: 0, max: 0, vista: "top" };
const GROUPS = ["tipo", "cubierta", "herraje", "alcance", "acabado"], LAST = 5;
const mxn = n => "$" + Math.round(n).toLocaleString("es-MX");
const r500 = n => Math.round(n / 500) * 500, r1k = n => Math.round(n / 1000) * 1000;

/* ---------- cálculo ---------- */
function metros() {
  const A = S.largo || 3.6, B = Math.max(S.ancho || 2.4, 1.8), d = 0.6;
  const isla = Math.min(A * 0.55, 2.4), pen = Math.min(B - d - 0.9, 1.6), cb = A * 0.7;
  const muro = { lineal: A, escuadra: A + B - d, u: A + 2 * (B - d), paralela: 2 * A, isla: A, barra: A, contrabarra: A, dual: A + B - d }[S.tipo] || A;
  const libre = { isla, barra: pen, contrabarra: cb, dual: Math.min(A * 0.5, 2) }[S.tipo] || 0;
  const altos = S.tipo === "paralela" ? A : muro;   // en paralela, superiores solo en una pared
  return { muro, libre, bajos: muro + libre, altos };
}
function precio() {
  const P = PRECIOS, U = SUPUESTOS, m = metros(), inf = S.alcance !== "sup", sup = S.alcance !== "inf", has = k => S.extras.includes(k);
  const rows = [];
  const add = (c, cant, txt, grupo) => { if (cant > 0) rows.push({ nombre: c.nombre, cant, unidad: c.unidad, min: cant * c.min, max: cant * c.max, txt, grupo }); };
  const f1 = n => (Math.round(n * 10) / 10).toFixed(1);
  if (inf) add(P.gabInferior, m.bajos, `${f1(m.bajos)} ml`, "base");
  if (sup) add(P.gabSuperior, m.altos, `${f1(m.altos)} ml`, "base");
  if (inf && S.cubierta) { const a = m.bajos * U.fondoCubierta; add(P.cubierta[S.cubierta], a, `${a.toFixed(2)} m²`, "base"); }
  if (S.herraje === "lento") {
    add(P.bisagraLenta, (inf ? m.bajos : 0) + (sup ? m.altos : 0), `${f1((inf ? m.bajos : 0) + (sup ? m.altos : 0))} ml`, "base");
    if (inf) { const c = Math.round(m.bajos * U.cajonesPorMl); add(P.correderaLenta, c, `${c} pzas`, "base"); }
  }
  if (inf && P.extraTipo[S.tipo]) add(P.extraTipo[S.tipo], 1, "1 pza", "base");
  if (sup && S.acabado === "brillo") { const c = Math.ceil(m.altos / U.mlPorPuertaSuperior); add(P.altoBrillo, c, `${c} puertas`, "extra"); }
  if (sup && has("led")) add(P.luzLed, m.altos, `${f1(m.altos)} ml`, "extra");
  if (has("spots")) { const c = Math.max(U.spotsMin, Math.round(m.muro / U.mlPorSpot)); add(P.spots, c, `${c} pzas`, "extra"); }
  if (has("plafdec")) add(P.plafonDeco, m.muro, `${f1(m.muro)} ml`, "extra");
  if (sup && has("plafsup")) add(P.plafonSup, m.altos, `${f1(m.altos)} ml`, "extra");
  if (inf && has("salpi") && S.cubierta) { const a = m.muro * U.altoSalpicadera; add(P.salpicadera[S.cubierta], a, `${a.toFixed(2)} m²`, "extra"); }
  S.acc.forEach(k => add(P.accesorios[k], 1, "1 pza", "acc"));
  const min = rows.reduce((t, r) => t + r.min, 0), max = rows.reduce((t, r) => t + r.max, 0);
  const pkg = S.cubierta === "cuarzo" && S.herraje === "lento" ? "Paquete Premium" : S.cubierta === "formica" && S.herraje === "normal" ? "Paquete Básica" : "Paquete combinado";
  return { m, inf, sup, rows, min: r1k(min), max: r1k(max), pkg };
}

/* ---------- dibujo: vista superior ---------- */
const NS = "http://www.w3.org/2000/svg";
function runsFor(tipo, A, B) {
  const d = 0.6, R = [{ x: 0, y: 0, w: A, h: d, wall: true, main: true }];
  if (tipo === "escuadra" || tipo === "u") R.push({ x: 0, y: d, w: d, h: B - d, wall: true, side: "Cajonero" });
  if (tipo === "u") R.push({ x: A - d, y: d, w: d, h: B - d, wall: true, side: "Esquinero" });
  if (tipo === "paralela") R.push({ x: 0, y: B - d, w: A, h: d, wall: true, side: "Cajonero" });
  if (tipo === "isla") { const w = Math.min(A * .55, 2.4); R.push({ x: (A - w) / 2, y: Math.max(d + 1, B / 2 - .2), w, h: .9, name: "Isla", stools: "s" }); }
  if (tipo === "barra") { const h = Math.min(B - d - .9, 1.6); R.push({ x: A - d - .1, y: d, w: d + .1, h, name: "Barra", stools: "w" }); }
  if (tipo === "dual") { R.push({ x: 0, y: d, w: d, h: B - d, wall: true, side: "Cajonero" }); const w = Math.min(A * .5, 2); R.push({ x: (A - w) / 2 + .3, y: Math.max(d + 1, B / 2 - .1), w, h: .9, name: "Isla", stools: "s" }); }
  if (tipo === "contrabarra") { const w = A * .7; R.push({ x: (A - w) / 2, y: Math.max(d + 1, B / 2 - .2), w, h: .6, name: "Contrabarra", raise: true, stools: "s" }); }
  return R;
}
function el(n, a, txt) { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; return e; }
function drawTop(svg, compact) {
  svg.innerHTML = "";
  const narrow = !compact && svg.parentNode && svg.parentNode.clientWidth < 560, k = narrow ? 1.8 : 1;
  const W = 800, H = narrow ? 640 : 500, tipo = S.tipo || "escuadra";
  const A = S.largo || 3.6, B = Math.max(S.ancho || 2.4, ["isla", "contrabarra", "dual"].includes(tipo) ? 2.6 : 1.8);
  const pad = compact ? 40 : (narrow ? 64 : 70), s = Math.min((W - pad * 2) / A, (H - pad * 2 - (compact ? 0 : 30 * k)) / B);
  const ox = (W - A * s) / 2, oy = (H - B * s) / 2 + (compact ? 0 : 10);
  const X = v => ox + v * s, Y = v => oy + v * s, L = v => v * s;
  const inf = S.alcance !== "sup", sup = S.alcance !== "inf", g = el("g", {});
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.appendChild(g); const gB = el("g", {}), gU = el("g", {}), gL = el("g", {}); svg.append(gB, gU, gL);
  const fs = compact ? 22 : 15 * k;
  // piso y muros
  g.appendChild(el("rect", { x: X(0), y: Y(0), width: L(A), height: L(B), fill: "none", stroke: "var(--plan-room)", "stroke-width": 1.5, "stroke-dasharray": "6 5" }));
  const walls = { lineal: "t", escuadra: "tl", u: "tlr", paralela: "tb", isla: "t", barra: "t", contrabarra: "t", dual: "tl" }[tipo];
  const wl = { t: [0, 0, A, 0], l: [0, 0, 0, B], r: [A, 0, A, B], b: [0, B, A, B] };
  for (const k of walls) { const [a, b, c, d] = wl[k]; g.appendChild(el("line", { x1: X(a), y1: Y(b), x2: X(c), y2: Y(d), stroke: "var(--ink)", "stroke-width": compact ? 7 : 6, "stroke-linecap": "square" })); }
  // cotas
  if (!compact) {
    g.appendChild(el("line", { x1: X(0), y1: Y(0) - 34, x2: X(A), y2: Y(0) - 34, stroke: "var(--faint)", "marker-start": "", "stroke-width": 1 }));
    [0, A].forEach(v => g.appendChild(el("line", { x1: X(v), y1: Y(0) - 42, x2: X(v), y2: Y(0) - 26, stroke: "var(--faint)" })));
    g.appendChild(el("text", { x: X(A / 2), y: Y(0) - 42, "text-anchor": "middle", "font-size": 14 * k, "font-weight": 700, fill: "var(--ink2)" }, A.toFixed(2) + " m"));
    g.appendChild(el("line", { x1: X(0) - 34, y1: Y(0), x2: X(0) - 34, y2: Y(B), stroke: "var(--faint)" }));
    [0, B].forEach(v => g.appendChild(el("line", { x1: X(0) - 42, y1: Y(v), x2: X(0) - 26, y2: Y(v), stroke: "var(--faint)" })));
    g.appendChild(el("text", { x: X(0) - 46, y: Y(B / 2), "text-anchor": "middle", "font-size": 14 * k, "font-weight": 700, fill: "var(--ink2)", transform: `rotate(-90 ${X(0) - 46} ${Y(B / 2)})` }, B.toFixed(2) + " m"));
  }
  runsFor(tipo, A, B).forEach(r => {
    const horiz = r.w >= r.h, len = horiz ? r.w : r.h, n = Math.max(1, Math.round(len / 0.8)), step = len / n;
    // altos (vista superior: contorno punteado sobre la pared)
    if (sup && r.wall) {
      const dd = .35, ra = horiz ? { x: r.x, y: r.y === 0 ? 0 : r.y + r.h - dd, w: r.w, h: dd } : { x: r.x === 0 ? 0 : r.x + r.w - dd, y: r.y, w: dd, h: r.h };
      gU.appendChild(el("rect", { x: X(ra.x), y: Y(ra.y), width: L(ra.w), height: L(ra.h), fill: "var(--plan-a)", "fill-opacity": inf ? .55 : 1, stroke: "var(--oak-d)", "stroke-dasharray": "5 4", "stroke-width": 1.4 }));
    }
    if (!inf && r.wall) return;
    if (!inf) { gB.appendChild(el("rect", { x: X(r.x), y: Y(r.y), width: L(r.w), height: L(r.h), fill: "none", stroke: "var(--plan-room)", "stroke-dasharray": "4 4" })); return; }
    for (let i = 0; i < n; i++) {
      const mx = horiz ? r.x + i * step : r.x, my = horiz ? r.y : r.y + i * step, mw = horiz ? step : r.w, mh = horiz ? r.h : step;
      gB.appendChild(el("rect", { x: X(mx) + .5, y: Y(my) + .5, width: L(mw) - 1, height: L(mh) - 1, rx: 2, fill: "var(--plan-b)", stroke: "var(--walnut)", "stroke-width": 1, opacity: sup ? .92 : 1 }));
    }
    // cubierta (canto frontal)
    const t = .07, ct = horiz ? { x: r.x, y: r.y === 0 ? r.h - t : r.y, w: r.w, h: t } : { x: r.x === 0 ? r.w - t : r.x, y: r.y, w: t, h: r.h };
    if (r.y === 0 || !r.wall || r.x === 0 || r.x > 0) gB.appendChild(el("rect", { x: X(ct.x), y: Y(ct.y), width: L(ct.w), height: L(ct.h), fill: "var(--plan-t)", stroke: "var(--line2)", "stroke-width": .8 }));
    if (r.raise) gB.appendChild(el("rect", { x: X(r.x), y: Y(r.y + r.h), width: L(r.w), height: L(.3), fill: "var(--ink)", rx: 2 }));
    // equipos y etiquetas en la corrida principal
    if (r.main) {
      const iT = Math.max(0, Math.floor(n * .3)), iE = Math.min(n - 1, Math.max(iT + 1, Math.floor(n * .68)));
      const cx = i => X(r.x + (i + .5) * step), cy = Y(r.h / 2);
      gB.appendChild(el("rect", { x: cx(iT) - L(.22), y: cy - L(.16), width: L(.44), height: L(.32), rx: 6, fill: "var(--plan-bg)", stroke: "var(--plan-x)", "stroke-width": 1.6 }));
      [[-.11, -.08], [.11, -.08], [-.11, .1], [.11, .1]].forEach(([a, b]) => gB.appendChild(el("circle", { cx: cx(iE) + L(a), cy: cy + L(b), r: L(.065), fill: "none", stroke: "var(--plan-x)", "stroke-width": 1.6 })));
      if (!compact) {
        lab(gL, cx(iT), Y(r.h) + 22 * k, "Tarja", fs); lab(gL, cx(iE), Y(r.h) + 22 * k, "Estufa", fs);
        if (n > 3 && !narrow) lab(gL, cx(n - 1), Y(r.h) + 22 * k, sup ? "Alacena" : "Cajonero", fs);
      }
    }
    if (r.side && !compact) { const cx = X(r.x + r.w / 2), cy = Y(r.y + r.h / 2); lab(gL, cx + (r.x === 0 ? L(r.w) / 2 + 40 : -L(r.w) / 2 - 44), cy, r.side, fs, r.h > r.w ? 0 : 0); if (!horiz) {} }
    if (r.name) lab(gL, X(r.x + r.w / 2), Y(r.y + r.h / 2) + 5, r.name, compact ? 24 : 16 * k, 0, true);
    if (r.stools) {
      const k = r.stools === "s" ? Math.max(2, Math.floor(r.w / .6)) : Math.max(2, Math.floor(r.h / .6));
      for (let i = 0; i < k; i++) {
        const sx = r.stools === "s" ? X(r.x + (i + .5) * r.w / k) : X(r.x) - L(.35), sy = r.stools === "s" ? Y(r.y + r.h + (r.raise ? .3 : 0)) + L(.3) : Y(r.y + (i + .5) * r.h / k);
        gL.appendChild(el("circle", { cx: sx, cy: sy, r: L(.17), fill: "none", stroke: "var(--ink2)", "stroke-width": 1.5 }));
      }
    }
  });
  if (!compact) {
    const tags = [];
    if (S.cubierta && inf) tags.push("Cubierta: " + NOMBRES.cubierta[S.cubierta]);
    if (S.herraje) tags.push("Herraje: " + NOMBRES.herraje[S.herraje]);
    tags.push("Vista superior");
    tags.forEach((t, i) => gL.appendChild(el("text", { x: W - 18, y: H - 18 - i * 20 * k, "text-anchor": "end", "font-size": 13 * k, "font-weight": 700, fill: "var(--muted)" }, t)));
  }
}
function lab(g, x, y, t, fs, rot, inv) {
  const w = t.length * fs * .58 + 14, h = fs + 10;
  g.appendChild(el("rect", { x: x - w / 2, y: y - h / 2 - fs * .32, width: w, height: h, rx: h / 2, fill: inv ? "var(--ink)" : "var(--surf)", stroke: inv ? "none" : "var(--line2)" }));
  g.appendChild(el("text", { x, y: y, "text-anchor": "middle", "font-size": fs, "font-weight": 700, fill: inv ? "var(--paper)" : "var(--ink2)" }, t));
}

/* ---------- dibujo: vista frontal (pared principal) ---------- */
function drawFront(svg) {
  svg.innerHTML = "";
  const narrow = svg.parentNode && svg.parentNode.clientWidth < 560, k = narrow ? 1.7 : 1;
  const W = 800, H = narrow ? 640 : 500, A = S.largo || 3.6, Ht = Math.min(Math.max(S.alto || 2.4, 2.1), 3.2);
  const s = Math.min((W - 160 * k) / A, (H - 150 * k) / Ht), ox = (W - A * s) / 2 + 10, base = H - 60 * k;
  const X = v => ox + v * s, Y = v => base - v * s, L = v => v * s, inf = S.alcance !== "sup", sup = S.alcance !== "inf";
  const g = el("g", {}); svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.appendChild(g);
  g.appendChild(el("rect", { x: X(0), y: Y(Ht), width: L(A), height: L(Ht), fill: "var(--stone)", opacity: .5 }));
  g.appendChild(el("line", { x1: X(-.2), y1: base, x2: X(A + .2), y2: base, stroke: "var(--ink)", "stroke-width": 3 }));
  g.appendChild(el("line", { x1: X(-.2), y1: Y(Ht), x2: X(A + .2), y2: Y(Ht), stroke: "var(--plan-room)", "stroke-width": 2, "stroke-dasharray": "6 5" }));
  const n = Math.max(1, Math.round(A / .8)), st = A / n, iT = Math.floor(n * .3), iE = Math.min(n - 1, Math.max(iT + 1, Math.floor(n * .68)));
  const tall = n > 3 && sup && inf;
  for (let i = 0; i < n; i++) {
    const x = i * st, last = i === n - 1;
    if (tall && last) { // alacena de piso a techo
      const top = Math.min(Ht - .05, 2.3);
      g.appendChild(el("rect", { x: X(x) + 1, y: Y(top), width: L(st) - 2, height: L(top - .1), rx: 2, fill: "var(--plan-b)", stroke: "var(--walnut)" }));
      g.appendChild(el("line", { x1: X(x + st / 2), y1: Y(top) + 2, x2: X(x + st / 2), y2: Y(.1) - 2, stroke: "var(--walnut)" }));
      handle(g, X(x + st / 2) - 7, Y(1.15), true); handle(g, X(x + st / 2) + 7, Y(1.15), true);
      lab(g, X(x + st / 2), Y(1.85), "Alacena", 13 * k);
      continue;
    }
    if (inf) {
      g.appendChild(el("rect", { x: X(x) + 1, y: Y(.86), width: L(st) - 2, height: L(.76), rx: 2, fill: "var(--plan-b)", stroke: "var(--walnut)" }));
      if (i === iE) { g.appendChild(el("rect", { x: X(x) + 6, y: Y(.8), width: L(st) - 12, height: L(.6), rx: 3, fill: "var(--plan-x)" })); }
      else if (i % 2 === 1 && i !== iT) { [.6, .35].forEach(h => g.appendChild(el("line", { x1: X(x) + 1, y1: Y(h), x2: X(x + st) - 1, y2: Y(h), stroke: "var(--walnut)" }))); [.73, .48, .22].forEach(h => handle(g, X(x + st / 2), Y(h))); }
      else { g.appendChild(el("line", { x1: X(x + st / 2), y1: Y(.86), x2: X(x + st / 2), y2: Y(.1), stroke: "var(--walnut)" })); handle(g, X(x + st / 2) - 8, Y(.74), true); handle(g, X(x + st / 2) + 8, Y(.74), true); }
    }
    if (sup) {
      if (i === iE) { // campana
        g.appendChild(el("path", { d: `M${X(x + st * .2)} ${Y(1.55)}h${L(st * .6)}l${L(.08)} ${L(.12)}H${X(x + st * .2) - L(.08)}z`, fill: "var(--plan-x)" }));
        g.appendChild(el("rect", { x: X(x + st * .4), y: Y(Math.min(Ht, 2.3)), width: L(st * .2), height: L(Math.min(Ht, 2.3) - 1.55), fill: "var(--plan-x)" }));
      } else {
        const top = Math.min(Ht - .05, 2.25);
        g.appendChild(el("rect", { x: X(x) + 1, y: Y(top), width: L(st) - 2, height: L(top - 1.5), rx: 2, fill: "var(--plan-a)", stroke: "var(--oak-d)" }));
        g.appendChild(el("line", { x1: X(x + st / 2), y1: Y(top) + 2, x2: X(x + st / 2), y2: Y(1.5) - 2, stroke: "var(--oak-d)" }));
        handle(g, X(x + st / 2) - 8, Y(1.6), true); handle(g, X(x + st / 2) + 8, Y(1.6), true);
      }
    }
  }
  if (inf) {
    const cw = tall ? A - st : A;
    g.appendChild(el("rect", { x: X(-.02), y: Y(.9), width: L(cw + .04), height: L(.04) + 2, fill: "var(--plan-t)", stroke: "var(--line2)" }));
    g.appendChild(el("rect", { x: X(0) + 3, y: Y(.1), width: L(cw) - 6, height: L(.1), fill: "var(--ink)", opacity: .85 }));
    g.appendChild(el("path", { d: `M${X((iT + .5) * st)} ${Y(.9)}v-${L(.22)}a${L(.06)} ${L(.06)} 0 0 1 ${L(.12)} 0`, fill: "none", stroke: "var(--plan-x)", "stroke-width": 3 }));
    lab(g, X((iT + .5) * st), Y(1.3), "Tarja", 13 * k); lab(g, X((iE + .5) * st), Y(.5), "Estufa", 13 * k, 0, true);
  }
  // acabados y extras (resaltados)
  const has = k => S.extras.includes(k), cw2 = tall ? A - st : A, topU = Math.min(Ht - .05, 2.25), hl = { fill: "var(--gold)", "fill-opacity": .28, stroke: "var(--gold-t)", "stroke-dasharray": "4 3" };
  const tag = (x, y, t) => lab(g, x, y, t, 12 * k);
  if (inf && has("salpi")) { g.insertBefore(el("rect", { x: X(0), y: Y(1.5), width: L(cw2), height: L(.56), ...hl }), g.children[1]); tag(X(cw2 * .78), Y(1.22), "Salpicadera"); }
  if (sup && has("led")) { g.appendChild(el("path", { d: `M${X(0)} ${Y(1.5)}h${L(cw2)}l-${L(.12)} ${L(.5)}H${X(.12)}z`, fill: "var(--gold-l)", opacity: .45 })); g.appendChild(el("line", { x1: X(0), y1: Y(1.5) + 2, x2: X(cw2), y2: Y(1.5) + 2, stroke: "var(--gold)", "stroke-width": 4, "stroke-linecap": "round" })); tag(X(cw2 * .22), Y(1.38), "Luz LED"); }
  if (sup && has("plafsup") && Ht - topU > .04) { g.appendChild(el("rect", { x: X(0), y: Y(Ht), width: L(A), height: L(Ht - topU), ...hl })); tag(X(A * .3), Y((Ht + topU) / 2) + 4, "Plafón sobre superiores"); }
  if (has("plafdec")) { g.appendChild(el("rect", { x: X(-.15), y: Y(Ht), width: L(A + .3), height: L(.1), fill: "var(--gold)", "fill-opacity": .45 })); tag(X(A * .72), Y(Ht) - 12, "Plafón decorativo"); }
  if (has("spots")) for (let i = 0; i < Math.max(2, Math.round(A)); i++) { const x = X((i + .5) * A / Math.max(2, Math.round(A))); g.appendChild(el("path", { d: `M${x - 5} ${Y(Ht) + 4}h10l${L(.18)} ${L(.5)}h-${L(.36) + 10}z`, fill: "var(--gold-l)", opacity: .35 })); g.appendChild(el("circle", { cx: x, cy: Y(Ht) + 4, r: 5, fill: "var(--gold)" })); }
  if (sup && S.acabado === "brillo") for (let i = 0; i < n; i++) { if (i === iE || (tall && i === n - 1)) continue; const x = X(i * st); g.appendChild(el("path", { d: `M${x + L(.1)} ${Y(1.55)}l${L(.25)} -${L(.55)}M${x + L(.25)} ${Y(1.55)}l${L(.18)} -${L(.4)}`, stroke: "#fff", "stroke-width": 3, opacity: .8 })); }
  // cotas
  g.appendChild(el("text", { x: X(A / 2), y: base + 34 * k, "text-anchor": "middle", "font-size": 14 * k, "font-weight": 700, fill: "var(--ink2)" }, "Largo " + A.toFixed(2) + " m"));
  g.appendChild(el("line", { x1: X(0) - 30, y1: Y(0), x2: X(0) - 30, y2: Y(Ht), stroke: "var(--faint)" }));
  g.appendChild(el("text", { x: X(0) - 40 * k, y: Y(Ht / 2), "text-anchor": "middle", "font-size": 14 * k, "font-weight": 700, fill: "var(--ink2)", transform: `rotate(-90 ${X(0) - 40 * k} ${Y(Ht / 2)})` }, "Alto " + Ht.toFixed(2) + " m"));
  g.appendChild(el("text", { x: W - 18, y: 26, "text-anchor": "end", "font-size": 13 * k, "font-weight": 700, fill: "var(--muted)" }, "Vista frontal · pared principal"));
  if (S.herraje === "lento") g.appendChild(el("text", { x: W - 18, y: 26 + 20 * k, "text-anchor": "end", "font-size": 13 * k, "font-weight": 700, fill: "var(--gold-t)" }, "Cierre lento en puertas y cajones"));
}
function handle(g, x, y, vert) { g.appendChild(el("line", vert ? { x1: x, y1: y - 9, x2: x, y2: y + 9 } : { x1: x - 12, y1: y, x2: x + 12, y2: y }, {})).setAttribute("style", "stroke:var(--ink);stroke-width:3;stroke-linecap:round"); }

/* ---------- interfaz ---------- */
const steps = $$(".step"), stEls = $$(".st"), nextBtn = $("#nextBtn"), prevBtn = $("#prevBtn"), hint = $("#cfgHint");
function valid(i) {
  if (i === 4) return S.alcance === "inf" || !!S.acabado;   // sin superiores, el acabado no aplica
  if (i < LAST) return !!S[GROUPS[i]];
  return ["largo", "ancho", "alto"].every(k => S[k] >= .5 && S[k] <= 12);
}
const ARROW = `<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
function go(i) {
  S.paso = Math.max(0, Math.min(LAST, i)); S.max = Math.max(S.max, S.paso);
  steps.forEach((s, k) => s.classList.toggle("on", k === S.paso));
  stEls.forEach((s, k) => { s.classList.toggle("cur", k === S.paso); s.classList.toggle("done", k !== S.paso && valid(k)); $("button", s).disabled = k > S.max && !valid(k - 1); });
  $("#stepNum").textContent = S.paso + 1; $("#progBar").style.width = ((S.paso + 1) / (LAST + 1) * 100) + "%";
  prevBtn.disabled = S.paso === 0;
  refreshNav();
}
function refreshNav() {
  const ok = valid(S.paso), last = S.paso === LAST;
  nextBtn.innerHTML = (last ? "Ver mi cotización preliminar " : "Siguiente ") + ARROW;
  nextBtn.disabled = !ok;
  hint.textContent = ok ? (last ? "¡Listo! Ya puedes ver tu precio estimado" : "Puedes cambiar tu elección cuando quieras") : (last ? "Escribe largo, ancho y alto (en metros)" : S.paso === 4 ? "Elige el acabado de las puertas superiores" : "Elige una opción para continuar");
}
function syncExtras() { // los extras de superiores no aplican si solo hay parte inferior (y viceversa)
  const soloInf = S.alcance === "inf", soloSup = S.alcance === "sup";
  $$("#cfgForm .opt").forEach(o => {
    const inp = $("input", o), off = (soloInf && ((inp.name === "extra" && ["led", "plafsup"].includes(inp.value)) || (inp.name === "acabado" && inp.value === "brillo"))) || (soloSup && inp.name === "extra" && inp.value === "salpi");
    o.classList.toggle("is-dis", off); inp.disabled = off;
    if (off && inp.checked) { inp.checked = false; if (inp.name === "acabado") S.acabado = null; }
    let n = $(".opt-na", o); if (off && !n) { n = document.createElement("small"); n.className = "opt-na"; n.textContent = soloInf ? "Requiere gabinetes superiores" : "Requiere gabinetes inferiores"; $(".opt-txt", o).appendChild(n); } else if (!off && n) n.remove();
  });
  S.extras = $$('#cfgForm input[name=extra]:checked').map(i => i.value);
  S.acc = $$('#cfgForm input[name=acc]:checked').map(i => i.value);
}
function updateSide() {
  const ex = [S.acabado && NOMBRES.acabado[S.acabado], ...S.extras.map(k => NOMBRES.extra[k]), ...S.acc.map(k => NOMBRES.acc[k])].filter(Boolean);
  const rows = [["Tipo", S.tipo && NOMBRES.tipo[S.tipo]], ["Cubierta", S.cubierta && NOMBRES.cubierta[S.cubierta]], ["Herraje", S.herraje && NOMBRES.herraje[S.herraje]], ["Alcance", S.alcance && NOMBRES.alcance[S.alcance]],
    ["Acabados", (S.acabado || (S.alcance === "inf" && S.max >= 4)) ? (!ex.length ? "Sin extras" : ex.length > 2 ? ex.slice(0, 2).join(", ") + ` +${ex.length - 2}` : ex.join(", ")) : null],
    ["Medidas", valid(LAST) ? `${S.largo.toFixed(2)} × ${S.ancho.toFixed(2)} × ${S.alto.toFixed(2)} m` : null]];
  $("#selList").innerHTML = rows.map(([k, v]) => `<li class="${v ? "ok" : ""}"><span class="dot">${v ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>' : ""}</span><span class="k">${k}</span><span class="v ${v ? "" : "empty"}">${v || "Sin elegir"}</span></li>`).join("");
  const mv = $("#mlVal"); if (mv) { const m = metros(); mv.innerHTML = S.tipo && S.largo ? `Tu cocina: <b>≈ ${m.bajos.toFixed(1)} ml</b> de gabinete inferior${S.alcance !== "inf" ? ` y <b>${m.altos.toFixed(1)} ml</b> superior` : ""}` : "Escribe el largo para calcular tus metros lineales"; }
  const mini = $("#miniPrev");
  if (!S.tipo) { mini.innerHTML = `<span style="color:var(--faint);font-size:14px;font-weight:600">Elige un tipo de cocina</span>`; return; }
  mini.innerHTML = ""; const sv = el("svg", {}); mini.appendChild(sv); drawTop(sv, true);
}
function updateResult() {
  const p = precio(), plan = $("#plan"); plan.innerHTML = ""; const sv = el("svg", { role: "img", "aria-label": "Esquema de armado ilustrativo" }); plan.appendChild(sv);
  S.vista === "front" ? drawFront(sv) : drawTop(sv);
  $("#priceV").textContent = `${mxn(p.min)} – ${mxn(p.max)}`;
  $("#pkg").textContent = p.pkg; $("#mlTot").textContent = `${p.m.bajos.toFixed(1)} ml`;
  const G = { base: "Cocina", extra: "Acabados y extras", acc: "Accesorios" };
  let html = "", last = "";
  p.rows.forEach(r => { if (r.grupo !== last) { html += `<tr class="grp"><td colspan="2">${G[r.grupo]}</td></tr>`; last = r.grupo; }
    html += `<tr><td>${r.nombre}<small>${r.txt}</small></td><td>${r.min === r.max ? mxn(r.min) : mxn(r100(r.min)) + " – " + mxn(r100(r.max))}</td></tr>`; });
  if (!p.inf) html += `<tr class="na"><td>Gabinetes inferiores y cubierta</td><td>No incluye</td></tr>`;
  if (!p.sup) html += `<tr class="na"><td>Gabinetes superiores</td><td>No incluye</td></tr>`;
  $("#brk").innerHTML = html;
  const ex = [...S.extras.map(k => NOMBRES.extra[k]), ...S.acc.map(k => NOMBRES.acc[k])];
  $("#summ").innerHTML = [["Tipo de cocina", NOMBRES.tipo[S.tipo]], ["Cubierta", NOMBRES.cubierta[S.cubierta] + (p.inf ? "" : " (no aplica)")], ["Herraje", NOMBRES.herraje[S.herraje]], ["Alcance", NOMBRES.alcance[S.alcance]],
    ["Superiores", p.sup ? NOMBRES.acabado[S.acabado] || "—" : "No aplica"], ["Extras", ex.length ? ex.join(", ") : "Ninguno"],
    ["Medidas", `${S.largo.toFixed(2)} × ${S.ancho.toFixed(2)} × ${S.alto.toFixed(2)} m`], ["Fotos", S.fotos.length ? S.fotos.length + " adjunta(s)" : "Sin fotos"]].map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("");
  waLinks();
}
const r100 = n => Math.round(n / 100) * 100;
function waLinks() {
  const t = S.tipo ? `Hola, quiero cotizar una cocina ${NOMBRES.tipo[S.tipo]}${S.largo ? " de " + S.largo + " m" : ""}. Es un proyecto personalizado.` : "Hola, tengo un proyecto de cocina muy personalizado.";
  $$("[data-wa]").forEach(a => { a.href = `https://wa.me/${WHATSAPP_VENTAS}?text=${encodeURIComponent(t)}`; a.target = "_blank"; a.rel = "noopener"; });
  $$("[data-wa-v]").forEach(a => { a.href = `https://wa.me/${WHATSAPP_VENTAS}?text=${encodeURIComponent("Hola, quiero cotizar un vestidor a la medida.")}`; a.target = "_blank"; a.rel = "noopener"; });
}
function showResult(scroll) { document.body.classList.add("show-res"); $("#sideNote").innerHTML = "✓ Tu precio estimado está listo abajo. Si cambias algo, se actualiza solo."; updateResult(); if (scroll) $("#resultado").scrollIntoView({ behavior: "smooth" }); }

// selección de tarjetas
$$("#cfgForm input[type=radio]").forEach(inp => inp.addEventListener("change", () => {
  S[inp.name] = inp.value; if (inp.name === "alcance") syncExtras(); updateSide(); refreshNav(); go(S.paso);
  if (document.body.classList.contains("show-res")) updateResult();
  if (S.paso < 4) setTimeout(() => { if (valid(S.paso) && inp.name === GROUPS[S.paso]) go(S.paso + 1); }, 380);
}));
$$("#cfgForm input[type=checkbox]").forEach(inp => inp.addEventListener("change", () => { syncExtras(); updateSide(); if (document.body.classList.contains("show-res")) updateResult(); }));
// (i) más información: no selecciona la tarjeta
$$(".opt-i").forEach(b => {
  const t = e => { e.preventDefault(); e.stopPropagation(); const o = b.classList.contains("open"); $$(".opt-i.open").forEach(x => x.classList.remove("open")); b.classList.toggle("open", !o); };
  b.addEventListener("click", t); b.addEventListener("keydown", e => (e.key === "Enter" || e.key === " ") && t(e));
});
document.addEventListener("click", () => $$(".opt-i.open").forEach(x => x.classList.remove("open")));
// medidas
["largo", "ancho", "alto"].forEach(k => {
  const i = $("#" + k), f = i.closest(".field");
  i.addEventListener("input", () => { const v = parseFloat(i.value); S[k] = isNaN(v) ? null : v; if (S[k] >= .5 && S[k] <= 12) f.classList.remove("is-err"); updateSide(); refreshNav(); if (document.body.classList.contains("show-res") && valid(LAST)) updateResult(); });
  i.addEventListener("blur", () => f.classList.toggle("is-err", i.value !== "" && !(S[k] >= .5 && S[k] <= 12)));
});
nextBtn.addEventListener("click", () => {
  if (S.paso < LAST) return go(S.paso + 1);
  nextBtn.classList.add("is-load"); nextBtn.innerHTML = `<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9"/></svg> Calculando…`;
  setTimeout(() => { nextBtn.classList.remove("is-load"); refreshNav(); showResult(true); }, 700);
});
prevBtn.addEventListener("click", () => go(S.paso - 1));
$$("[data-goto]").forEach(b => b.addEventListener("click", () => { go(+b.dataset.goto); if (b.classList.contains("btn-link")) $("#configurador").scrollIntoView({ behavior: "smooth" }); }));
$$(".seg button").forEach(b => b.addEventListener("click", () => { $$(".seg button").forEach(x => x.classList.toggle("on", x === b)); S.vista = b.dataset.view; updateResult(); }));

// fotos
const drop = $("#drop"), fin = $("#fotos"), msg = $("#dropMsg");
function addFiles(list) {
  let bad = "";
  for (const f of list) {
    if (S.fotos.length >= 5) { bad = "Máximo 5 fotos."; break; }
    if (!f.type.startsWith("image/")) { bad = `“${f.name}” no es una imagen (usa JPG o PNG).`; continue; }
    if (f.size > 10 * 1024 * 1024) { bad = `“${f.name}” pesa más de 10 MB. Prueba con otra foto.`; continue; }
    S.fotos.push({ name: f.name, url: URL.createObjectURL(f) });
  }
  drop.classList.toggle("is-err", !!bad); drop.classList.toggle("is-ok", !bad && S.fotos.length > 0);
  msg.className = "drop-msg " + (bad ? "err-t" : "ok-t");
  msg.textContent = bad || (S.fotos.length ? `${S.fotos.length} de 5 fotos subidas` : "");
  renderThumbs();
}
function renderThumbs() {
  $("#thumbs").innerHTML = S.fotos.map((f, i) => `<li class="th"><span class="th-img" style="${f.url ? `background-image:url('${f.url}')` : ""}"></span><span class="th-n">${f.name}</span><button type="button" class="th-x" data-rm="${i}" aria-label="Quitar foto"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>`).join("");
  $$("[data-rm]").forEach(b => b.onclick = () => { S.fotos.splice(+b.dataset.rm, 1); drop.classList.remove("is-err"); drop.classList.toggle("is-ok", S.fotos.length > 0); msg.textContent = S.fotos.length ? `${S.fotos.length} de 5 fotos subidas` : ""; renderThumbs(); });
}
fin.addEventListener("change", () => addFiles(fin.files));
["dragenter", "dragover"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.add("over"); }));
["dragleave", "drop"].forEach(e => drop.addEventListener(e, ev => { ev.preventDefault(); drop.classList.remove("over"); }));
drop.addEventListener("drop", ev => addFiles(ev.dataTransfer.files));

// galería
$$(".chip").forEach(c => c.addEventListener("click", () => { $$(".chip").forEach(x => x.classList.toggle("on", x === c)); $$(".g-card").forEach(g => g.classList.toggle("hide", c.dataset.filter !== "all" && g.dataset.cat !== c.dataset.filter)); }));

// tema
$("#themeBtn").addEventListener("click", () => { const d = document.documentElement.classList.toggle("dark"); localStorage.setItem("cq-tema", d ? "oscuro" : "claro"); if (document.body.classList.contains("show-res")) updateResult(); updateSide(); });

/* ---------- agenda (horarios DE EJEMPLO) ---------- */
const modal = $("#agenda"); let agDay = 0, agSlot = null;
const SLOTS = ["9:00", "10:30", "12:00", "13:30", "16:00", "17:30"], OCUPADOS = [1, 4]; // EJEMPLO
function buildDays() {
  const out = [], d = new Date(); d.setHours(12);
  while (out.length < 6) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0) out.push(new Date(d)); }
  $("#days").innerHTML = out.map((x, i) => `<button type="button" class="day${i === agDay ? " on" : ""}" data-d="${i}" data-txt="${x.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}"><small>${x.toLocaleDateString("es-MX", { weekday: "short" })}</small><b>${x.getDate()}</b><small>${x.toLocaleDateString("es-MX", { month: "short" })}</small></button>`).join("");
  $$(".day").forEach(b => b.onclick = () => { agDay = +b.dataset.d; $$(".day").forEach(x => x.classList.toggle("on", x === b)); });
  $("#slots").innerHTML = SLOTS.map((t, i) => `<button type="button" class="slot${i === agSlot ? " on" : ""}" ${OCUPADOS.includes(i) ? "disabled title='Ocupado (ejemplo)'" : ""} data-s="${i}">${t}</button>`).join("");
  $$(".slot").forEach(b => b.onclick = () => { agSlot = +b.dataset.s; $$(".slot").forEach(x => x.classList.toggle("on", x === b)); });
}
function openAgenda() { buildDays(); modal.hidden = false; $("#agForm").hidden = false; $("#agOk").hidden = true; setTimeout(() => $(".modal-x").focus(), 50); }
function closeAgenda() { modal.hidden = true; }
$$("[data-open=agenda]").forEach(b => b.addEventListener("click", openAgenda));
$$("[data-close]").forEach(b => b.addEventListener("click", closeAgenda));
document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeAgenda(); });
$("#agSend").addEventListener("click", () => {
  const n = $("#agNombre"), t = $("#agTel"), okN = n.value.trim().length > 1, okT = t.value.replace(/\D/g, "").length === 10;
  n.closest(".field").classList.toggle("is-err", !okN); t.closest(".field").classList.toggle("is-err", !okT);
  if (!okN || !okT || agSlot === null) { if (agSlot === null) $("#slots").animate([{ transform: "translateX(-4px)" }, { transform: "translateX(4px)" }, { transform: "none" }], 300); return; }
  const b = $("#agSend"); b.classList.add("is-load"); b.textContent = "Enviando…";
  setTimeout(() => { b.classList.remove("is-load"); b.textContent = "Confirmar cita"; agSuccess(n.value.trim()); }, 800);
});
function agSuccess(name) {
  const day = $(`.day[data-d="${agDay}"]`).dataset.txt;
  $("#agOkTxt").innerHTML = `${name.split(" ")[0]}, tu asesor te visitará el <b>${day}</b> a las <b>${SLOTS[agSlot]}</b> para medir tu espacio.`;
  $("#agForm").hidden = true; $("#agOk").hidden = false;
}

/* ---------- inicio + parámetros de demostración ----------
   ?demo=1 llena el configurador con datos de ejemplo · ?paso=1..5 · ?vista=frontal
   ?tipo=isla · ?agenda=1 | ?agenda=ok · ?modo=wireframe · ?tema=oscuro            */
if (q.get("demo")) {
  Object.assign(S, { tipo: q.get("tipo") || "escuadra", cubierta: q.get("cubierta") || "cuarzo", herraje: q.get("herraje") || "lento", alcance: q.get("alcance") || "ambas", acabado: q.get("acabado") || "brillo", largo: 3.6, ancho: 2.4, alto: 2.4, max: LAST });
  (q.get("extras") ?? "led,salpi").split(",").filter(Boolean).forEach(v => { const i = $(`input[name=extra][value=${v}]`); if (i) i.checked = true; });
  (q.get("acc") ?? "basurero").split(",").filter(Boolean).forEach(v => { const i = $(`input[name=acc][value=${v}]`); if (i) i.checked = true; });
  if (q.get("paso") !== "vacio") {
    $("#largo").value = "3.60"; $("#ancho").value = "2.40"; $("#alto").value = "2.40";
    $("#notas").value = "Quiero espacio para refrigerador de 90 cm. (ejemplo)";
    S.fotos = [{ name: "foto-cocina-ejemplo.jpg", url: "" }]; renderThumbs(); drop.classList.add("is-ok"); msg.className = "drop-msg ok-t"; msg.textContent = "1 de 5 fotos subidas (ejemplo)";
  }
  GROUPS.forEach(g => { const i = $(`input[name=${g}][value=${S[g]}]`); if (i) i.checked = true; });
  if (q.get("vista") === "frontal") { S.vista = "front"; $$(".seg button").forEach(x => x.classList.toggle("on", x.dataset.view === "front")); }
  syncExtras(); showResult(false);
}
if (q.get("paso") === "vacio") { // pasos con error de validación para la captura
  Object.assign(S, { largo: 35, ancho: null, alto: 2.4 }); $("#largo").value = "35"; $("#alto").value = "2.40"; $("#largo").closest(".field").classList.add("is-err");
  document.body.classList.remove("show-res"); $("#sideNote").textContent = "El precio aparece al terminar los 6 pasos."; S.fotos = []; renderThumbs(); drop.classList.add("is-err"); msg.className = "drop-msg err-t"; msg.textContent = "“plano.pdf” no es una imagen (usa JPG o PNG). (ejemplo)";
}
go(Math.max(0, Math.min(LAST, (parseInt(q.get("paso")) || (q.get("paso") === "vacio" ? LAST + 1 : 1)) - 1)));
if (q.get("info")) { const b = $$(".step.on .opt-i")[+q.get("info") - 1]; if (b) b.classList.add("open"); }
updateSide(); waLinks();
let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => document.body.classList.contains("show-res") && updateResult(), 150); });
if (q.get("agenda")) { openAgenda(); if (q.get("agenda") === "ok") { agDay = 2; agSlot = 2; buildDays(); $("#agNombre").value = "Ana López (ejemplo)"; agSuccess("Ana"); } else if (q.get("agenda") === "lleno") { agSlot = 2; buildDays(); $("#agNombre").value = "Ana López (ejemplo)"; $("#agTel").value = "33 0000 0000 (ejemplo)"; $("#agCol").value = "Col. Centro (ejemplo)"; } }
