import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ManageCookiesButton from "@/components/ManageCookiesButton";

export const metadata: Metadata = {
  title: "Cookies | Sats2USD",
  description: "Cookie policy for Sats2USD.com — how we use cookies and how to manage them.",
};

export default function CookiesPage() {
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
            <Image src="/cookies-icon.svg" alt="Cookies" width={40} height={40} />
            <h1 className="text-center text-[36px] font-medium leading-[1.1] text-black">
              Cookies
            </h1>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col text-[16px] leading-[20px] text-black">

          <p className="font-normal text-[#8d4f04]">Last updated: December 28, 2025</p>
          <br />

          <p className="font-normal">This website uses cookies and similar technologies to make the site work, measure how it&apos;s used, and show ads. Some cookies are essential and always active. Others are optional and are only used if you consent.</p>
          <br />

          <p className="font-semibold">What are cookies?</p>
          <p className="font-normal">Cookies are small text files stored on your computer or mobile device when you visit a website. They help websites remember information about your visit and can support functionality, analytics, and advertising.</p>
          <br />

          <p className="font-semibold">How do we use cookies?</p>
          <p className="font-normal">We use cookies for the following purposes:</p>
          <br />

          <p className="font-normal">
            1) Strictly necessary cookies (always on)<br />
            These cookies are required for the website to function and to help keep it secure. They do not require consent and cannot be disabled using our cookie settings.
          </p>
          <br />

          <p className="font-normal">
            2) Analytics cookies (optional)<br />
            If you accept analytics, we use Google Analytics to collect information about how visitors use the site (for example, which pages are visited and how the site is navigated). This helps us improve the website. Google Analytics may process information such as device identifiers and IP address.
          </p>
          <br />

          <p className="font-normal">
            3) Advertising cookies (optional)<br />
            If you accept advertising, we use Google AdSense to display ads and measure ad performance (for example, how often an ad is shown or clicked). Depending on your settings, Google may use cookies and similar technologies to deliver and measure ads. If you enable analytics, data may be collected via third-party providers such as Google Analytics.
          </p>
          <br />

          <p className="font-normal">
            4) Personalized advertising (optional, if enabled)<br />
            If you allow personalized ads, Google may use additional signals to personalize advertising. If you reject personalized ads, you may still see ads, but they may be less relevant.
          </p>
          <br />

          <p className="font-normal">Third-party cookies</p>
          <p className="font-normal">When analytics and/or advertising is enabled, third parties (such as Google) may set and read cookies or use similar technologies. These providers may process information in accordance with their own policies.</p>
          <br />

          <p className="font-semibold">Your choices</p>
          <p className="font-normal">
            You can accept, reject, or manage optional cookies via our cookie banner. You can also change your choice at any time by clicking{" "}
            <ManageCookiesButton>Manage your cookies</ManageCookiesButton>
            . You can also manage cookies through your browser settings. Blocking or deleting cookies may affect how the site functions.
          </p>
          <br />

          <p className="font-semibold">Legal basis (EEA/UK)</p>
          <ul className="list-disc font-normal ml-6">
            <li>Necessary cookies: processed based on our legitimate interests in providing a functional, secure website.</li>
            <li>
              Analytics and advertising cookies: processed based on your consent, which you can withdraw at any time via{" "}
              <ManageCookiesButton>Manage your cookies</ManageCookiesButton>
              .
            </li>
          </ul>

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
            <span className="underline">Cookies</span>
            {"  |  "}
            <Link href="/terms-of-use" className="hover:underline">
              Terms of use
            </Link>
            {"  |  "}
            <Link href="/contact" className="hover:underline">
              Contact
            </Link>
          </p>
          <p className="text-center font-normal leading-[12px]">© 2026 Sats2USD.com</p>
        </div>

      </div>
    </div>
  );
}
