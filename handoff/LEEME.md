# DOMUS MAGNA — Página de inicio con cotización preliminar (prototipo)

**Precios:** estimados de referencia de mercado (18-nov-2026, MXN, IVA incl.), NO oficiales; Ventas debe confirmarlos. Galería, testimonios, cifras y horarios son de ejemplo.

## Cómo abrirlo
Descomprime y abre `site/index.html` en el navegador (funciona sin internet).

- Wireframe gris: `site/index.html?modo=wireframe`
- Tema oscuro: `site/index.html?tema=oscuro` (o el botón de luna en el encabezado)
- Demo ya llenada: `site/index.html?demo=1` (agrega `&paso=1..5`, `&vista=frontal`, `&tipo=isla`, `&agenda=1`)
- Opciones con descripciones: `site/opciones.html` · Estados de componentes: `site/estados.html` · Mini kit: `site/kit.html` · Vista en celular: `site/marco-iphone.html`

## Qué cambiar antes de publicar
- `site/app.js` → `PRECIOS` (cada concepto con unidad ml, u o m2, mín. y máx.) y `SUPUESTOS` (conversión de metros lineales a piezas y áreas).
- Horarios de la agenda: `SLOTS` y `OCUPADOS` en `site/app.js` (la agenda no envía datos: es un prototipo).
- Ilustraciones de la galería → reemplazar por fotos/renders reales del taller.
- Logo provisional DM (DOMUS MAGNA — "Diseño de espacios que trascienden") → reemplazar por el oficial.

## Archivos
- `site/` página (index.html, styles.css, wireframe.css, app.js, fuentes/ Fraunces, Manrope, Inter — licencia SIL OFL).
- `png/wireframe`, `png/color`, `png/estados`, `png/kit` capturas.
- `gen.py` genera los HTML; `render.py` toma las capturas (Playwright).
