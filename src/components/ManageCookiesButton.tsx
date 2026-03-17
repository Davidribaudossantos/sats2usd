"use client";

export default function ManageCookiesButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="underline"
      onClick={() =>
        window.dispatchEvent(new CustomEvent("open-cookie-modal"))
      }
    >
      {children}
    </button>
  );
}
