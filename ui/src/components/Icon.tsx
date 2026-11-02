import type { CSSProperties } from 'react';
export type IconName = 'leaf' | 'spark' | 'grid' | 'shield' | 'inbox' | 'book' | 'arrow' | 'refresh' | 'lock' | 'clock' | 'moon' | 'eye' | 'plus' | 'minus' | 'check' | 'chevron' | 'activity' | 'close';
const paths: Record<IconName, string> = {
  leaf: 'M5 19C2 9 9 3 20 3c0 11-6 18-15 16Zm0 0L16 7M9 14l-1-5m5 1 5 1',
  spark: 'm12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2Z',
  grid: 'M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z',
  shield: 'M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6L12 2Zm-5 10 3 3 7-7',
  inbox: 'M4 4h16l2 13v3H2v-3L4 4ZM3 14h5l2 3h4l2-3h5',
  book: 'M12 5c-4-3-8-2-10-1v15c4-2 7-2 10 0m0-14c4-3 8-2 10-1v15c-4-2-7-2-10 0V5Z',
  arrow: 'M4 12h16m-6-6 6 6-6 6', refresh: 'M20 8a8 8 0 1 0 0 8M20 3v5h-5',
  lock: 'M6 10h12v11H6Zm2 0V6a4 4 0 0 1 8 0v4m-4 5v2',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v6l4 2',
  moon: 'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  plus: 'M12 4v16M4 12h16', minus: 'M4 12h16', check: 'm4 12 5 5L20 6',
  chevron: 'm9 5 7 7-7 7', activity: 'M2 13h5l3-9 4 16 3-7h5', close: 'm5 5 14 14M5 19 19 5',
};
export function Icon({ name, size = 18, style, className = '' }: { name: IconName; size?: number; style?: CSSProperties; className?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style} className={className}><path d={paths[name]} /></svg>;
}
export function FairyMark({ size = 38 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M23 26C7 25 3 9 12 7c8-1 11 11 12 17C25 10 34 1 40 8c5 8-5 17-15 19 15 0 17 10 9 12-7 0-9-9-10-11-3 10-12 15-16 9-2-5 6-10 15-11Z" fill="currentColor" opacity=".85"/><path d="M23 17v23M23 18l-5-6m5 6 5-6" stroke="currentColor" strokeWidth="1.4"/><circle cx="23" cy="17" r="2.2" fill="currentColor"/></svg>;
}
