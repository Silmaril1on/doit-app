"use client";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { selectModal } from "@/app/[locale]/lib/features/modalSlice";

// Dynamic imports — each modal's code is loaded only when first rendered.
// ssr: false because all modals rely on client APIs (Redux, DOM, framer-motion).
const ProfileFormModal = dynamic(() => import("./ProfileFormModal"), {
  ssr: false,
});
const CreateTaskModal = dynamic(() => import("./CreateTaskModal"), {
  ssr: false,
});
const ViewGalleryModal = dynamic(() => import("./ViewGalleryModal"), {
  ssr: false,
});
const UploadGalleryModal = dynamic(() => import("./UploadGalleryModal"), {
  ssr: false,
});
const AccountVerificationModal = dynamic(
  () => import("./AccountVerificationModal"),
  { ssr: false },
);
const ThoughsModal = dynamic(() => import("./ThoughsModal"), { ssr: false });
const ShowMyIdModal = dynamic(() => import("./ShowMyIdModal"), { ssr: false });
const ObjectiveDirectionsModal = dynamic(
  () => import("./ObjectiveDirectionsModal"),
  { ssr: false },
);

// Map every modalType key to its component.
// CreateTaskModal handles create / edit / recreate flows internally.
const MODAL_COMPONENTS = {
  editProfile: ProfileFormModal,
  createObjective: CreateTaskModal,
  editObjective: CreateTaskModal,
  recreateObjective: CreateTaskModal,
  viewGallery: ViewGalleryModal,
  uploadGallery: UploadGalleryModal,
  accountVerification: AccountVerificationModal,
  thoughts: ThoughsModal,
  showMyId: ShowMyIdModal,
  objectiveDirections: ObjectiveDirectionsModal,
};

const ModalRoot = () => {
  const { modalType } = useSelector(selectModal);
  const Modal = modalType ? (MODAL_COMPONENTS[modalType] ?? null) : null;
  return Modal ? <Modal /> : null;
};

export default ModalRoot;
