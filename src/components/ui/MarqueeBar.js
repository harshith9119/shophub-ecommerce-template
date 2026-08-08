export default function MarqueeBar({ text, className = '' }) {
  const content = text || '🚚 Standard Shipping ₹150 on All Orders Across India';
  const repeated = `${content}   ✦   ${content}   ✦   ${content}   ✦   ${content}`;

  return (
    <div className={`overflow-hidden bg-emerald text-white py-2.5 ${className}`}>
      <div className="animate-marquee whitespace-nowrap flex">
        <span className="text-[10px] md:text-xs font-sans font-medium uppercase tracking-luxury px-4">
          {repeated}
        </span>
        <span className="text-[10px] md:text-xs font-sans font-medium uppercase tracking-luxury px-4" aria-hidden>
          {repeated}
        </span>
      </div>
    </div>
  );
}
