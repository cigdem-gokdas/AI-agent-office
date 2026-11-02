// Original vector portrait, authored for this interface; no external artwork.
export function FairyPortrait({ color }: { color: string }) {
  return <svg width="150" height="155" viewBox="0 0 180 190" fill="none" aria-hidden="true">
    <g stroke={color} strokeWidth=".8">
      <path d="M86 97C45 88 16 38 31 25c16-8 48 29 55 72Z" fill={color} fillOpacity=".2" />
      <path d="M94 97c41-9 70-59 55-72-16-8-48 29-55 72Z" fill={color} fillOpacity=".2" />
      <path d="M85 101c-33-7-62 6-51 24 9 15 40 2 51-24Zm10 0c33-7 62 6 51 24-9 15-40 2-51-24Z" fill={color} fillOpacity=".3" />
      <path d="m86 97-55-72m55 72-34-57m42 57 55-72M94 97l34-57M84 102l-45 17m57-17 45 17" />
    </g>
    <path d="M88 72c-16 9-15 28-19 40-5 15-18 34-23 43 28 16 60 16 88 0-14-21-25-44-31-64-3-10-8-19-15-19Z" fill={color} />
    <path d="M89 88c-1 20-5 48-20 73 9 5 19 6 28 5 2-28-1-57-8-78Z" fill="#fff1d4" fillOpacity=".45" />
    <path d="M101 94c14 19 22 38 33 61-10 6-23 10-37 11 10-30 5-47 4-72Z" fill="#755666" fillOpacity=".35" />
    <path d="m78 85-17 25-15-2m56-23 17 20 13-7" stroke="#d1a790" strokeWidth="5" strokeLinecap="round" />
    <path d="m79 164-1 17m23-17 3 14" stroke="#d1a790" strokeWidth="4" strokeLinecap="round" />
    <ellipse cx="90" cy="61" rx="12" ry="16" fill="#e1bca3" />
    <path d="M78 64c-9-21 14-37 26-19 6 10 0 22 1 33-9-4-6-22-9-26-6 8-13 10-18 12Z" fill="#755443" />
    <path d="M77 50c-10 10-7 25-14 34 19-2 19-13 18-23" fill="#755443" />
    <path d="m81 64 3 1m11-1 3-1" stroke="#614646" strokeWidth="1.4" strokeLinecap="round" />
    <path d="m79 47 11-6 12 7" stroke="#e6c48b" strokeWidth="2" />
    <circle cx="90" cy="42" r="4" fill={color} /><circle cx="89" cy="41" r="1.5" fill="#fff1d4" />
    <g fill={color}><circle cx="28" cy="81" r="1.7" /><circle cx="148" cy="142" r="2" /><circle cx="50" cy="149" r="1.3" /><path d="m137 67 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" /></g>
  </svg>;
}
