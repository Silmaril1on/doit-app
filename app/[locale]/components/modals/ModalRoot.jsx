"use client";
import ProfileFormModal from "@/app/[locale]/components/modals/ProfileFormModal";
import CreateTaskModal from "@/app/[locale]/components/modals/CreateTaskModal";
import ViewGalleryModal from "@/app/[locale]/components/modals/ViewGalleryModal";
import UploadGalleryModal from "@/app/[locale]/components/modals/UploadGalleryModal";
import AccountVerificationModal from "@/app/[locale]/components/modals/AccountVerificationModal";
import ThoughsModal from "@/app/[locale]/components/modals/ThoughsModal";

const ModalRoot = () => {
  return (
    <>
      <ProfileFormModal />
      <CreateTaskModal />
      <ViewGalleryModal />
      <UploadGalleryModal />
      <AccountVerificationModal />
      <ThoughsModal />
    </>
  );
};

export default ModalRoot;
