import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use | Sats2USD",
  description: "Terms of Use for Sats2USD.com.",
};

export default function TermsOfUse() {
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
            <Image src="/terms-icon.svg" alt="Terms of use" width={40} height={40} />
            <h1 className="text-center text-[36px] font-medium leading-[1.1] text-black">
              Terms of use
            </h1>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col text-[16px] leading-[20px] text-black">

          <p className="font-normal text-[#8d4f04]">Last updated: December 28, 2025</p>
          <br />

          <p className="font-semibold">Acceptance of terms</p>
          <p className="font-normal">By accessing or using sats2usd.com (the &ldquo;Service&rdquo;), you agree to these Terms of Use. If you do not agree, do not use the Service.</p>
          <br />

          <p className="font-semibold">Description of service</p>
          <p className="font-normal">sats2usd.com provides a free conversion tool that estimates the value of satoshis (sats) in US dollars (USD) based on publicly available Bitcoin market pricing data.</p>
          <br />

          <p className="font-semibold">3) Informational use only (No advice)</p>
          <br />
          <p className="font-normal">The Service is provided for informational purposes only.</p>
          <ul className="list-disc font-normal ml-6">
            <li>Conversion results are estimates and may be affected by market volatility, data-source delays, rounding, or technical issues.</li>
            <li>The Service does not provide financial, investment, tax, or trading advice.</li>
            <li>You are solely responsible for how you use the information provided.</li>
          </ul>
          <br />

          <p className="font-semibold">4) Your responsibilities</p>
          <br />
          <p className="font-normal">You agree not to:</p>
          <ul className="list-disc font-normal ml-6">
            <li>misuse the Service (including attempting to disrupt, overload, or reverse engineer it),</li>
            <li>use automated systems (bots/scrapers) that unreasonably burden the Service,</li>
            <li>attempt unauthorized access to the Service or related systems.</li>
          </ul>
          <br />
          <p className="font-normal">We may limit, suspend, or block access if we believe your use harms the Service or other users.</p>
          <br />

          <p className="font-semibold">5) Third-Party services and advertising</p>
          <p className="font-normal">The Service may include third-party services such as Google Analytics and Google AdSense. These services may collect information and/or show advertisements according to their own terms and policies. Advertisements displayed are provided by third parties. We do not endorse and are not responsible for the content of third-party ads, websites, or products/services linked from ads.</p>
          <br />

          <p className="font-semibold">6) No warranties</p>
          <p className="font-normal">The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind, express or implied. We do not guarantee the Service will be uninterrupted, secure, or error-free, or that results will be accurate.</p>
          <br />

          <p className="font-semibold">7) Limitation of liability</p>
          <p className="font-normal">To the maximum extent permitted by law, we will not be liable for any damages arising from or related to your use of the Service, including direct, indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or business.</p>
          <br />

          <p className="font-semibold">8) Intellectual property</p>
          <p className="font-normal">All content, design, and functionality of the Service (including text, layout, branding, and code) is owned by sats2usd.com or its licensors and is protected by applicable intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service for personal or internal informational purposes. You may not copy, reproduce, distribute, sell, or create derivative works from the Service without permission.</p>
          <br />

          <p className="font-semibold">9) Changes to these terms</p>
          <p className="font-normal">We may update these Terms from time to time. Changes take effect when posted on this page. Your continued use of the Service after changes are posted means you accept the updated Terms.</p>
          <br />

          <p className="font-semibold">10) Governing law</p>
          <p className="font-normal">These Terms are governed by the laws of Portugal, without regard to conflict-of-law principles.</p>
          <br />

          <p className="font-semibold">11) Contact</p>
          <p className="font-normal">If you have questions about these Terms, contact us at: support@sats2usd.com</p>

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
            <span className="underline">Terms of use</span>
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
