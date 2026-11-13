// src/data/demo-studios.ts
// Deterministic demo studio catalog used to seed the marketplace.
//
// Every listing has its own stable ObjectId, host, gallery, description,
// facilities, pricing, and booking terms. Re-running the seed script updates
// these documents in place instead of creating duplicates.

import { createHash } from "node:crypto";
import type {
  Address,
  StudioBookingContext,
  StudioCategory,
  StudioStatus,
} from "../models/studio.model.js";

const UNSPLASH_IMAGE_BASE = "https://images.unsplash.com/photo-";

/** Build a full-size, auto-formatted Unsplash image URL. */
function unsplash(photoId: string): string {
  return `${UNSPLASH_IMAGE_BASE}${photoId}?auto=format&fit=crop&w=1600&q=80`;
}

/** Derive a stable 24-character hexadecimal MongoDB ObjectId. */
function stableDemoId(kind: "studio" | "host", value: string): string {
  return createHash("sha1")
    .update(`studiospace-demo-${kind}:${value}`)
    .digest("hex")
    .slice(0, 24);
}

export interface DemoHost {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  joinedAt: Date;
}

export interface DemoStudioSeed {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: StudioCategory;
  location: Address;
  pricePerHour: number;
  capacity: number;
  features: string[];
  images: string[];
  booking: StudioBookingContext;
  hostEmail: string;
  status: StudioStatus;
  createdAt: Date;
  updatedAt: Date;
}

function defineHost(
  input: Omit<DemoHost, "_id" | "joinedAt"> & { joinedAt: string }
): DemoHost {
  return {
    ...input,
    _id: stableDemoId("host", input.email),
    joinedAt: new Date(input.joinedAt),
  };
}

function booking(
  overrides: Partial<StudioBookingContext> = {}
): StudioBookingContext {
  return {
    minimumHours: 2,
    maximumHours: 8,
    leadTimeDays: 1,
    cancellationPolicy:
      "Free cancellation up to 48 hours before the booking starts.",
    instantBook: false,
    availability: "Daily, 8:00 AM - 10:00 PM",
    depositPercentage: 20,
    ...overrides,
  };
}

type DemoStudioInput = Omit<
  DemoStudioSeed,
  "_id" | "status" | "createdAt" | "updatedAt"
> & {
  createdAt?: string;
};

function defineStudio(input: DemoStudioInput): DemoStudioSeed {
  const createdAt = new Date(
    input.createdAt ?? "2025-06-01T12:00:00.000Z"
  );

  return {
    ...input,
    _id: stableDemoId("studio", input.slug),
    status: "published",
    createdAt,
    updatedAt: createdAt,
  };
}

/**
 * One host per listing. Emails use the reserved `.test` TLD so they can never
 * collide with a real StudioSpace account.
 */
