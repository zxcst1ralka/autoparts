"use client";

export default function ConfirmButton({
  label,
  message,
}: {
  label: string;
  message: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
      className="text-red-500 underline"
    >
      {label}
    </button>
  );
}
