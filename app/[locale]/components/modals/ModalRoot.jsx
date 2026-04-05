"use client";
import ProfileFormModal from "@/app/[locale]/components/modals/ProfileFormModal";
import CreateTaskModal from "@/app/[locale]/components/modals/CreateTaskModal";
import ViewGalleryModal from "@/app/[locale]/components/modals/ViewGalleryModal";
import UploadGalleryModal from "@/app/[locale]/components/modals/UploadGalleryModal";

const ModalRoot = () => {
  return (
    <>
      <ProfileFormModal />
      <CreateTaskModal />
      <ViewGalleryModal />
      <UploadGalleryModal />
    </>
  );
};

export default ModalRoot;