export const DEMO_HOSTS: DemoHost[] = [
  defineHost({
    name: "Maya Chen",
    email: "maya.chen@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    joinedAt: "2023-02-14T00:00:00.000Z",
  }),
  defineHost({
    name: "Idris Laurent",
    email: "idris.laurent@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    joinedAt: "2023-06-09T00:00:00.000Z",
  }),
  defineHost({
    name: "Sana Patel",
    email: "sana.patel@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    joinedAt: "2024-01-21T00:00:00.000Z",
  }),
  defineHost({
    name: "Elena Vasquez",
    email: "elena.vasquez@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    joinedAt: "2023-11-06T00:00:00.000Z",
  }),
  defineHost({
    name: "Tom Whitfield",
    email: "tom.whitfield@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    joinedAt: "2024-04-18T00:00:00.000Z",
  }),
  defineHost({
    name: "Ines Carvalho",
    email: "ines.carvalho@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
    joinedAt: "2024-07-30T00:00:00.000Z",
  }),
  defineHost({
    name: "Marcus Reed",
    email: "marcus.reed@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    joinedAt: "2023-03-11T00:00:00.000Z",
  }),
  defineHost({
    name: "Priya Nair",
    email: "priya.nair@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    joinedAt: "2024-02-27T00:00:00.000Z",
  }),
  defineHost({
    name: "Jonas Weber",
    email: "jonas.weber@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    joinedAt: "2023-09-15T00:00:00.000Z",
  }),
  defineHost({
    name: "Sofia Reyes",
    email: "sofia.reyes@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/women/6.jpg",
    joinedAt: "2024-05-22T00:00:00.000Z",
  }),
  defineHost({
    name: "Daniel Cho",
    email: "daniel.cho@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/men/5.jpg",
    joinedAt: "2024-08-03T00:00:00.000Z",
  }),
  defineHost({
    name: "Camila Torres",
    email: "camila.torres@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/women/7.jpg",
    joinedAt: "2023-12-01T00:00:00.000Z",
  }),
  defineHost({
    name: "Nia Brooks",
    email: "nia.brooks@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/women/8.jpg",
    joinedAt: "2024-03-08T00:00:00.000Z",
  }),
  defineHost({
    name: "Oliver Grant",
    email: "oliver.grant@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    joinedAt: "2023-05-19T00:00:00.000Z",
  }),
  defineHost({
    name: "Tessa Nguyen",
    email: "tessa.nguyen@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/women/9.jpg",
    joinedAt: "2024-06-14T00:00:00.000Z",
  }),
  defineHost({
    name: "Aaron Kim",
    email: "aaron.kim@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    joinedAt: "2024-01-09T00:00:00.000Z",
  }),
  defineHost({
    name: "Ruby Sinclair",
    email: "ruby.sinclair@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/women/10.jpg",
    joinedAt: "2023-10-25T00:00:00.000Z",
  }),
  defineHost({
    name: "Theo Marshall",
    email: "theo.marshall@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/men/8.jpg",
    joinedAt: "2024-09-02T00:00:00.000Z",
  }),
  defineHost({
    name: "Andre Lewis",
    email: "andre.lewis@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/men/9.jpg",
    joinedAt: "2023-07-07T00:00:00.000Z",
  }),
  defineHost({
    name: "Lotte de Vries",
    email: "lotte.devries@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/women/11.jpg",
    joinedAt: "2024-04-04T00:00:00.000Z",
  }),
  defineHost({
    name: "Callum Price",
    email: "callum.price@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    joinedAt: "2023-08-12T00:00:00.000Z",
  }),
  defineHost({
    name: "Julian Okafor",
    email: "julian.okafor@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg",
    joinedAt: "2024-10-17T00:00:00.000Z",
  }),
  defineHost({
    name: "Hana Kim",
    email: "hana.kim@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg",
    joinedAt: "2024-02-02T00:00:00.000Z",
  }),
  defineHost({
    name: "Lucas Meyer",
    email: "lucas.meyer@demo.studiospace.test",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    joinedAt: "2023-04-28T00:00:00.000Z",
  }),
];

