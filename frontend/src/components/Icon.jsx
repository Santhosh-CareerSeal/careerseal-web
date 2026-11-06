// Inline SVG icons (Tabler, MIT-licensed) — replaces the external webfont CDN.
// Only the icons actually used are bundled. Sizes with font-size (1em) and
// inherits text color (currentColor), so existing text-* utility classes work.
const ICONS = {
  'bulb': ['M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7', 'M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3', 'M9.7 17l4.6 0'],
  'award': ['M6 9a6 6 0 1 0 12 0a6 6 0 1 0 -12 0', 'M12 15l3.4 5.89l1.598 -3.233l3.598 .232l-3.4 -5.889', 'M6.802 12l-3.4 5.89l3.598 -.233l1.598 3.232l3.4 -5.889'],
  'arrow-right': ['M5 12l14 0', 'M13 18l6 -6', 'M13 6l6 6'],
  'trending-up': ['M3 17l6 -6l4 4l8 -8', 'M14 7l7 0l0 7'],
  'briefcase': ['M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9', 'M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2', 'M12 12l0 .01', 'M3 13a20 20 0 0 0 18 0'],
  'chart-bar': ['M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -6', 'M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -10', 'M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1l0 -14', 'M4 20h14'],
  'certificate': ['M12 15a3 3 0 1 0 6 0a3 3 0 1 0 -6 0', 'M13 17.5v4.5l2 -1.5l2 1.5v-4.5', 'M10 19h-5a2 2 0 0 1 -2 -2v-10c0 -1.1 .9 -2 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -1 1.73', 'M6 9l12 0', 'M6 12l3 0', 'M6 15l2 0'],
  'route': ['M3 19a2 2 0 1 0 4 0a2 2 0 0 0 -4 0', 'M19 7a2 2 0 1 0 0 -4a2 2 0 0 0 0 4', 'M11 19h5.5a3.5 3.5 0 0 0 0 -7h-8a3.5 3.5 0 0 1 0 -7h4.5'],
  'calendar-event': ['M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12', 'M16 3l0 4', 'M8 3l0 4', 'M4 11l16 0', 'M8 15h2v2h-2l0 -2'],
}

function Icon({ name, className = '', ...props }) {
  const paths = ICONS[name] || []
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`inline-block ${className}`} aria-hidden="true" {...props}
    >
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

export default Icon
