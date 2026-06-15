import Image from "next/image";
import { ImageOff } from "lucide-react";

type ProductGalleryProps = {
  images: string[];
  name: string;
};

export const ProductGallery = ({ images, name }: ProductGalleryProps) => {
  if (!images || images.length === 0) {
    return (
      <div className="aspect-3/4 bg-secondary flex items-center justify-center text-muted-foreground">
        <ImageOff size={40} strokeWidth={1} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {images.map((src, i) => (
        <div key={src} className="relative aspect-3/4 w-full overflow-hidden bg-secondary">
          <Image
            src={src}
            alt={i === 0 ? name : `${name} — view ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
};
