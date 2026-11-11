import { Product, Review, StorySlide } from "../types/ecommerce";

export const PRODUCTS: Product[] = [
  {
    id: "ork-01",
    slug: "heavyweight-boxy-hoodie",
    name: "ORIIKO Heavyweight Boxy Hoodie",
    collection: "Drop 01 — Core Fleece",
    category: "hoodies",
    price: 3899,
    originalPrice: 4499,
    discountBadge: "Drop 01",
    description:
      "Cut in a relaxed boxy silhouette from 480 GSM loopback French terry cotton. Engineered with dropped shoulders, double-layered structured hood, and high-density tonal embroidery on the chest.",
    details: [
      "100% Super-combed ringspun cotton (480 GSM heavy French terry)",
      "Pre-shrunk and enzyme-washed for a soft broken-in handfeel",
      "Double-lined hood with zero-drawcord clean neckline",
      "High-density tonal chain-stitch ORIIKO crest",
      "Heavy 2x2 ribbed cuffs and waistband that hold structure",
    ],
    materials: "100% Combed Cotton French Terry (480 GSM)",
    care: "Machine wash cold inside out. Dry flat in shade. Do not iron directly over embroidery.",
    primaryImage:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    ],
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: [
      { name: "Deep Burgundy", hex: "#591623" },
      { name: "Dark Charcoal", hex: "#26231F" },
    ],
    variants: [
      { id: "v-01-s-b", name: "S / Deep Burgundy", size: "S", color: "Deep Burgundy", inStock: true },
      { id: "v-01-m-b", name: "M / Deep Burgundy", size: "M", color: "Deep Burgundy", inStock: true },
      { id: "v-01-l-b", name: "L / Deep Burgundy", size: "L", color: "Deep Burgundy", inStock: true },
      { id: "v-01-xl-b", name: "XL / Deep Burgundy", size: "XL", color: "Deep Burgundy", inStock: false },
      { id: "v-01-m-c", name: "M / Dark Charcoal", size: "M", color: "Dark Charcoal", inStock: true },
      { id: "v-01-l-c", name: "L / Dark Charcoal", size: "L", color: "Dark Charcoal", inStock: true },
    ],
    rating: 4.9,
    reviewCount: 64,
    isNewArrival: true,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: "ork-02",
    slug: "chain-stitch-embroidered-tee",
    name: "Chain-Stitch Embroidered Oversized Tee",
    collection: "Drop 01 — Core Jersey",
    category: "t-shirts",
    price: 1899,
    discountBadge: "Bestseller",
    description:
      "280 GSM heavyweight combed cotton tee featuring an oversized drop-shoulder drape and precision multi-thread chain-stitch embroidery across the chest.",
    details: [
      "100% Super-combed cotton single jersey (280 GSM)",
      "Thick 1.2-inch lycra-reinforced mock-rib collar that stays flat",
      "High-stitch-count custom ORIIKO embroidery",
      "Bio-washed fabric treated for zero pilling",
    ],
    materials: "100% Combed Heavyweight Cotton (280 GSM)",
    care: "Cold gentle machine wash inside out. Hang dry in shade.",
    primaryImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80",
    ],
    availableSizes: ["XS", "S", "M", "L", "XL"],
    availableColors: [
      { name: "Off-White", hex: "#F2F2F0" },
      { name: "Dark Charcoal", hex: "#26231F" },
    ],
    variants: [
      { id: "v-02-s-w", name: "S / Off-White", size: "S", color: "Off-White", inStock: true },
      { id: "v-02-m-w", name: "M / Off-White", size: "M", color: "Off-White", inStock: true },
      { id: "v-02-l-w", name: "L / Off-White", size: "L", color: "Off-White", inStock: true },
      { id: "v-02-m-c", name: "M / Dark Charcoal", size: "M", color: "Dark Charcoal", inStock: true },
      { id: "v-02-l-c", name: "L / Dark Charcoal", size: "L", color: "Dark Charcoal", inStock: true },
    ],
    rating: 4.8,
    reviewCount: 92,
    isNewArrival: true,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: "ork-03",
    slug: "heavyweight-crewneck-sweatshirt",
    name: "Heavyweight Crewneck Sweatshirt",
    collection: "Drop 01 — Core Fleece",
    category: "sweatshirts",
    price: 3199,
    discountBadge: "New Drop",
    description:
      "Structured crewneck sweatshirt milled from 440 GSM French terry. Designed with clean reverse flatlock seams, gusseted side panels, and subtle burgundy back-neck insignia.",
    details: [
      "440 GSM Heavyweight French Terry Cotton",
      "Reverse flatlock stitching along raglan sleeves",
      "Underarm ribbed gussets for unrestricted movement",
      "Tonal satin-stitch emblem at left cuff",
    ],
    materials: "100% Cotton French Terry (440 GSM)",
    care: "Machine wash cold. Lay flat to dry to preserve boxy drape.",
    primaryImage:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=80",
    ],
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: [
      { name: "Dark Charcoal", hex: "#26231F" },
      { name: "Deep Burgundy", hex: "#591623" },
    ],
    variants: [
      { id: "v-03-s-c", name: "S / Dark Charcoal", size: "S", color: "Dark Charcoal", inStock: true },
      { id: "v-03-m-c", name: "M / Dark Charcoal", size: "M", color: "Dark Charcoal", inStock: true },
      { id: "v-03-l-c", name: "L / Dark Charcoal", size: "L", color: "Dark Charcoal", inStock: true },
      { id: "v-03-m-b", name: "M / Deep Burgundy", size: "M", color: "Deep Burgundy", inStock: true },
    ],
    rating: 4.9,
    reviewCount: 41,
    isNewArrival: true,
    isBestseller: false,
  },
  {
    id: "ork-04",
    slug: "monogram-embroidered-boxy-tee",
    name: "Monogram Embroidered Boxy Tee",
    collection: "Essentials",
    category: "t-shirts",
    price: 1699,
    description:
      "Clean everyday streetwear essential cut slightly cropped and boxy from 260 GSM brushed cotton jersey. Finished with micro-monogram embroidery in Rich Burgundy.",
    details: [
      "260 GSM Dense Combed Cotton Jersey",
      "Boxy cropped fit engineered for layering",
      "Reinforced shoulder-to-shoulder neck tape",
      "Custom woven ORIIKO hem label",
    ],
    materials: "100% Cotton Single Jersey (260 GSM)",
    care: "Machine wash cold with similar colours.",
    primaryImage:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    ],
    availableSizes: ["XS", "S", "M", "L", "XL"],
    availableColors: [
      { name: "Dark Charcoal", hex: "#26231F" },
      { name: "Off-White", hex: "#F2F2F0" },
    ],
    variants: [
      { id: "v-04-s-c", name: "S / Dark Charcoal", size: "S", color: "Dark Charcoal", inStock: true },
      { id: "v-04-m-c", name: "M / Dark Charcoal", size: "M", color: "Dark Charcoal", inStock: true },
      { id: "v-04-l-c", name: "L / Dark Charcoal", size: "L", color: "Dark Charcoal", inStock: true },
      { id: "v-04-m-w", name: "M / Off-White", size: "M", color: "Off-White", inStock: true },
    ],
    rating: 4.7,
    reviewCount: 53,
    isNewArrival: false,
    isBestseller: true,
  },
  {
    id: "ork-05",
    slug: "zip-through-drop-shoulder-hoodie",
    name: "Zip-Through Heavy Zip Hoodie",
    collection: "Drop 01 — Core Fleece",
    category: "hoodies",
    price: 4199,
    originalPrice: 4699,
    discountBadge: "Limited",
    description:
      "Full-zip boxy hoodie constructed with heavy antique metal dual sliders, double-layered hood, and embroidered back artwork.",
    details: [
      "480 GSM brushed interior cotton fleece",
      "Two-way antique brushed metal front zipper",
      "Deep welt pockets with bar-tack reinforcement",
      "Embroidered ORIIKO wordmark across upper back",
    ],
    materials: "100% Cotton Fleece (480 GSM)",
    care: "Zip closed before cold machine wash. Dry flat.",
    primaryImage:
      "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=1200&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=80",
    ],
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: [
      { name: "Dark Charcoal", hex: "#26231F" },
      { name: "Deep Burgundy", hex: "#591623" },
    ],
    variants: [
      { id: "v-05-s-c", name: "S / Dark Charcoal", size: "S", color: "Dark Charcoal", inStock: true },
      { id: "v-05-m-c", name: "M / Dark Charcoal", size: "M", color: "Dark Charcoal", inStock: true },
      { id: "v-05-l-c", name: "L / Dark Charcoal", size: "L", color: "Dark Charcoal", inStock: true },
      { id: "v-05-m-b", name: "M / Deep Burgundy", size: "M", color: "Deep Burgundy", inStock: true },
    ],
    rating: 4.9,
    reviewCount: 29,
    isNewArrival: true,
    isBestseller: false,
  },
  {
    id: "ork-06",
    slug: "relaxed-wide-leg-cargo-trousers",
    name: "Wide-Leg Pleated Cargo Trousers",
    collection: "Drop 01 — Utility",
    category: "bottoms",
    price: 3499,
    description:
      "Wide-leg streetwear trousers cut from crisp 340 GSM enzyme-washed cotton twill. Engineered with concealed bellows cargo pockets and adjustable ankle drawcords.",
    details: [
      "340 GSM Heavyweight 100% Cotton Twill",
      "Articulated knee pleats for clean volume",
      "Concealed snap-flap cargo pockets",
      "Elasticated rear waist with internal cotton drawstring",
    ],
    materials: "100% Heavy Cotton Twill (340 GSM)",
    care: "Machine wash cold. Tumble dry low or line dry.",
    primaryImage:
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?auto=format&fit=crop&w=1200&q=80",
    ],
    availableSizes: ["28", "30", "32", "34"],
    availableColors: [
      { name: "Dark Charcoal", hex: "#26231F" },
      { name: "Deep Burgundy", hex: "#591623" },
    ],
    variants: [
      { id: "v-06-28-c", name: "28 / Dark Charcoal", size: "28", color: "Dark Charcoal", inStock: true },
      { id: "v-06-30-c", name: "30 / Dark Charcoal", size: "30", color: "Dark Charcoal", inStock: true },
      { id: "v-06-32-c", name: "32 / Dark Charcoal", size: "32", color: "Dark Charcoal", inStock: true },
      { id: "v-06-34-c", name: "34 / Dark Charcoal", size: "34", color: "Dark Charcoal", inStock: true },
    ],
    rating: 4.8,
    reviewCount: 37,
    isNewArrival: false,
    isBestseller: true,
    isFeatured: true,
  },
  {
    id: "ork-07",
    slug: "half-zip-funnel-sweatshirt",
    name: "Half-Zip Embroidered Sweatshirt",
    collection: "Drop 01 — Core Fleece",
    category: "sweatshirts",
    price: 3399,
    description:
      "Mock-neck half-zip pullover crafted from 420 GSM loopback French terry. Finished with tonal chest embroidery and drop-shoulder construction.",
    details: [
      "420 GSM Loopback French Terry Cotton",
      "Structured funnel collar with antique zipper pull",
      "Tonal chest monogram embroidery",
      "Oversized streetwear proportion",
    ],
    materials: "100% Combed Cotton (420 GSM)",
    care: "Cold machine wash. Dry flat.",
    primaryImage:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=80",
    ],
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: [
      { name: "Deep Burgundy", hex: "#591623" },
      { name: "Off-White", hex: "#F2F2F0" },
    ],
    variants: [
      { id: "v-07-s-b", name: "S / Deep Burgundy", size: "S", color: "Deep Burgundy", inStock: true },
      { id: "v-07-m-b", name: "M / Deep Burgundy", size: "M", color: "Deep Burgundy", inStock: true },
      { id: "v-07-l-b", name: "L / Deep Burgundy", size: "L", color: "Deep Burgundy", inStock: true },
      { id: "v-07-m-w", name: "M / Off-White", size: "M", color: "Off-White", inStock: true },
    ],
    rating: 4.9,
    reviewCount: 24,
    isNewArrival: false,
    isBestseller: false,
  },
  {
    id: "ork-08",
    slug: "embroidered-twill-dad-cap",
    name: "ORIIKO Embroidered Cotton Cap",
    collection: "Accessories",
    category: "accessories",
    price: 1199,
    description:
      "Unstructured 6-panel cotton twill cap featuring raised satin-stitch ORIIKO embroidery at the crown and brushed antique metal buckle closure.",
    details: [
      "100% Brushed heavy cotton twill",
      "Raised 3D front monogram embroidery",
      "Adjustable strap with brushed metal clasp",
      "Interior sweatband with custom woven label",
    ],
    materials: "100% Heavy Cotton Twill",
    care: "Spot clean only with mild soap and cold water.",
    primaryImage:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80",
    secondaryImage:
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80",
    ],
    availableSizes: ["One Size"],
    availableColors: [
      { name: "Deep Burgundy", hex: "#591623" },
      { name: "Dark Charcoal", hex: "#26231F" },
    ],
    variants: [
      { id: "v-08-os-b", name: "One Size / Deep Burgundy", size: "One Size", color: "Deep Burgundy", inStock: true },
      { id: "v-08-os-c", name: "One Size / Dark Charcoal", size: "One Size", color: "Dark Charcoal", inStock: true },
    ],
    rating: 4.8,
    reviewCount: 47,
    isNewArrival: true,
    isBestseller: false,
  },
];

