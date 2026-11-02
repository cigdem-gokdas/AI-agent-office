// Original scenic horizon with atmospheric layers.
export function CinematicBackdrop() {
  return <div className="cinematic-world" aria-hidden="true">
    <picture className="cinematic-horizon"><source media="(max-width: 759px)" type="image/webp" srcSet={'/assets/art105/kingdom-mobile.webp'} /><source type="image/webp" srcSet={'/assets/art105/kingdom.webp'} /><img src="/assets/art105/kingdom.jpg" alt="" /></picture>
    <div className="cinematic-haze" /><div className="cinematic-rays" />
    <div className="cinematic-vignette" />
  </div>;
}
