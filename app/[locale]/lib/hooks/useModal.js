import { useDispatch, useSelector } from "react-redux";
import {
  openModal,
  closeModal,
  selectModal,
} from "@/app/[locale]/lib/features/modalSlice";

const sanitizeModalProps = (value) => {
  if (typeof value === "function") return undefined;
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeModalProps(item))
      .filter((item) => item !== undefined);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, val]) => [key, sanitizeModalProps(val)])
        .filter(([, val]) => val !== undefined),
    );
  }
  return value;
};

export function useModal() {
  const dispatch = useDispatch();
  const { modalType, modalProps } = useSelector(selectModal);

  return {
    modalType,
    modalProps,
    open: (type, props = {}) =>
      dispatch(
        openModal({
          modalType: type,
          modalProps: sanitizeModalProps(props),
        }),
      ),
    close: () => dispatch(closeModal()),
  };
}

/**
 * useModalActions
 * For components that only need to open/close modals and should NOT
 * re-render whenever modal state changes.
 */
export function useModalActions() {
  const dispatch = useDispatch();
  return {
    open: (type, props = {}) =>
      dispatch(
        openModal({
          modalType: type,
          modalProps: sanitizeModalProps(props),
        }),
      ),
    close: () => dispatch(closeModal()),
  };
}
