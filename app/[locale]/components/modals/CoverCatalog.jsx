"use client";

import { useState } from "react";
import Button from "@/app/[locale]/components/buttons/Button";
import ImageTag from "@/app/[locale]/components/elements/ImageTag";
import GlobalModal from "@/app/[locale]/components/modals/GlobalModal";

const COVER_CATALOG = [
  "/assets/covers/01.jpg",
  "/assets/covers/02.webp",
  "/assets/covers/03.jpg",
  "/assets/covers/04.jpg",
  "/assets/covers/05.jpg",
  "/assets/covers/06.jpg",
  "/assets/covers/07.jpg",
  "/assets/covers/08.jpg",
  "/assets/covers/09.jpg",
  "/assets/covers/10.jpg",
];

const CoverCatalog = ({ selected, onSelect, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (url) => {
    onSelect?.(selected === url ? null : url);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="secondary text-[10px] uppercase tracking-widest text-primary/60">
          Cover Photo
          <span className="normal-case text-chino/40">
            {" "}
            - Choose from catalog
          </span>
        </p>
        <Button
          text="SET WALLPAPER"
          size="sm"
          variant="outline"
          onClick={() => setIsOpen(true)}
          disabled={disabled}
        />
      </div>

      {selected ? (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative h-10 w-16 overflow-hidden rounded-md border border-primary/25">
            <ImageTag
              src={selected}
              alt="Selected cover"
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <p className="secondary text-[10px] text-chino/60">
            Wallpaper selected
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect?.(null)}
            className="secondary text-[10px] text-primary/70 hover:text-primary"
          >
            Clear
          </button>
        </div>
      ) : (
        <p className="secondary text-[10px] text-chino/40">
          No wallpaper selected
        </p>
      )}

      <GlobalModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Wallpaper Catalog"
        maxWidth="max-w-4xl"
        footerMode="close"
        submitLabel="Done"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {COVER_CATALOG.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => handleToggle(url)}
              className={`relative aspect-video overflow-hidden rounded-md border-2 transition-all duration-200 ${
                selected === url
                  ? "border-primary shadow-[0_0_8px_rgba(200,168,75,0.5)]"
                  : "border-primary/15 hover:border-primary/50"
              }`}
            >
              <ImageTag
                src={url}
                alt="cover"
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover"
              />
              {selected === url && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-lg font-bold drop-shadow">
                    ✓
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </GlobalModal>
    </div>
  );
};

export default CoverCatalog;
