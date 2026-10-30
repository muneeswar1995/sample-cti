export type ToastVariant = "default" | "error" | "success" | "warning" | "info";

export interface ToastOptions {
  /** Bold headline. Falls back to a sensible label for the variant. */
  title?: string;
  /** Milliseconds before the toast auto-dismisses. Defaults per variant. */
  duration?: number;
}

export interface ToastItem extends ToastOptions {
  id: string;
  message: string;
  variant: ToastVariant;
}
