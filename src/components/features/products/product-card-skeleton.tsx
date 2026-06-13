export const ProductCardSkeleton = () => (
  <div className="flex flex-col" aria-hidden>
    <div className="aspect-[3/4] bg-secondary animate-pulse" />
    <div className="flex flex-col gap-2 pt-3">
      <div className="h-2.5 w-16 bg-secondary animate-pulse" />
      <div className="h-3.5 w-3/4 bg-secondary animate-pulse" />
      <div className="h-3.5 w-12 bg-secondary animate-pulse" />
    </div>
  </div>
);
