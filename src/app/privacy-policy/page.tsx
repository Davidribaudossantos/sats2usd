import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Sats2USD",
  description: "Privacy Policy for Sats2USD.com — how we handle your information.",
};

export default function PrivacyPolicy() {
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
            <Image src="/policy-icon.svg" alt="Privacy policy" width={40} height={40} />
            <h1 className="text-center text-[36px] font-medium leading-[1.1] text-black">
              Privacy policy
            </h1>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col text-[16px] leading-[20px] text-black">

          <p className="font-normal text-[#8d4f04]">Last updated: December 28, 2025</p>
          <br />

          <p className="font-semibold">1) Introduction</p>
          <p className="font-normal">This Privacy Policy explains how sats2usd.com (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) handles information when you use our website (the &ldquo;Service&rdquo;).</p>
          <br />

          <p className="font-semibold">2) Summary</p>
          <p className="font-normal">
            We do not ask you to create an account and we do not collect information like your name or email through the converter itself. We use Google Analytics (if you consent) to understand how the site is used. We use Google AdSense (if you consent) to display ads and measure ad performance. You can accept, reject, or change your cookie choices at any time using{" "}
            <span className="underline">Manage your cookies</span>
            {" "}on the site.
          </p>
          <br />

          <p className="font-semibold">3) Information we collect</p>
          <br />
          <p className="font-normal">
            A) Information you provide to us<br />
            {" "}We do not require you to submit personal information to use the converter. If you contact us by email, we will receive your email address and the content of your message.
          </p>
          <br />
          <p className="font-normal">
            B) Information collected automatically (via cookies and similar technologies)<br />
            {" "}Depending on your cookie choices, third-party services may automatically collect information such as:
          </p>
          <ul className="list-disc font-normal ml-6">
            <li>IP address (which may be processed in truncated form depending on settings)</li>
            <li>Device/browser information</li>
            <li>Approximate location (derived from IP)</li>
            <li>Pages visited, actions taken, and usage data</li>
            <li>Ad interaction and measurement data (e.g., impressions/clicks)</li>
          </ul>
          <br />

          <p className="font-semibold">4) Cookies and consent</p>
          <p className="font-normal">We use cookies and similar technologies to:</p>
          <ul className="list-disc font-normal ml-6">
            <li>keep the site working and secure (necessary cookies), and</li>
            <li>with your consent, measure traffic and show ads.</li>
          </ul>
          <p className="font-normal">
            You can manage your choices using our cookie banner and{" "}
            <span className="underline">Manage your cookies link</span>
            . You can also control cookies via your browser settings. Blocking cookies may affect site functionality. For more detail, see our Cookie Policy.
          </p>
          <br />

          <p className="font-semibold">5) Third-party services we use</p>
          <br />
          <p className="font-normal">
            Google Analytics (optional)<br />
            If you consent to Analytics cookies, we use Google Analytics to understand how users interact with the Service and to improve it.
          </p>
          <br />
          <p className="font-normal">
            Google AdSense (optional)<br />
            If you consent to Advertising cookies, we use Google AdSense to display ads and measure ad performance. Depending on your choices, Google may use cookies and similar technologies to personalize ads.
          </p>
          <br />
          <p className="font-normal">You can learn more about Google&apos;s advertising options and controls through Google&apos;s ad settings.</p>
          <br />

          <p className="font-semibold">6) How we use information</p>
          <p className="font-normal">When enabled, information collected through Analytics/Ads may be used to:</p>
          <ul className="list-disc font-normal ml-6">
            <li>operate and secure the Service</li>
            <li>measure performance and understand usage</li>
            <li>improve content and user experience</li>
            <li>display ads and measure ad performance</li>
            <li>comply with legal obligations</li>
          </ul>
          <br />

          <p className="font-semibold">7) Sharing of information</p>
          <p className="font-normal">We do not sell your personal information. We may share information in the following situations:</p>
          <ul className="list-disc font-normal ml-6">
            <li>with service providers/partners you enable through consent (e.g., Google Analytics, Google AdSense)</li>
            <li>if required to comply with law, regulation, or legal process</li>
            <li>to protect the rights, security, and integrity of the Service</li>
          </ul>
          <br />

          <p className="font-semibold">8) Legal basis (EEA/UK users)</p>
          <br />
          <p className="font-normal">If you are in the EEA/UK/Switzerland:</p>
          <ul className="list-disc font-normal ml-6">
            <li>Necessary cookies are processed based on our legitimate interest in operating a functional and secure website.</li>
            <li>Analytics and Advertising cookies are processed based on your consent, which you can withdraw at any time via Cookie Settings.</li>
          </ul>
          <br />

          <p className="font-semibold">9) Data retention</p>
          <p className="font-normal">We keep email messages you send us for as long as necessary to respond and maintain records, then delete or archive them as appropriate. Analytics and advertising data retention is determined by our settings within Google&apos;s platforms and may be retained for a limited period according to those settings.</p>
          <br />

          <p className="font-semibold">10) International transfers</p>
          <p className="font-normal">Google and other service providers may process information on servers located outside your country, including outside the EEA. Where applicable, these transfers are protected by appropriate safeguards (such as standard contractual clauses) as provided by the service provider.</p>
          <br />

          <p className="font-semibold">11) Your rights</p>
          <br />
          <p className="font-normal">Depending on your location, you may have rights such as:</p>
          <ul className="list-disc font-normal ml-6">
            <li>access to your personal data</li>
            <li>correction of inaccurate data</li>
            <li>deletion</li>
            <li>restriction or objection to processing</li>
            <li>data portability</li>
            <li>withdrawal of consent (for Analytics/Ads) at any time via Cookies page</li>
          </ul>
          <br />
          <p className="font-normal">To exercise these rights, contact us at: support@sats2usd.com</p>
          <br />

          <p className="font-semibold">12) Children&apos;s privacy</p>
          <p className="font-normal">The Service is not directed to children. We do not knowingly collect personal information from children. If you believe a child has provided personal information, contact us and we will take appropriate steps to delete it.</p>
          <br />

          <p className="font-semibold">13) Changes to this policy</p>
          <p className="font-normal">We may update this Privacy Policy from time to time. We will post the updated version on this page and change the &ldquo;Last updated&rdquo; date.</p>
          <br />

          <p className="font-semibold">14) Contact</p>
          <p className="font-normal">Questions about this policy: support@sats2usd.com</p>

        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 text-[12px] text-[#8d4f04]">
          <p className="font-semibold leading-[16px]">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            {"  |  "}
            <span className="underline">Privacy policy</span>
            {"  |  "}
            <Link href="/cookies" className="hover:underline">
              Cookies
            </Link>
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
