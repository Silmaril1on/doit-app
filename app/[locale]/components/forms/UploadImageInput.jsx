"use client";
import { useEffect, useRef, useState } from "react";
import { MdOutlineAddAPhoto } from "react-icons/md";
import ImageTag from "../elements/ImageTag";
const UploadImageInput = ({
  value,
  onChange,
  disabled = false,
  label = "Profile Picture",
  maxSizeBytes = 1 * 1024 * 1024,
  compressTarget = 200 * 1024,
}) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(value || null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

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
              if (blob.size <= compressTarget || quality <= 0.1) {
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

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > maxSizeBytes) {
      setError(
        `Image must be under ${Math.round(maxSizeBytes / (1024 * 1024))}MB.`,
      );
      e.target.value = "";
      return;
    }

    setProcessing(true);

    try {
      const processed =
        file.size > compressTarget ? await compressImage(file) : file;
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
    <div className="flex flex-col gap-2">
      {label && <label>{label}</label>}
      <button
        type="button"
        disabled={disabled || processing}
        onClick={() => inputRef.current?.click()}
        className={`group relative p-2 ${preview ? "w-fit" : "w-full"} h-34 rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 duration-200 flex flex-col items-center justify-center gap-2 overflow-hidden cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {preview ? (
          <>
            <ImageTag
              width={120}
              height={120}
              src={preview}
              alt="Preview"
              className="object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 duration-200 flex flex-col items-center justify-center gap-1">
              <MdOutlineAddAPhoto size={24} className="text-cream" />
              <span className="secondary text-xs text-cream">Change photo</span>
            </div>
          </>
        ) : (
          <>
            <MdOutlineAddAPhoto size={26} className="text-primary/50" />
            <span className="secondary text-xs text-chino/60">
              {processing ? "Processing…" : "Upload cover photo"}
            </span>
            <span className="secondary text-[10px] text-chino/40">
              Max {Math.round(maxSizeBytes / (1024 * 1024))}MB · Auto-compressed
            </span>
          </>
        )}
      </button>
      {error && <p className="text-red-400 text-[10px] secondary">{error}</p>}

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
