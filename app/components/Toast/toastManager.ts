import type { ToastItem, ToastOptions, ToastVariant } from "./types";

type Listener = (toast: ToastItem) => void;

let listener: Listener | null = null;
let counter = 0;

/**
 * The host registers itself here so `showToast` can be called from anywhere -
 * including non-React code such as the request interceptor.
 */
export const registerToastHost = (next: Listener | null) => {
  listener = next;
};

export const isToastHostMounted = () => listener !== null;

export const emitToast = (
  message: string,
  variant: ToastVariant,
  options?: ToastOptions
) => {
  if (!listener) {
    return false;
  }

  counter += 1;
  listener({ id: `toast-${counter}`, message, variant, ...options });

  return true;
};