export const DEMO_STUDIOS: DemoStudioSeed[] = [
  // -------------------------------------------------------------------------
  // Photography
  // -------------------------------------------------------------------------
  defineStudio({
    slug: "northlight-loft-studio",
    title: "Northlight Loft Studio",
    description:
      "A sun-drenched loft in Greenpoint with 12-foot windows, white oak floors, and a built-in seamless backdrop. The space is set up for editorial, portrait, and product work, with strobes and a tethering station ready on arrival. Freight access makes it easy to bring in sets and larger crews.",
    category: "photography",
    location: {
      street: "214 Greenpoint Ave",
      city: "Brooklyn",
      state: "NY",
      zip: "11222",
      country: "United States",
    },
    pricePerHour: 95,
    capacity: 12,
    features: [
      "12-foot seamless backdrop",
      "Profoto B10 strobes",
      "Natural north light",
      "Tethering station",
      "Hair and makeup room",
      "Freight elevator",
      "Client lounge",
      "Fast Wi-Fi",
    ],
    images: [unsplash("1554048612-b6a482bc67e5"), unsplash("1513694203232-719a280e022f"), unsplash("1497366811353-6870744d04b2")],
    booking: booking({
      minimumHours: 2,
      maximumHours: 10,
      leadTimeDays: 1,
      instantBook: true,
      availability: "Daily, 7:00 AM - 11:00 PM",
      depositPercentage: 20,
    }),
    hostEmail: "maya.chen@demo.studiospace.test",
  }),
  defineStudio({
    slug: "atelier-noir-portrait-lab",
    title: "Atelier Noir Portrait Lab",
    description:
      "A blackout portrait studio in the Marais designed for controlled, moody lighting. The room comes with a full strobe kit, grip, and a color-calibrated retouching station. A separate styling suite gives talent privacy between looks.",
    category: "photography",
    location: {
      street: "18 Rue des Archives",
      city: "Paris",
      zip: "75004",
      country: "France",
    },
    pricePerHour: 120,
    capacity: 8,
    features: [
      "Blackout curtains",
      "Profoto strobe kit",
      "85mm and 50mm primes",
      "Color-calibrated monitor",
      "Styling suite",
      "Client lounge",
      "Wi-Fi",
      "Sound treatment",
    ],
    images: [unsplash("1542038784456-1ea8e935640e"), unsplash("1600607687939-ce8a6c25118c"), unsplash("1600210492486-724fe5c67fb0")],
    booking: booking({
      minimumHours: 3,
      maximumHours: 8,
      leadTimeDays: 2,
      cancellationPolicy:
        "Full refund up to 7 days before the booking; 50% refund within 7 days.",
      availability: "Tuesday - Sunday, 9:00 AM - 9:00 PM",
      depositPercentage: 25,
    }),
    hostEmail: "idris.laurent@demo.studiospace.test",
  }),
  defineStudio({
    slug: "juniper-glasshouse-studio",
    title: "Juniper Glasshouse Studio",
    description:
      "A plant-filled glasshouse studio with soft, diffused daylight from three sides. It is a favorite for lifestyle, brand, and portrait shoots that need a natural, airy look. Styling racks, a small cyclorama, and a rolling strobe kit are included.",
    category: "photography",
    location: {
      street: "412 SE Clay St",
      city: "Portland",
      state: "OR",
      zip: "97214",
      country: "United States",
    },
    pricePerHour: 85,
    capacity: 10,
    features: [
      "Glasshouse natural light",
      "20+ plant installations",
      "Seamless cyclorama",
      "Rolling strobe kit",
      "Styling racks",
      "Steamer",
      "Client lounge",
      "Wi-Fi",
    ],
    images: [unsplash("1586023492125-27b2c045efd7"), unsplash("1600607687920-4e2a09cf159d"), unsplash("1497215728101-856f4ea42174")],
    booking: booking({
      minimumHours: 2,
      maximumHours: 6,
      leadTimeDays: 1,
      instantBook: true,
      availability: "Daily, 8:00 AM - 8:00 PM",
      depositPercentage: 15,
    }),
    hostEmail: "sana.patel@demo.studiospace.test",
  }),
  defineStudio({
    slug: "studio-meridian-white-cyc",
    title: "Studio Meridian White Cyc",
    description:
      "A production-ready white cyclorama in the Arts District with a 20-foot sweep and drive-in access. The lighting grid is pre-rigged with strobes and continuous lights, and a grip cart is included. Use the adjacent makeup room and lounge for full-day shoots.",
    category: "photography",
    location: {
      street: "908 Mateo St",
      city: "Los Angeles",
      state: "CA",
      zip: "90021",
      country: "United States",
    },
    pricePerHour: 150,
    capacity: 20,
    features: [
      "20-foot white cyc",
      "Drive-in access",
      "Pre-rigged lighting grid",
      "Grip cart",
      "Makeup room",
      "Client lounge",
      "Loading bay",
      "Wi-Fi",
    ],
    images: [unsplash("1517502884422-41eaead166d4"), unsplash("1505691938895-1758d7feb511"), unsplash("1616486338812-3dadae4b4ace")],
    booking: booking({
      minimumHours: 4,
      maximumHours: 12,
      leadTimeDays: 2,
      cancellationPolicy:
        "Free cancellation up to 72 hours before the booking starts.",
      availability: "Monday - Saturday, 6:00 AM - 10:00 PM",
      depositPercentage: 30,
    }),
    hostEmail: "elena.vasquez@demo.studiospace.test",
  }),
  defineStudio({
    slug: "the-brickyard-photo-house",
    title: "The Brickyard Photo House",
    description:
      "An industrial photo house with exposed brick, original steel windows, and polished concrete floors. The main room suits fashion and product work, while the smaller room is set up for portraits and content. A freight lift opens directly into the shooting space.",
    category: "photography",
    location: {
      street: "27 Cotton Street",
      city: "Manchester",
      zip: "M4 5FJ",
      country: "United Kingdom",
    },
    pricePerHour: 70,
    capacity: 14,
    features: [
      "Exposed brick walls",
      "Original steel windows",
      "Blackout blinds",
      "Strobe kit",
      "Changing room",
      "Freight lift",
      "Wi-Fi",
      "Bluetooth sound",
    ],
    images: [unsplash("1618221195710-dd6b41faaea6"), unsplash("1497366754035-f200968a6e72"), unsplash("1615874959474-d609969a20ed")],
    booking: booking({
      minimumHours: 2,
      maximumHours: 8,
      leadTimeDays: 1,
      cancellationPolicy:
        "Free cancellation up to 24 hours before the booking starts.",
      instantBook: true,
      availability: "Daily, 9:00 AM - 10:00 PM",
      depositPercentage: 0,
    }),
    hostEmail: "tom.whitfield@demo.studiospace.test",
  }),
  defineStudio({
    slug: "golden-hour-rooftop-studio",
    title: "Golden Hour Rooftop Studio",
    description:
      "A rooftop studio with a west-facing terrace that catches golden light all afternoon. The interior offers a clean white shooting area, while the terrace is ideal for lifestyle, couple, and brand content. Portable strobes and a retractable shade keep the schedule flexible.",
    category: "photography",
    location: {
      street: "Rua da Boavista 84",
      city: "Lisbon",
      zip: "1200-068",
      country: "Portugal",
    },
    pricePerHour: 110,
    capacity: 16,
    features: [
      "West-facing rooftop terrace",
      "Portable strobe kit",
      "Retractable shade",
      "White shooting wall",
      "Styling room",
      "Elevator access",
      "Wi-Fi",
      "Outdoor seating",
    ],
    images: [unsplash("1600585154340-be6161a56a0c"), unsplash("1540518614846-7eded433c457"), unsplash("1616486029423-aaa4789e8c9a")],
    booking: booking({
      minimumHours: 2,
      maximumHours: 6,
      leadTimeDays: 3,
      cancellationPolicy:
        "Full refund up to 5 days before the booking; 50% refund within 5 days.",
      availability: "Daily, 10:00 AM - sunset",
      depositPercentage: 20,
    }),
    hostEmail: "ines.carvalho@demo.studiospace.test",
  }),

  // -------------------------------------------------------------------------
  // Film & Video
  // -------------------------------------------------------------------------
  defineStudio({
    slug: "signal-stage-4",
    title: "Signal Stage 4",
    description:
      "A 2,800-square-foot sound stage with an 18-foot green screen and a full lighting grid. The stage is sound-treated, climate-controlled, and supported by a control room and camera prep area. A loading bay opens directly onto the floor for fast load-in.",
    category: "film",
    location: {
      street: "1200 Marietta St NW",
      city: "Atlanta",
      state: "GA",
      zip: "30318",
      country: "United States",
    },
    pricePerHour: 220,
    capacity: 30,
    features: [
      "2,800 sq ft sound stage",
      "18-foot green screen",
      "Lighting grid",
      "Control room",
      "Camera prep bay",
      "Sound treatment",
      "Loading bay",
      "Parking",
    ],
    images: [unsplash("1505373877841-8d25f7d46678"), unsplash("1504384308090-c894fdcc538d"), unsplash("1524178232363-1fb2b075b655")],
    booking: booking({
      minimumHours: 4,
      maximumHours: 12,
      leadTimeDays: 3,
      cancellationPolicy:
        "Full refund up to 7 days before the booking; 50% refund within 7 days.",
      availability: "Monday - Saturday, 7:00 AM - 11:00 PM",
      depositPercentage: 30,
    }),
    hostEmail: "marcus.reed@demo.studiospace.test",
  }),
  defineStudio({
    slug: "harborline-motion-studio",
    title: "Harborline Motion Studio",
    description:
      "A blackout motion studio near the waterfront with a 16-foot cyc wall and a dedicated camera prep bay. The space is built for commercials, music videos, and interview setups, with a jib-friendly ceiling and a quiet HVAC system. An edit suite is available for same-day reviews.",
    category: "film",
    location: {
      street: "55 Water St",
      city: "Vancouver",
      state: "BC",
      zip: "V6B 1A1",
      country: "Canada",
    },
    pricePerHour: 180,
    capacity: 25,
    features: [
      "16-foot cyc wall",
      "Blackout stage",
      "Camera prep bay",
      "Jib-friendly ceiling",
      "Soundproof walls",
      "Edit suite",
      "Loading dock",
      "Wi-Fi",
    ],
    images: [unsplash("1470229722913-7c0e2dbbafd3"), unsplash("1521737711867-e3b97375f902"), unsplash("1522071820081-009f0129c71c")],
    booking: booking({
      minimumHours: 4,
      maximumHours: 10,
      leadTimeDays: 2,
      cancellationPolicy:
        "Free cancellation up to 72 hours before the booking starts.",
      instantBook: true,
      availability: "Daily, 7:00 AM - 10:00 PM",
      depositPercentage: 25,
    }),
    hostEmail: "priya.nair@demo.studiospace.test",
  }),
  defineStudio({
    slug: "cinewerk-berlin",
    title: "Cinewerk Berlin",
    description:
      "A Kreuzberg film studio with a 16-foot cyclorama, ARRI lighting package, and a separate sound booth. The space is designed for narrative shoots, interviews, and tabletop work, with a production office next door. Grip and camera packages can be added to the booking.",
    category: "film",
    location: {
      street: "Kopenicker Str. 40",
      city: "Berlin",
      zip: "10179",
      country: "Germany",
    },
    pricePerHour: 200,
    capacity: 22,
    features: [
      "ARRI lighting package",
      "16-foot cyclorama",
      "Sound booth",
      "Grip equipment",
      "Production office",
      "Blackout curtains",
      "Freight lift",
      "Wi-Fi",
    ],
    images: [unsplash("1524368535928-5b5e00ddc76b"), unsplash("1552664730-d307ca884978"), unsplash("1556761175-5973dc0f32e7")],
    booking: booking({
      minimumHours: 4,
      maximumHours: 12,
      leadTimeDays: 3,
      cancellationPolicy:
        "Full refund up to 7 days before the booking; 50% refund within 7 days.",
      availability: "Monday - Saturday, 8:00 AM - 10:00 PM",
      depositPercentage: 30,
    }),
    hostEmail: "jonas.weber@demo.studiospace.test",
  }),
  defineStudio({
    slug: "redline-screening-and-shoot-space",
    title: "Redline Screening & Shoot Space",
    description:
      "A hybrid screening room and shoot space with a 4K projector, blackout drapes, and a flexible stage area. It works equally well for castings, interviews, and client presentations. Camera and audio packages are available on site.",
    category: "film",
    location: {
      street: "3100 E 5th St",
      city: "Austin",
      state: "TX",
      zip: "78702",
      country: "United States",
    },
    pricePerHour: 130,
    capacity: 18,
    features: [
      "4K projection",
      "Screening room",
      "Blackout curtains",
      "Camera packages",
      "Edit suite",
      "Client lounge",
      "Wi-Fi",
      "Kitchen",
    ],
    images: [unsplash("1493225457124-a3eb161ffa5f"), unsplash("1519389950473-47ba0277781c"), unsplash("1600573472592-401b489a3cdc")],
    booking: booking({
      minimumHours: 3,
      maximumHours: 8,
      leadTimeDays: 1,
      instantBook: true,
      availability: "Daily, 9:00 AM - 11:00 PM",
      depositPercentage: 15,
    }),
    hostEmail: "sofia.reyes@demo.studiospace.test",
  }),
  defineStudio({
    slug: "the-cutting-room-stage",
    title: "The Cutting Room Stage",
    description:
      "A post-production studio with a color grading bay, voice-over booth, and a small shooting stage. It is built for finishing work and pickups, with calibrated monitors and a quiet, treated room. The kitchen and lounge make long sessions comfortable.",
    category: "film",
    location: {
      street: "88 Ossington Ave",
      city: "Toronto",
      state: "ON",
      zip: "M6J 2Z4",
      country: "Canada",
    },
    pricePerHour: 160,
    capacity: 10,
    features: [
      "Color grading bay",
      "Voice-over booth",
      "Calibrated monitors",
      "Small shooting stage",
      "Camera prep area",
      "Kitchen",
      "Client lounge",
      "Wi-Fi",
    ],
    images: [unsplash("1506157786151-b8491531f063"), unsplash("1542744173-8e7e53415bb0"), unsplash("1556761175-b413da4baf72")],
    booking: booking({
      minimumHours: 3,
      maximumHours: 8,
      leadTimeDays: 2,
      availability: "Monday - Friday, 9:00 AM - 9:00 PM",
      depositPercentage: 20,
    }),
    hostEmail: "daniel.cho@demo.studiospace.test",
  }),
  defineStudio({
    slug: "palm-frame-studios",
    title: "Palm Frame Studios",
    description:
      "A bright Miami studio with a 24-foot cyclorama, drive-in stage, and tropical courtyard. The main floor handles fashion, music videos, and product work, while the courtyard adds an outdoor option without leaving the property. Lighting and grip are included in the day rate.",
    category: "film",
    location: {
      street: "1740 NW 22nd St",
      city: "Miami",
      state: "FL",
      zip: "33142",
      country: "United States",
    },
    pricePerHour: 175,
    capacity: 28,
    features: [
      "24-foot cyclorama",
      "Drive-in stage",
      "Lighting grid",
      "Grip equipment",
      "Tropical courtyard",
      "Makeup room",
      "Wi-Fi",
      "Parking",
    ],
    images: [unsplash("1560448204-e02f11c3d0e2"), unsplash("1524758631624-e2822e304c36"), unsplash("1600566753086-00f18fb6b3ea")],
    booking: booking({
      minimumHours: 4,
      maximumHours: 12,
      leadTimeDays: 2,
      cancellationPolicy:
        "Free cancellation up to 72 hours before the booking starts.",
      instantBook: true,
      availability: "Daily, 7:00 AM - 11:00 PM",
      depositPercentage: 25,
    }),
    hostEmail: "camila.torres@demo.studiospace.test",
  }),

  // -------------------------------------------------------------------------
  // Podcast
  // -------------------------------------------------------------------------
  defineStudio({
    slug: "the-vinyl-booth",
    title: "The Vinyl Booth",
    description:
      "A warm, wood-lined podcast studio in East Nashville with broadcast mics and a four-person table. The room is treated for clean voice capture and set up for both audio and video episodes. A green room and editing station are included.",
    category: "podcast",
    location: {
      street: "1206 Gallatin Ave",
      city: "Nashville",
      state: "TN",
      zip: "37206",
      country: "United States",
    },
    pricePerHour: 60,
    capacity: 6,
    features: [
      "Broadcast dynamic mics",
      "Acoustic wall panels",
      "Rodecaster Pro",
      "Video podcast cameras",
      "Four-person table",
      "Green room",
      "Editing station",
      "Wi-Fi",
    ],
    images: [unsplash("1511671782779-c97d3d27a1d4"), unsplash("1571330735066-03aaa9429d89")],
    booking: booking({
      minimumHours: 2,
      maximumHours: 4,
      leadTimeDays: 1,
      cancellationPolicy:
        "Free cancellation up to 24 hours before the booking starts.",
      instantBook: true,
      availability: "Daily, 8:00 AM - 10:00 PM",
      depositPercentage: 0,
    }),
    hostEmail: "nia.brooks@demo.studiospace.test",
  }),
  defineStudio({
    slug: "frequency-room-2",
    title: "Frequency Room 2",
    description:
      "A soundproof podcast booth in Shoreditch with Shure SM7B mics and a relaxed interview setup. The studio supports up to four hosts and remote guests, with headphones and a producer station. Episodes can be edited and delivered the same day.",
    category: "podcast",
    location: {
      street: "46 Curtain Rd",
      city: "London",
      zip: "EC2A 3PT",
      country: "United Kingdom",
    },
    pricePerHour: 75,
    capacity: 4,
    features: [
      "Soundproof booth",
      "Shure SM7B mics",
      "Four-person table",
      "Remote guest line",
      "Producer station",
      "Headphones",
      "Editing suite",
      "Wi-Fi",
    ],
    images: [unsplash("1478737270239-2f02b77fc618"), unsplash("1461749280684-dccba630e2f6")],
    booking: booking({
      minimumHours: 2,
      maximumHours: 5,
      leadTimeDays: 1,
      availability: "Monday - Saturday, 9:00 AM - 9:00 PM",
      depositPercentage: 20,
    }),
    hostEmail: "oliver.grant@demo.studiospace.test",
  }),
  defineStudio({
    slug: "mic-drop-midtown",
    title: "Mic Drop Midtown",
    description:
      "A compact Midtown studio built for fast, polished podcast and video sessions. The room includes three mic positions, a teleprompter, and soft video lighting. It is a short walk from Penn Station and set up for same-day turnaround.",
    category: "podcast",
    location: {
      street: "244 W 39th St",
      city: "New York",
      state: "NY",
      zip: "10018",
      country: "United States",
    },
    pricePerHour: 90,
    capacity: 5,
    features: [
      "Three mic setup",
      "Acoustic treatment",
      "Video recording",
      "Teleprompter",
      "Softbox lighting",
      "Client lounge",
      "Wi-Fi",
      "Same-day editing",
    ],
    images: [unsplash("1589903308904-1010c2294adc"), unsplash("1516321318423-f06f85e504b3")],
    booking: booking({
      minimumHours: 1,
      maximumHours: 3,
      leadTimeDays: 0,
      cancellationPolicy:
        "Free cancellation up to 24 hours before the booking starts.",
      instantBook: true,
      availability: "Daily, 7:00 AM - 9:00 PM",
      depositPercentage: 0,
    }),
    hostEmail: "tessa.nguyen@demo.studiospace.test",
  }),
  defineStudio({
    slug: "quiet-signal-studio",
    title: "Quiet Signal Studio",
    description:
      "A double-wall soundproof studio in Capitol Hill with a floating floor and four mic inputs. It is designed for narrative podcasts, audiobooks, and voice-over work that needs a very low noise floor. A remote producer can join through the house line.",
    category: "podcast",
    location: {
      street: "1515 12th Ave",
      city: "Seattle",
      state: "WA",
      zip: "98122",
      country: "United States",
    },
    pricePerHour: 80,
    capacity: 4,
    features: [
      "Floating floor",
      "Double-wall insulation",
      "Four mic inputs",
      "Remote guest line",
      "Editing station",
      "Voice-over booth",
      "Wi-Fi",
      "Green room",
    ],
    images: [unsplash("1516280440614-37939bbacd81"), unsplash("1497366216548-37526070297c")],
    booking: booking({
      minimumHours: 2,
      maximumHours: 6,
      leadTimeDays: 1,
      availability: "Daily, 8:00 AM - 8:00 PM",
      depositPercentage: 15,
    }),
    hostEmail: "aaron.kim@demo.studiospace.test",
  }),
  defineStudio({
    slug: "the-story-loft",
    title: "The Story Loft",
    description:
      "A character-filled loft in Collingwood with warm wood acoustics and space for four hosts. The studio is set up for interview shows and video podcasts, with wireless mics and a simple camera package. A kitchen and lounge make longer sessions easy.",
    category: "podcast",
    location: {
      street: "36 Johnston St",
      city: "Melbourne",
      state: "VIC",
      zip: "3066",
      country: "Australia",
    },
    pricePerHour: 65,
    capacity: 8,
    features: [
      "Warm wood acoustics",
      "Wireless mics",
      "Four-host setup",
      "Video podcast kit",
      "Kitchen",
      "Green room",
      "Wi-Fi",
      "Editing station",
    ],
    images: [unsplash("1485579149621-3123dd979885"), unsplash("1600585152220-90363fe7e115")],
    booking: booking({
      minimumHours: 2,
      maximumHours: 5,
      leadTimeDays: 1,
      instantBook: true,
      availability: "Daily, 9:00 AM - 10:00 PM",
      depositPercentage: 10,
    }),
    hostEmail: "ruby.sinclair@demo.studiospace.test",
  }),
  defineStudio({
    slug: "studio-88-podcast-house",
    title: "Studio 88 Podcast House",
    description:
      "A purpose-built podcast house in River North with two recording rooms and a shared production lounge. The main room handles six mics and video, while the smaller room is ideal for solo voice-over. Engineers and editing packages are available on request.",
    category: "podcast",
    location: {
      street: "900 N Franklin St",
      city: "Chicago",
      state: "IL",
      zip: "60610",
      country: "United States",
    },
    pricePerHour: 100,
    capacity: 10,
    features: [
      "Two podcast rooms",
      "Six mic inputs",
      "Rodecaster Pro",
      "Video lighting",
      "Production lounge",
      "Voice-over booth",
      "Wi-Fi",
      "Editing services",
    ],
    images: [unsplash("1581368135153-a506cf13b1e1"), unsplash("1600566752355-35792bedcfea")],
    booking: booking({
      minimumHours: 2,
      maximumHours: 8,
      leadTimeDays: 2,
      cancellationPolicy:
        "Free cancellation up to 72 hours before the booking starts.",
      availability: "Monday - Saturday, 8:00 AM - 10:00 PM",
      depositPercentage: 20,
    }),
    hostEmail: "theo.marshall@demo.studiospace.test",
  }),

  // -------------------------------------------------------------------------
  // Music
  // -------------------------------------------------------------------------
  defineStudio({
    slug: "baseline-recording-room",
    title: "Baseline Recording Room",
    description:
      "A classic Detroit recording room with an SSL console, a tuned live room, and a separate drum booth. The mic locker covers vocals, drums, and amps, and the lounge is set up for long sessions. An engineer can be added to any booking.",
    category: "music",
    location: {
      street: "1465 E Jefferson Ave",
      city: "Detroit",
      state: "MI",
      zip: "48207",
      country: "United States",
    },
    pricePerHour: 140,
    capacity: 12,
    features: [
      "SSL console",
      "Tuned live room",
      "Drum booth",
      "Grand piano",
      "Mic locker",
      "Amp collection",
      "Lounge",
      "Wi-Fi",
    ],
    images: [unsplash("1598488035139-bdbb2231ce04"), unsplash("1600566753190-17f0baa2a6c3")],
    booking: booking({
      minimumHours: 4,
      maximumHours: 12,
      leadTimeDays: 3,
      cancellationPolicy:
        "Full refund up to 7 days before the booking; 50% refund within 7 days.",
      availability: "Daily, 10:00 AM - 2:00 AM",
      depositPercentage: 30,
    }),
    hostEmail: "andre.lewis@demo.studiospace.test",
  }),
  defineStudio({
    slug: "amber-sound-lab",
    title: "Amber Sound Lab",
    description:
      "A production and mixing suite in Westerpark with Neve preamps, a vocal booth, and trusted monitoring. It is built for writing, vocal sessions, and final mixes, with a compact synth collection on hand. The room is quiet, comfortable, and easy to settle into.",
    category: "music",
    location: {
      street: "22 Westerstraat",
      city: "Amsterdam",
      zip: "1015",
      country: "Netherlands",
    },
    pricePerHour: 95,
    capacity: 6,
    features: [
      "Neve preamps",
      "Vocal booth",
      "Adam monitors",
      "Synth collection",
      "Mixing desk",
      "Lounge",
      "Wi-Fi",
      "Coffee bar",
    ],
    images: [unsplash("1598653222000-6b7b7a552625"), unsplash("1600607688969-a5bfcd646154")],
    booking: booking({
      minimumHours: 3,
      maximumHours: 8,
      leadTimeDays: 1,
      instantBook: true,
      availability: "Daily, 9:00 AM - 11:00 PM",
      depositPercentage: 15,
    }),
    hostEmail: "lotte.devries@demo.studiospace.test",
  }),
  defineStudio({
    slug: "the-rehearsal-warehouse",
    title: "The Rehearsal Warehouse",
    description:
      "A full-band rehearsal warehouse in Sheffield with backline, a drum riser, and a house PA. The room is acoustically treated and big enough for a five-piece band plus crew. Load-in is step-free and there is a green room at the back.",
    category: "music",
    location: {
      street: "Unit 6, 40 Sylvester St",
      city: "Sheffield",
      zip: "S1 2AB",
      country: "United Kingdom",
    },
    pricePerHour: 45,
    capacity: 15,
    features: [
      "Full backline",
      "Drum riser",
      "House PA",
      "Acoustic treatment",
      "Mirror wall",
      "Green room",
      "Step-free load-in",
      "Wi-Fi",
    ],
    images: [unsplash("1511379938547-c1f69419868d"), unsplash("1600585154526-990dced4db0d")],
    booking: booking({
      minimumHours: 2,
      maximumHours: 6,
      leadTimeDays: 0,
      cancellationPolicy:
        "Free cancellation up to 24 hours before the booking starts.",
      instantBook: true,
      availability: "Daily, 10:00 AM - 11:00 PM",
      depositPercentage: 0,
    }),
    hostEmail: "callum.price@demo.studiospace.test",
  }),
  defineStudio({
    slug: "velvet-room-live",
    title: "Velvet Room Live",
    description:
      "A live room and small stage in the Marigny with house lighting, a PA, and room for an audience. It is set up for showcases, live sessions, and video shoots, with backline available on site. The adjoining bar and green room make events easy to run.",
    category: "music",
    location: {
      street: "1919 St Claude Ave",
      city: "New Orleans",
      state: "LA",
      zip: "70116",
      country: "United States",
    },
    pricePerHour: 120,
    capacity: 40,
    features: [
      "Live room and stage",
      "House PA",
      "Stage lighting",
      "Backline",
      "Green room",
      "Bar area",
      "Wi-Fi",
      "Load-in access",
    ],
    images: [unsplash("1524650359799-842906ca1c06"), unsplash("1600607688960-e095ff83135c")],
    booking: booking({
      minimumHours: 3,
      maximumHours: 10,
      leadTimeDays: 2,
      cancellationPolicy:
        "Free cancellation up to 72 hours before the booking starts.",
      availability: "Wednesday - Sunday, 12:00 PM - 12:00 AM",
      depositPercentage: 25,
    }),
    hostEmail: "julian.okafor@demo.studiospace.test",
  }),
  defineStudio({
    slug: "orbit-music-suite",
    title: "Orbit Music Suite",
    description:
      "A modern production suite in Mapo with a vocal booth, MIDI setup, and a bright writing room. It is built for K-pop writing camps, demos, and vocal sessions, with fast Wi-Fi and a comfortable lounge. The city view is a nice bonus during long days.",
    category: "music",
    location: {
      street: "31 Wausan-ro, Mapo-gu",
      city: "Seoul",
      zip: "04039",
      country: "South Korea",
    },
    pricePerHour: 110,
    capacity: 8,
    features: [
      "Production suite",
      "Vocal booth",
      "MIDI keyboard",
      "Studio monitors",
      "Writing room",
      "Lounge",
      "City view",
      "Wi-Fi",
    ],
    images: [unsplash("1499415479124-43c32433a620"), unsplash("1519501025264-65ba15a82390")],
    booking: booking({
      minimumHours: 3,
      maximumHours: 8,
      leadTimeDays: 1,
      instantBook: true,
      availability: "Daily, 10:00 AM - 11:00 PM",
      depositPercentage: 15,
    }),
    hostEmail: "hana.kim@demo.studiospace.test",
  }),
  defineStudio({
    slug: "cedar-and-tone-studios",
    title: "Cedar & Tone Studios",
    description:
      "A wood-lined recording studio in Refshaleoen with a grand piano, drum booth, and a warm live room. The studio is built for acoustic, jazz, and indie sessions, with a collection of vintage mics. A kitchen and lounge keep the pace relaxed.",
    category: "music",
    location: {
      street: "12 Refshalevej",
      city: "Copenhagen",
      zip: "1432",
      country: "Denmark",
    },
    pricePerHour: 135,
    capacity: 14,
    features: [
      "Wooden live room",
      "Grand piano",
      "Drum booth",
      "Vintage mics",
      "Amp room",
      "Kitchen",
      "Lounge",
      "Wi-Fi",
    ],
    images: [unsplash("1555066931-4365d14bab8c"), unsplash("1449824913935-59a10b8d2000")],
    booking: booking({
      minimumHours: 4,
      maximumHours: 10,
      leadTimeDays: 2,
      cancellationPolicy:
        "Full refund up to 5 days before the booking; 50% refund within 5 days.",
      availability: "Monday - Saturday, 9:00 AM - 11:00 PM",
      depositPercentage: 20,
    }),
    hostEmail: "lucas.meyer@demo.studiospace.test",
  }),
];