export const REVIEWS: Review[] = [
  {
    id: "rev-01",
    author: "Aarav Mehta",
    location: "Mumbai, Maharashtra",
    rating: 5,
    date: "October 14, 2026",
    verified: true,
    productName: "ORIIKO Heavyweight Boxy Hoodie",
    title: "Serious 480 GSM weight and cleanest boxy fit",
    comment:
      "Most Indian streetwear hoodies lose collar shape after two washes. The double-lined hood and cuffs on this one actually hold structure, and the deep burgundy shade looks unreal in person.",
  },
  {
    id: "rev-02",
    author: "Rhea Kapoor",
    location: "Bengaluru, Karnataka",
    rating: 5,
    date: "September 28, 2026",
    verified: true,
    productName: "Chain-Stitch Embroidered Oversized Tee",
    title: "Embroidery quality beats way pricier labels",
    comment:
      "Zero peeling prints here — the chain-stitch embroidery is crisp and thick, and the 280 GSM cotton sits properly on the shoulders without feeling stiff.",
  },
  {
    id: "rev-03",
    author: "Kabir Malhotra",
    location: "New Delhi",
    rating: 5,
    date: "October 02, 2026",
    verified: true,
    productName: "Heavyweight Crewneck Sweatshirt",
    title: "Built like a proper winter staple",
    comment:
      "Picked up the Charcoal crewneck for Delhi evenings. Stitching is solid, the ribbed collar sits high and clean, and delivery took just 3 days.",
  },
  {
    id: "rev-04",
    author: "Nikhil Reddy",
    location: "Hyderabad, Telangana",
    rating: 5,
    date: "November 01, 2026",
    verified: true,
    productName: "Wide-Leg Pleated Cargo Trousers",
    title: "Sharp silhouette without noisy branding",
    comment:
      "Finally a wide-leg cargo pant cut with proper proportions for sneakers. Pairs effortlessly with ORIIKO boxy tees.",
  },
];

