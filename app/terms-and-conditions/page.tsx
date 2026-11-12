import type { Metadata } from "next";
import { PolicyPageShell } from "../../components/legal/PolicyPageShell";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions governing browsing, account registration, INR pricing, intellectual property, and purchases on ORIIKO India.",
};

export default function TermsAndConditionsPage() {
  return (
    <PolicyPageShell
      currentPath="/terms-and-conditions"
      eyebrow="Legal Terms"
      title="Terms & Conditions"
      effectiveDate="1 November 2026"
      intro="By visiting oriiko.com, creating an account, or placing an order, you agree to the Terms & Conditions governing ORIIKO retail sales in India."
      highlights={[
        { label: "Storefront Currency", value: "All prices in INR (₹) inclusive of GST" },
        { label: "Store Scope", value: "Valid strictly for deliveries within India" },
        { label: "Governing Law", value: "Laws of India" },
      ]}
      sections={[
        {
          id: "store-use",
          heading: "Eligibility & Account Responsibility",
          paragraphs: [
            "You must be legally capable of entering into a binding contract under the Indian Contract Act, 1872 (or browsing under parental supervision) to purchase from ORIIKO.",
            "You are responsible for maintaining the confidentiality of your account credentials and for ensuring your delivery phone number and shipping address are accurate.",
          ],
        },
        {
          id: "pricing-and-stock",
          heading: "Pricing, Taxes & Drop Availability",
          paragraphs: [
            "All listed product prices are denominated in Indian Rupees (INR ₹) and include applicable Goods and Services Tax (GST). Prices and promo codes (such as ORIIKO10) are subject to update prior to checkout confirmation.",
            "Because ORIIKO drops are produced in limited batches, adding an item to your bag does not reserve stock until checkout is completed. We reserve the right to cancel any order in cases of pricing error or stock mismatch and issue a full refund immediately.",
          ],
        },
        {
          id: "product-representation",
          heading: "Colour, GSM & Embroidery Variance",
          paragraphs: [
            "We photograph every hoodie, embroidered t-shirt, and crewneck to accurately reflect its true shade on `#F2F2F0` studio lighting, though display calibration may vary slightly across screens. Minor hand-finished variations in bio-washing and chain-stitch tension are natural hallmarks of small-batch production.",
          ],
        },
        {
          id: "intellectual-property",
          heading: "Intellectual Property",
          paragraphs: [
            "All ORIIKO trademarks, logos, custom chain-stitch embroidery artwork, lookbook photography, and website design assets remain the exclusive property of ORIIKO. No brand materials may be reproduced, resold, or redistributed without prior written consent.",
          ],
        },
        {
          id: "governing-law",
          heading: "Governing Law & Disputes",
          paragraphs: [
            "These Terms & Conditions are governed by and construed in accordance with the laws of India. Any dispute arising out of purchases or site usage shall be subject to the competent courts in India.",
          ],
        },
      ]}
    />
  );
}

