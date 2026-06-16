"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Upload, Link as LinkIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { uploadProductImage } from "@/app/actions/admin/products";

const MIN_IMAGES = 2;
const MAX_IMAGES = 5;

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  error?: string;
};

export const ImageManager = ({ images, onChange, error }: Props) => {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const isFull = images.length >= MAX_IMAGES;

  const addImage = (url: string) => {
    if (images.includes(url)) {
      toast.error("This image was already added");
      return;
    }
    onChange([...images, url]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isFull) {
      toast.error(`You can only add up to ${MAX_IMAGES} images`);
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadProductImage(fd);
    setIsUploading(false);
    e.target.value = "";

    if (result.success) {
      addImage(result.data.url);
    } else {
      toast.error(`Upload failed: ${result.error}`);
    }
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;

    if (isFull) {
      toast.error(`You can only add up to ${MAX_IMAGES} images`);
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("Enter a valid image URL");
      return;
    }

    addImage(url);
    setUrlInput("");
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((url, i) => (
            <div
              key={url + i}
              className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 group"
            >
              <Image
                src={url}
                alt={`Product image ${i + 1}`}
                fill
                sizes="(max-width: 640px) 18vw, 120px"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={11} />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-400">
        {images.length}/{MAX_IMAGES} images · minimum {MIN_IMAGES} required
      </p>

      {!isFull && (
        <div className="space-y-3">
          <label
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${
              isUploading
                ? "opacity-50 pointer-events-none border-neutral-200"
                : "border-neutral-200 hover:border-black"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="sr-only"
            />
            <Upload size={16} className="text-neutral-400" />
            <span className="text-sm text-neutral-500">
              {isUploading ? "Uploading..." : "Upload image"}
            </span>
            <span className="text-xs text-neutral-400">
              PNG, JPG, WEBP · up to 10 MB
            </span>
          </label>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <LinkIcon
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-neutral-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 placeholder:text-neutral-300"
              />
            </div>
            <button
              type="button"
              onClick={handleAddUrl}
              className="flex items-center gap-1 text-xs font-medium border border-neutral-200 rounded-lg px-3 py-2.5 hover:border-black transition-colors shrink-0"
            >
              <Plus size={13} />
              Add URL
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
