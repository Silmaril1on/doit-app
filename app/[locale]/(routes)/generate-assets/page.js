"use client";

import { useState } from "react";
import {
  IoSparklesOutline,
  IoDownloadOutline,
  IoImageOutline,
} from "react-icons/io5";
import Button from "@/app/[locale]/components/buttons/Button";
import UploadImageInput from "@/app/[locale]/components/forms/UploadImageInput";
import SectionHeadline from "../../components/elements/SectionHeadline";

const MODES = [
  {
    id: "t2i",
    label: "Text → Image",
    desc: "Generate from prompt only",
    maxImages: 0,
  },
  {
    id: "i2i",
    label: "Image + Prompt",
    desc: "Edit or restyle an image",
    maxImages: 1,
  },
  {
    id: "multi",
    label: "Multi-Reference",
    desc: "Combine up to 2 reference images",
    maxImages: 2,
  },
];

const SIZES = [
  { label: "1:1 (Square)", value: "1024x1024" },
  { label: "16:9 (Landscape)", value: "1280x720" },
  { label: "9:16 (Portrait)", value: "720x1280" },
  { label: "4:3", value: "1024x768" },
  { label: "3:4", value: "768x1024" },
  { label: "2K", value: "2k" },
  { label: "4K", value: "4k" },
];

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function GenerateAssetsPage() {
  const [mode, setMode] = useState("t2i");
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [watermark, setWatermark] = useState(false);
  const [imageFile1, setImageFile1] = useState(null);
  const [imageFile2, setImageFile2] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [usage, setUsage] = useState(null);
  const [sessionTokens, setSessionTokens] = useState(0);
  const [error, setError] = useState(null);

  const currentMode = MODES.find((m) => m.id === mode);

  const handleModeChange = (id) => {
    setMode(id);
    setImageFile1(null);
    setImageFile2(null);
    setError(null);
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const images = [];
      if (imageFile1) images.push(await fileToBase64(imageFile1));
      if (imageFile2) images.push(await fileToBase64(imageFile2));

      const res = await fetch("/api/create-media/create-badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size, watermark, images }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setResult({ url: data.url });
      if (data.usage) {
        setUsage(data.usage);
        setSessionTokens((prev) => prev + (data.usage.total_tokens ?? 0));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const download = () => {
    if (!result?.url) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `seedream-${Date.now()}.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-black text-cream pb-28">
      <div className="max-w-5xl bg-teal-700/40 mx-auto p-5 rounded-lg flex  space-x-5">
        <div className="space-y-4 w-2/4">
          <SectionHeadline
            title="Image Generator"
            subtitle="Seedream 4.0 · BytePlus"
          />
          {/* Token usage */}
          <div className="flex gap-3 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3">
            <div className="flex-1">
              <p className="text-[10px] secondary text-chino/40 uppercase tracking-wide">
                Last generation
              </p>
              <p className="text-sm font-semibold text-teal-400">
                {usage?.total_tokens ?? 0}{" "}
                <span className="text-xs font-normal text-chino/50">
                  tokens
                </span>
              </p>
            </div>
            <div className="w-px bg-teal-500/15" />
            <div className="flex-1">
              <p className="text-[10px] secondary text-chino/40 uppercase tracking-wide">
                Session total
              </p>
              <p className="text-sm font-semibold text-cream">
                {sessionTokens}{" "}
                <span className="text-xs font-normal text-chino/50">
                  tokens
                </span>
              </p>
            </div>
          </div>

          {/* Mode selector */}
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => (
              <Button
                key={m.id}
                text={m.label}
                variant={mode === m.id ? "fill" : "outline"}
                size="sm"
                onClick={() => handleModeChange(m.id)}
              />
            ))}
          </div>

          {/* Image upload — key forces remount/reset when mode changes */}
          {currentMode.maxImages >= 1 && (
            <UploadImageInput
              key={`img1-${mode}`}
              label="Reference Image 1"
              onChange={setImageFile1}
              maxSizeBytes={5 * 1024 * 1024}
            />
          )}
          {currentMode.maxImages >= 2 && (
            <UploadImageInput
              key={`img2-${mode}`}
              label="Reference Image 2"
              onChange={setImageFile2}
              maxSizeBytes={5 * 1024 * 1024}
            />
          )}

          {/* Prompt */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] secondary text-chino/40 uppercase tracking-wide">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                mode === "i2i"
                  ? "Describe how to transform the image..."
                  : mode === "multi"
                    ? "Describe what to generate using the reference images..."
                    : "Describe the image you want to generate..."
              }
              rows={5}
            />
          </div>

          {/* Settings */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-[10px] secondary text-chino/40 uppercase tracking-wide mb-1.5 block">
                Size
              </label>
              <select
                className="appearance-none"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              >
                {SIZES.map(({ label, value }) => (
                  <option className="text-black" key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] secondary text-chino/40 uppercase tracking-wide">
                Watermark
              </label>
              <Button
                text={watermark ? "On" : "Off"}
                variant={watermark ? "fill" : "outline"}
                size="sm"
                onClick={() => setWatermark((w) => !w)}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs secondary text-red-400 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Generate */}
          <Button
            text={isGenerating ? "Generating…" : "Generate"}
            icon={<IoSparklesOutline size={16} />}
            loading={isGenerating}
            disabled={!prompt.trim()}
            onClick={generate}
            variant="fill"
          />
        </div>

        {/* Result */}
        {result?.url && (
          <div className="rounded-xl w-2/4 border border-teal-500/20 overflow-hidden">
            <div className="relative bg-black/40">
              <IoImageOutline
                size={40}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-teal-500/20"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.url}
                alt="Generated"
                className="w-full relative z-10"
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-teal-500/15 bg-black/60">
              <p className="text-xs secondary text-chino/40">
                Seedream 4.0 ·{" "}
                {SIZES.find((s) => s.value === size)?.label ?? size}
              </p>
              <Button
                text="Download"
                icon={<IoDownloadOutline size={14} />}
                variant="outline"
                size="sm"
                onClick={download}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
