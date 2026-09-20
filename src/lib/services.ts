export const services = [
  { slug: "event-security", name: "Event Security", description: "Weddings, concerts, festivals and private events.", icon: "🎟️" },
  { slug: "construction-security", name: "Construction Security", description: "Protect job sites, materials and equipment.", icon: "🏗️" },
  { slug: "unarmed-security", name: "Unarmed Security", description: "Professional uniformed security officers.", icon: "🛡️" },
  { slug: "armed-security", name: "Armed Security", description: "Licensed armed officers for higher-risk assignments.", icon: "🔒" },
  { slug: "mobile-patrol", name: "Mobile Patrol", description: "Scheduled patrols, lock checks and inspections.", icon: "🚓" },
  { slug: "executive-protection", name: "Executive Protection", description: "VIP, executive and personal protection services.", icon: "👤" },
  { slug: "commercial-security", name: "Commercial Property", description: "Offices, retail, warehouses and industrial sites.", icon: "🏢" },
  { slug: "residential-security", name: "Residential Security", description: "Apartments, HOAs and gated communities.", icon: "🏘️" },
  { slug: "fire-watch", name: "Fire Watch", description: "Temporary fire-watch and life-safety coverage.", icon: "🔥" },
  { slug: "healthcare-security", name: "Healthcare Security", description: "Clinics, hospitals and behavioral-health facilities.", icon: "🏥" },
  { slug: "school-security", name: "School & Campus", description: "Educational facilities and campus safety support.", icon: "🎓" },
  { slug: "emergency-security", name: "Emergency Security", description: "Rapid-response coverage for urgent needs.", icon: "⚡" }
] as const;

export type ServiceSlug = (typeof services)[number]["slug"];
