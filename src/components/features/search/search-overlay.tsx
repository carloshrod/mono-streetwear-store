"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchOverlayProps {
  onClose: () => void;
}

export const SearchOverlay = ({ onClose }: SearchOverlayProps) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = new FormData(e.currentTarget).get("q") as string;
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm flex items-start justify-center px-6 pt-32"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="relative">
          <Search
            size={20}
            strokeWidth={1.25}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden
          />
          <input
            ref={inputRef}
            name="q"
            type="search"
            placeholder="Search products…"
            autoComplete="off"
            className="w-full pl-12 pr-14 py-4 text-lg bg-transparent border border-border focus:outline-none focus:border-foreground transition-colors placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-8 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </form>
        <p className="mt-3 text-label text-muted-foreground">
          Press Enter to search · Esc to close
        </p>
      </div>
    </div>
  );
};
