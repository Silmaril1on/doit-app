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
