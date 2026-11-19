# Handoff — Precotización Domus Magna (base visual)

## Links
- Demo wireframe: https://oziel-creator.github.io/cq-cotizador-prueba/index.html?modo=wireframe&v=6
- Demo color: https://oziel-creator.github.io/cq-cotizador-prueba/index.html?v=6
- Repo: https://github.com/oziel-creator/cq-cotizador-prueba
- Esta carpeta: `/handoff/` en el repo (wireframe/, color/, kit/, site/)

## Tipografía
- Títulos: **Fraunces** (serif)
- UI / cuerpo: **Manrope** o **Inter**
- Fuentes embebidas en `site/fuentes/`

## Colores (tema claro)
- Fondo: hueso / off-white `#F7F3EE` (aprox.)
- Superficie: blanco
- Texto: carbón `#1A1A1A`
- Primario / botones: carbón
- Acento: dorado / madera roble-nogal
- Bordes: gris claro
- (Variables CSS en `site/styles.css`; modo oscuro con `?tema=oscuro`)

## Componentes
- Tarjetas de opción con icono SVG + título + descripción + botón (i)
- Stepper de 6 pasos
- Botones: primario (relleno), secundario (borde), CONTACTO / WhatsApp
- Sticky header; scroll al tope del paso al navegar
- Preview planta / frontal (SVG)

## Reglas de producto (cliente)
- Nunca mostrar precios unitarios ni costos de material/componentes
- Solo rango total estimado + lista de lo incluido
- WhatsApp de prueba actual: 81 2540 5806 (constante `WHATSAPP_VENTAS` en `app.js`)

## Marca actual
- **DOMUS MAGNA** / monograma **DM**
- Lema: Diseño de espacios que trascienden
- (Antes era Cocinas Quintana / CQ; si la app interna usa CQ, rebrand aparte)

## Archivos clave
- `site/index.html` + `styles.css` + `wireframe.css` + `app.js`
- `png/wireframe/` — pantallas grises actualizadas
- `png/kit/` — mini kit (puede estar desfasado respecto al último wireframe)
- `png/color/` — color anterior a varios cambios del gris; regenerar si lo necesitas
