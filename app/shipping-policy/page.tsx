import type { Metadata } from "next";
import { PolicyPageShell } from "../../components/legal/PolicyPageShell";
import { fetchStoreBootstrap } from "../../lib/store/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shipping Policy & Pan-India Delivery",
  description:
    "ORIIKO India shipping policy covering dispatch timelines, metro and pan-India delivery windows, free shipping threshold, and Cash on Delivery (COD).",
};

export default async function ShippingPolicyPage() {
  const { settings } = await fetchStoreBootstrap();
  const formattedThreshold = `₹${settings.freeShippingThreshold.toLocaleString("en-IN")}`;
  const formattedCharge = `₹${settings.deliveryCharge.toLocaleString("en-IN")}`;

  return (
    <PolicyPageShell
      currentPath="/shipping-policy"
      eyebrow="Pan-India Delivery"
      title="Shipping Policy"
      effectiveDate="1 November 2026"
      intro="ORIIKO currently ships exclusively across India via insured express logistics partners, with live tracking updates from dispatch to doorstep."
      highlights={[
        {
          label: "Free Shipping Threshold",
          value:
            settings.freeShippingThreshold <= 0
              ? "Free express delivery on all orders"
              : `Free express delivery on orders above ${formattedThreshold}`,
        },
        {
          label: "Standard Shipping Fee",
          value:
            settings.deliveryCharge <= 0
              ? "Complimentary Pan-India delivery"
              : `Flat ${formattedCharge} on orders under ${formattedThreshold}`,
        },
        { label: "Dispatch Speed", value: "Within 24–48 business hours" },
      ]}
      sections={[
        {
          id: "serviceable-locations",
          heading: "Serviceable Locations Across India",
          paragraphs: [
            "We deliver across 19,000+ Indian pin codes covering all major metro cities, tier-2/tier-3 hubs, and surrounding regions via trusted surface and air courier partners. International shipping is currently unavailable.",
          ],
        },
        {
          id: "processing-timelines",
          heading: "Order Processing & Dispatch",
          paragraphs: [
            "Orders placed Monday through Saturday before 2:00 PM IST are usually packed and handed to our courier partner the same day or next working day. Orders placed on Sundays or national holidays ship the following business day.",
          ],
          bullets: [
            "Prepaid orders clear automatically for immediate dispatch.",
            "Cash on Delivery (COD) orders may receive a quick SMS or WhatsApp confirmation prior to handoff.",
          ],
        },
        {
          id: "delivery-windows",
          heading: "Estimated Transit Windows",
          paragraphs: [
            "Once dispatched, your tracking link is shared via email and SMS.",
          ],
          bullets: [
            "Metro Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad): 2–4 business days.",
            "Rest of India: 4–7 business days depending on distance and courier connectivity.",
            "Remote locations & North-East India / J&K / Islands: 6–9 business days.",
          ],
        },
        {
          id: "undelivered-packages",
          heading: "Re-Attempts & Address Changes",
          paragraphs: [
            "Our courier partners attempt delivery up to 3 times before returning a parcel to our warehouse. Please ensure a reachable mobile number and complete pin code/landmark details at checkout.",
            "If you need an address correction before dispatch, email support@oriiko.com immediately with your Order ID.",
          ],
        },
      ]}
    />
  );
}

