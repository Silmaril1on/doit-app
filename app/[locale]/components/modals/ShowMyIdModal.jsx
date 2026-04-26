"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/app/[locale]/lib/features/userSlice";
import { selectModal } from "@/app/[locale]/lib/features/modalSlice";
import { useModal } from "@/app/[locale]/lib/hooks/useModal";
import GlobalModal from "./GlobalModal";
import Image from "next/image";

export const SHOW_MY_ID_MODAL = "showMyId";

const ShowMyIdModal = () => {
  const { modalType } = useSelector(selectModal);
  const isOpen = modalType === SHOW_MY_ID_MODAL;
  const { close } = useModal();
  const user = useSelector(selectCurrentUser);

  const [qrUrl, setQrUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  // Track the user ID we generated for, so reopening is instant
  const generatedForRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !user?.id) return;

    // Already have a QR for this user — nothing to do
    if (generatedForRef.current === user.id && qrUrl) return;

    setError(null);

    const init = async () => {
      setIsGenerating(true);
      try {
        // 1. Check if a QR is already stored for this user
        const res = await fetch("/api/user/profile/single-profile");
        if (res.ok) {
          const { profile } = await res.json();
          if (profile?.qr_image) {
            setQrUrl(profile.qr_image);
            generatedForRef.current = user.id;
            return;
          }
        }

        // 2. Nothing stored — generate, show instantly, then upload
        await generateAndUpload();
      } catch {
        setError("Failed to load QR code.");
      } finally {
        setIsGenerating(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const generateAndUpload = async () => {
    const username = user?.display_name;
    if (!username) return;

    const { default: QRCodeStyling } = await import("qr-code-styling");

    const qr = new QRCodeStyling({
      width: 300,
      height: 300,
      type: "canvas",
      data: `https://www.listory.us/${username}`,
      image: "/assets/qr-logo.jpg",
      dotsOptions: { color: "#000000", type: "dots" },
      backgroundOptions: { color: "#ffffff" },
      cornersSquareOptions: { color: "#000000", type: "extra-rounded" },
      cornersDotOptions: { color: "#000000", type: "square" },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 2,
        imageSize: 0.42,
      },
      qrOptions: { errorCorrectionLevel: "H" },
    });

    const blob = await qr.getRawData("png");

    // Show immediately with a local blob URL
    const localUrl = URL.createObjectURL(blob);
    setQrUrl(localUrl);

    // Upload in the background
    const formData = new FormData();
    formData.append("image", blob, "qr.png");

    const uploadRes = await fetch("/api/qr-code-id", {
      method: "POST",
      body: formData,
    });

    if (uploadRes.ok) {
      const { url } = await uploadRes.json();
      URL.revokeObjectURL(localUrl);
      setQrUrl(url);
    }

    generatedForRef.current = user.id;
  };

  return (
    <GlobalModal
      isOpen={isOpen}
      onClose={close}
      title="My ID"
      maxWidth="max-w-sm"
      footerMode="none"
      isLoading={isGenerating}
      error={error}
    >
      <div className="flex flex-col items-center gap-4 pt-4">
        {qrUrl && (
          <div className="rounded-xl overflow-hidden border border-white/10 bg-white p-3">
            <Image
              src={qrUrl}
              alt="My QR code"
              width={260}
              height={260}
              unoptimized
            />
          </div>
        )}
        <p className="secondary text-xs text-chino/60 text-center leading-relaxed">
          Share this code so others can visit{" "}
          <span className="text-primary font-semibold">Your Profile</span>
        </p>
      </div>
    </GlobalModal>
  );
};

export default ShowMyIdModal;
