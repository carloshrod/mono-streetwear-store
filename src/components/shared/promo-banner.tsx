const PROMO_TEXT = "FREE SHIPPING ON ORDERS OVER $250";
const SEPARATOR = "✦";
const REPEAT = 10;

const PromoTrack = () => (
  <>
    {Array.from({ length: REPEAT }, (_, i) => (
      <span key={i} className="flex items-center shrink-0">
        <span>{PROMO_TEXT}</span>
        <span className="text-white/30 px-6">{SEPARATOR}</span>
      </span>
    ))}
  </>
);

export const PromoBanner = () => (
  <div className="h-8 bg-black text-white overflow-hidden flex items-center">
    <div className="flex animate-marquee whitespace-nowrap text-[10px] font-semibold tracking-[0.2em] uppercase">
      <PromoTrack />
      <PromoTrack />
    </div>
  </div>
);