export const STORY_SLIDES: StorySlide[] = [
  {
    id: 1,
    label: "Chapter I — Heavyweight Blanks",
    title: "Engineered from 280–480 GSM Cotton",
    subtitle: "Structure you feel the moment you put it on.",
    description:
      "Every ORIIKO hoodie, sweatshirt, and tee starts with high-density super-combed Indian cotton. Pre-shrunk and enzyme-washed so your boxy fit stays boxy wash after wash.",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1400&q=80",
    ctaText: "Shop Core Fleece",
    ctaLink: "/shop?category=hoodies",
  },
  {
    id: 2,
    label: "Chapter II — High-Density Embroidery",
    title: "Thread Over Disposable Ink",
    subtitle: "Chain-stitch and satin-stitch detailing built to outlast trends.",
    description:
      "Instead of loud plastic prints that crack, our graphic language lives in dense multi-thread embroidery — crafted to sit cleanly on heavyweight jersey and French terry.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80",
    ctaText: "Explore Embroidered Tees",
    ctaLink: "/shop?category=t-shirts",
  },
  {
    id: 3,
    label: "Chapter III — The Four-Colour Code",
    title: "Burgundy, Off-White & Charcoal",
    subtitle: "One cohesive palette across every drop.",
    description:
      "Designed in India with a disciplined four-colour spectrum so every piece across drops mixes effortlessly. Minimal distraction, unmistakable presence.",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1400&q=80",
    ctaText: "View All Drops",
    ctaLink: "/shop",
  },
];
