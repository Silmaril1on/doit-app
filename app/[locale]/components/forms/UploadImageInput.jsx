"use client";

import { useEffect, useRef, useState } from "react";
import { FaUser } from "react-icons/fa";
import { MdOutlineAddAPhoto } from "react-icons/md";
import NextImage from "next/image";

const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
const COMPRESS_THRESHOLD = 200 * 1024; // 200KB

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);

      let quality = 0.85;

      const attempt = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Compression failed"));

            if (blob.size <= COMPRESS_THRESHOLD || quality <= 0.1) {
              resolve(
                new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                  type: "image/jpeg",
                }),
              );
            } else {
              quality = parseFloat((quality - 0.1).toFixed(1));
              attempt();
            }
          },
          "image/jpeg",
          quality,
        );
      };

      attempt();
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });

const UploadImageInput = ({ value, onChange, disabled = false }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > MAX_SIZE_BYTES) {
      setError("Image must be under 1MB.");
      e.target.value = "";
      return;
    }

    setProcessing(true);

    try {
      const processed =
        file.size > COMPRESS_THRESHOLD ? await compressImage(file) : file;

      const previewUrl = URL.createObjectURL(processed);
      setPreview(previewUrl);
      onChange?.(processed);
    } catch {
      setError("Failed to process image.");
    } finally {
      setProcessing(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label>Profile Picture</label>
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={disabled || processing}
          onClick={() => inputRef.current?.click()}
          className="w-20 h-20 rounded-md shrink-0 overflow-hidden relative group cursor-pointer border border-teal-500/30 bg-black/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {preview ? (
            <NextImage
              src={preview}
              alt="Avatar"
              fill
              sizes="80px"
              unoptimized={preview.startsWith("blob:")}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaUser size={28} className="text-teal-500/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 duration-200 flex items-center justify-center">
            <MdOutlineAddAPhoto size={20} className="text-cream" />
          </div>
        </button>

        <div className="flex flex-col  *:leading-none">
          <button
            type="button"
            disabled={disabled || processing}
            onClick={() => inputRef.current?.click()}
            className="text-teal-400  text-xl font-bold hover:text-teal-300 duration-200 cursor-pointer disabled:opacity-50 text-left"
          >
            {processing
              ? "Processing…"
              : preview
                ? "Change photo"
                : "Upload photo"}
          </button>
          <p className="text-chino text-[10px] secondary">
            Max 1MB · Auto-compressed if over 200KB
          </p>
          {error && (
            <p className="text-red-400 text-[10px] secondary">{error}</p>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled || processing}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default UploadImageInput;
