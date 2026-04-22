"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";

const DOT_STYLES = [
  { id: "square", label: "Square" },
  { id: "dots", label: "Dots" },
  { id: "rounded", label: "Rounded" },
  { id: "extra-rounded", label: "Extra Rounded" },
  { id: "classy", label: "Classy" },
  { id: "classy-rounded", label: "Classy Rounded" },
];

const CORNER_SQUARE_STYLES = [
  { id: "square", label: "Square" },
  { id: "extra-rounded", label: "Rounded" },
  { id: "dot", label: "Dot" },
];

const CORNER_DOT_STYLES = [
  { id: "square", label: "Square" },
  { id: "dot", label: "Dot" },
];

const DEFAULT = {
  data: "https://listory.us",
  dotStyle: "square",
  cornerSquareStyle: "square",
  cornerDotStyle: "square",
  dotColor: "#000000",
  bgColor: "#ffffff",
  cornerColor: "#000000",
  logoUrl: "",
  logoSize: 0.42,
  logoMargin: 2,
  size: 300,
};

const StyleButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded text-sm font-medium transition-all cursor-pointer ${
      active
        ? "bg-yellow text-black"
        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
    }`}
  >
    {children}
  </button>
);

const ColorInput = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-white/60 text-sm">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-white/40 text-xs font-mono uppercase">{value}</span>
      <label className="relative w-8 h-8 rounded overflow-hidden cursor-pointer border border-white/10">
        <div className="w-full h-full" style={{ background: value }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </label>
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="space-y-2">
    <p className="text-white/40 text-xs uppercase tracking-widest">{title}</p>
    {children}
  </div>
);

const HomePage = () => {
  const qrRef = useRef(null);
  const qrInstance = useRef(null);
  const logoFileRef = useRef(null);
  const [cfg, setCfg] = useState(DEFAULT);
  const [logoPreview, setLogoPreview] = useState(null);

  const update = (key, value) => setCfg((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    let active = true;

    async function buildQR() {
      const { default: QRCodeStyling } = await import("qr-code-styling");
      if (!active || !qrRef.current) return;

      const options = {
        width: cfg.size,
        height: cfg.size,
        type: "svg",
        data: cfg.data || "https://listory.us",
        image: cfg.logoUrl || undefined,
        dotsOptions: { color: cfg.dotColor, type: cfg.dotStyle },
        backgroundOptions: { color: cfg.bgColor },
        cornersSquareOptions: {
          color: cfg.cornerColor,
          type: cfg.cornerSquareStyle,
        },
        cornersDotOptions: { color: cfg.cornerColor, type: cfg.cornerDotStyle },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: cfg.logoMargin,
          imageSize: cfg.logoSize,
        },
        qrOptions: { errorCorrectionLevel: "H" },
      };

      if (!qrInstance.current) {
        const instance = new QRCodeStyling(options);
        qrRef.current.innerHTML = "";
        instance.append(qrRef.current);
        qrInstance.current = instance;
      } else {
        qrInstance.current.update(options);
      }
    }

    buildQR();
    return () => {
      active = false;
    };
  }, [cfg]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
    update("logoUrl", url);
  };

  const removeLogo = () => {
    setLogoPreview(null);
    update("logoUrl", "");
    if (logoFileRef.current) logoFileRef.current.value = "";
  };

  const download = (ext) =>
    qrInstance.current?.download({ extension: ext, name: "qr-code" });

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col items-center py-14 px-4">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="text-yellow">QR</span> Generator
        </h1>
        <p className="text-white/40 mt-2 text-sm">Style • Brand • Download</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-5xl">
        {/* ── Controls ───────────────────────────────────── */}
        <div className="flex-1 space-y-7 bg-white/3 border border-white/7 rounded-2xl p-6">
          {/* URL */}
          <Section title="Destination URL">
            <input
              type="url"
              value={cfg.data}
              onChange={(e) => update("data", e.target.value)}
              placeholder="https://listory.us"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-yellow/50 transition"
            />
          </Section>

          {/* Dot style */}
          <Section title="Dot Style">
            <div className="flex flex-wrap gap-2">
              {DOT_STYLES.map((s) => (
                <StyleButton
                  key={s.id}
                  active={cfg.dotStyle === s.id}
                  onClick={() => update("dotStyle", s.id)}
                >
                  {s.label}
                </StyleButton>
              ))}
            </div>
          </Section>

          {/* Corner square style */}
          <Section title="Corner Frame Style">
            <div className="flex flex-wrap gap-2">
              {CORNER_SQUARE_STYLES.map((s) => (
                <StyleButton
                  key={s.id}
                  active={cfg.cornerSquareStyle === s.id}
                  onClick={() => update("cornerSquareStyle", s.id)}
                >
                  {s.label}
                </StyleButton>
              ))}
            </div>
          </Section>

          {/* Corner dot style */}
          <Section title="Corner Dot Style">
            <div className="flex flex-wrap gap-2">
              {CORNER_DOT_STYLES.map((s) => (
                <StyleButton
                  key={s.id}
                  active={cfg.cornerDotStyle === s.id}
                  onClick={() => update("cornerDotStyle", s.id)}
                >
                  {s.label}
                </StyleButton>
              ))}
            </div>
          </Section>

          {/* Colors */}
          <Section title="Colors">
            <div className="space-y-3 bg-white/3 rounded-xl p-4 border border-white/6">
              <ColorInput
                label="Dot Color"
                value={cfg.dotColor}
                onChange={(v) => update("dotColor", v)}
              />
              <ColorInput
                label="Corner Color"
                value={cfg.cornerColor}
                onChange={(v) => update("cornerColor", v)}
              />
              <ColorInput
                label="Background"
                value={cfg.bgColor}
                onChange={(v) => update("bgColor", v)}
              />
            </div>
          </Section>

          {/* Logo */}
          <Section title="Center Logo">
            {logoPreview ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                  <Image
                    src={logoPreview}
                    alt="logo"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/60 truncate">
                    Logo uploaded
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="text-xs text-yellow cursor-pointer hover:underline">
                      Change
                      <input
                        ref={logoFileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-white/20">·</span>
                    <button
                      onClick={removeLogo}
                      className="text-xs text-white/40 hover:text-white/70 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-3 border border-dashed border-white/10 rounded-xl py-4 px-4 cursor-pointer hover:border-yellow/30 hover:bg-yellow/3 transition group">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-yellow/10 transition">
                  <span className="text-white/40 text-lg leading-none">+</span>
                </div>
                <span className="text-white/40 text-sm group-hover:text-white/60">
                  Upload logo image
                </span>
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            )}

            {cfg.logoUrl && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>Logo size</span>
                  <span>{Math.round(cfg.logoSize * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.15}
                  max={0.75}
                  step={0.01}
                  value={cfg.logoSize}
                  onChange={(e) =>
                    update("logoSize", parseFloat(e.target.value))
                  }
                  className="w-full accent-yellow"
                />

                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>Logo padding</span>
                  <span>{cfg.logoMargin}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={1}
                  value={cfg.logoMargin}
                  onChange={(e) =>
                    update("logoMargin", parseInt(e.target.value, 10))
                  }
                  className="w-full accent-yellow"
                />
              </div>
            )}
          </Section>

          {/* QR size */}
          <Section title="Output Size">
            <div className="flex items-center gap-4">
              {[200, 300, 400, 500].map((s) => (
                <StyleButton
                  key={s}
                  active={cfg.size === s}
                  onClick={() => update("size", s)}
                >
                  {s}px
                </StyleButton>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Preview ────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-6 lg:w-98">
          <div className="bg-white/3 border border-white/7 rounded-2xl p-6 flex flex-col items-center gap-4 w-full">
            <p className="text-white/40 text-xs uppercase tracking-widest self-start">
              Preview
            </p>
            <div
              ref={qrRef}
              className=" overflow-hidden"
              style={{ width: cfg.size, height: cfg.size, maxWidth: "100%" }}
            />
          </div>

          {/* Download */}
          <div className="w-full bg-white/3 border border-white/7 rounded-2xl p-4 space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-widest">
              Download
            </p>
            <div className="grid grid-cols-3 gap-2">
              {["svg", "png", "jpeg"].map((ext) => (
                <button
                  key={ext}
                  onClick={() => download(ext)}
                  className="py-2 rounded-lg bg-white/5 hover:bg-yellow/10 border border-white/7 hover:border-yellow/30 text-sm font-medium uppercase tracking-wide text-white/60 hover:text-yellow transition cursor-pointer"
                >
                  {ext}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
