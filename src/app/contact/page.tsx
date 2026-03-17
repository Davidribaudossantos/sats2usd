import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact | Sats2USD",
  description: "Get in touch with the Sats2USD team.",
};

export default function Contact() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#f7931a] py-8 px-8">
      <div className="flex w-full max-w-[375px] flex-col gap-8">

        {/* Back + Header */}
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center text-[16px] font-medium text-black w-fit"
            style={{ marginTop: "10px", gap: "6px" }}
          >
            <Image src="/back-arrow.svg" alt="Back" width={14} height={12} />
            <span className="hover:underline">Home</span>
          </Link>
          <div className="flex flex-col items-center gap-3">
            <Image src="/contact-icon.svg" alt="Contact" width={40} height={40} />
            <h1 className="text-center text-[36px] font-medium leading-[1.1] text-black">
              Contact
            </h1>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col text-[16px] leading-[20px] text-black">
          <p className="font-normal">
            For questions, suggestions or just to say hi, contact us at:{" "}
            <a href="mailto:support@sats2usd.com" className="hover:underline">
              support@sats2usd.com
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 text-[12px] text-[#8d4f04]">
          <p className="font-semibold leading-[16px]">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            {"  |  "}
            <Link href="/privacy-policy" className="hover:underline">
              Privacy policy
            </Link>
            {"  |  "}
            <Link href="/cookies" className="hover:underline">
              Cookies
            </Link>
            {"  |  "}
            <Link href="/terms-of-use" className="hover:underline">
              Terms of use
            </Link>
            {"  |  "}
            <span className="underline">Contact</span>
          </p>
          <p className="text-center font-normal leading-[12px]">© 2026 Sats2USD.com</p>
        </div>

      </div>
    </div>
  );
}
