import type { Metadata } from "next";
import { PolicyPageShell } from "../../components/legal/PolicyPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how ORIIKO India collects, uses, stores, and safeguards your personal data across our streetwear storefront and order deliveries.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPageShell
      currentPath="/privacy-policy"
      eyebrow="Data & Trust"
      title="Privacy Policy"
      effectiveDate="1 November 2026"
      intro="ORIIKO respects your personal data. This Privacy Policy explains how your information is collected, processed, and safeguarded when you browse or shop on oriiko.com across India."
      highlights={[
        { label: "Data Practice", value: "Never sold or rented to third-party brokers" },
        { label: "Payment Security", value: "PCI-compliant Indian gateways; zero card storage" },
        { label: "Your Control", value: "Access, correct, or request deletion anytime" },
      ]}
      sections={[
        {
          id: "information-collected",
          heading: "Information We Collect",
          paragraphs: [
            "We collect only the details necessary to fulfil your order, manage your member account, and keep you informed on drops you opt into.",
          ],
          bullets: [
            "Account & Profile Details: Full name, email address, and encrypted passcode hash.",
            "Order & Delivery Information: Shipping address, pin code, phone number, and GST invoice metadata where requested.",
            "Technical Session Data: Essential HTTP-only session cookies required to maintain your signed-in state and shopping bag.",
          ],
        },
        {
          id: "how-we-use-data",
          heading: "How Your Data Is Used",
          paragraphs: [
            "Your data is used strictly to confirm orders, dispatch parcels via courier partners across India, process returns/refunds, prevent fraudulent transactions, and send restock notifications when explicitly subscribed.",
          ],
        },
        {
          id: "payment-privacy",
          heading: "UPI, Card & Payment Privacy",
          paragraphs: [
            "All online payments (UPI, Rupay, Visa, Mastercard, Netbanking) are processed over SSL-encrypted connections through RBI-authorized Indian payment partners. ORIIKO does not collect, view, or store your full card number, CVV, or UPI PIN.",
          ],
        },
        {
          id: "rights-and-contact",
          heading: "Your Rights & Data Requests",
          paragraphs: [
            "In line with the Digital Personal Data Protection principles of India, you can request access to, correction of, or erasure of your stored personal account details at any time by writing to support@oriiko.com.",
          ],
        },
      ]}
    />
  );
}

