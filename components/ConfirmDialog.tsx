"use client";

import { IconClose } from "./icons";

export function ConfirmDialog({
  title,
  body,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
      <div
        className="relative card !rounded-2xl w-full max-w-[400px] p-6 animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onCancel} className="absolute top-4 right-4 text-[var(--text-3)] hover:text-[var(--text)]">
          <IconClose />
        </button>
        <h3 className="font-bold text-[17px]">{title}</h3>
        <p className="text-[13.5px] text-[var(--text-2)] mt-1.5 leading-relaxed">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="btn btn-soft">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn"
            style={{ background: "var(--red)", color: "#fff", boxShadow: "0 4px 14px rgba(251,111,111,0.28)" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
