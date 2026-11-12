import type { Metadata } from "next";
import { PolicyPageShell } from "../../components/legal/PolicyPageShell";

export const metadata: Metadata = {
  title: "Refunds, Exchanges & Cancellations Policy",
  description:
    "ORIIKO India policy covering order cancellations, 14-day size exchanges, reverse pickups, and refund timelines.",
};

export default function RefundsAndCancellationsPage() {
  return (
    <PolicyPageShell
      currentPath="/refunds-and-cancellations"
      eyebrow="Customer Assurance"
      title="Refunds & Cancellations"
      effectiveDate="1 November 2026"
      intro="Every ORIIKO order across India is backed by straightforward cancellations before dispatch and a 14-day easy exchange and return window after delivery."
      highlights={[
        { label: "Cancellation Window", value: "Before dispatch (within 12 hours of placing order)" },
        { label: "Return & Exchange Period", value: "14 days from date of doorstep delivery" },
        { label: "Refund Processing", value: "5–7 business days after quality check" },
      ]}
      sections={[
        {
          id: "cancellations",
          heading: "Order Cancellations",
          paragraphs: [
            "You may cancel an unshipped ORIIKO order within 12 hours of placing it, or before a tracking ID has been generated for dispatch.",
            "To request a cancellation, email support@oriiko.com with your Order ID. If an order has already left our warehouse, cancellation is no longer possible—once delivered, you can initiate a return under our 14-day policy.",
          ],
          bullets: [
            "Prepaid UPI, card, or netbanking cancellations are refunded back to the original payment source within 5–7 working days.",
            "Cash on Delivery (COD) orders cancelled prior to dispatch carry zero cancellation fee.",
          ],
        },
        {
          id: "exchanges-and-returns",
          heading: "14-Day Exchanges & Returns Eligibility",
          paragraphs: [
            "If the fit is off or you prefer another size in stock, ORIIKO offers doorstep reverse pickup across all serviceable Indian pin codes within 14 calendar days of delivery.",
          ],
          bullets: [
            "Garments must be unworn, unwashed, free of perfume/deodorant marks, and returned with original ORIIKO hangtags and matte pouch intact.",
            "Items damaged by improper handling or returned without tags cannot be cleared for refund or exchange.",
            "First size exchange on any Drop 01 hoodie, sweatshirt, tee, or bottom is complimentary.",
          ],
        },
        {
          id: "defective-or-incorrect",
          heading: "Damaged, Defective, or Incorrect Items",
          paragraphs: [
            "Every hoodie and embroidered tee undergoes GSM weight and stitch inspection prior to packing. If an item arrives damaged, stained, or differs from your order, contact us within 48 hours of delivery with photos of the garment and shipping label.",
            "We will arrange an express reverse pickup and ship a replacement at zero additional charge, or issue a 100% refund if your size is out of stock.",
          ],
        },
        {
          id: "refund-timelines",
          heading: "Refund Methods & Timelines",
          paragraphs: [
            "Once your return reaches our warehouse and clears inspection (typically within 48 hours of pickup arrival), refunds are triggered immediately:",
          ],
          bullets: [
            "UPI, Debit Card, Credit Card & Netbanking: credited back to your source account in 5–7 business days.",
            "Cash on Delivery (COD) orders: refunded via instant bank/UPI payout upon verified bank details, or as full-value ORIIKO Store Credit.",
          ],
        },
      ]}
    />
  );
}

