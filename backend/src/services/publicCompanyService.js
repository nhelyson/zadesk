import { prisma } from "../lib/prisma.js";
import { cacheService } from "../cache/cacheService.js";

// Baseline reference catalog for Congolese enterprises to ensure instant discovery
export const SEED_COMPANIES = [
  {
    name: "Airtel Congo",
    slug: "airtel-congo",
    category: "Télécommunications",
    description: "Opérateur de téléphonie mobile, fournisseur d'accès internet haut débit 4G et services financiers Airtel Money en République du Congo.",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80",
    verified: true,
    isPublic: true,
    website: "https://www.airtel.cg",
    supportPhone: "+242055000000",
    supportEmail: "serviceclient@cg.airtel.com",
    supportWhatsApp: "+242055000111",
    address: "Boulevard Denis Sassou Nguesso, Mpila",
    city: "Brazzaville",
    country: "Congo",
    openingHours: "Lun - Sam : 07h30 - 19h00 | Dim : 08h00 - 14h00",
    supportCategories: [
      "Airtel Money & Transactions",
      "Forfaits Internet & 4G",
      "Perte / Remplacement SIM",
      "Facturation & Recharge",
      "Assistance Technique Réseau"
    ]
  },
  {
    name: "MTN Congo",
    slug: "mtn-congo",
    category: "Télécommunications",
    description: "Leader des télécommunications mobiles et de l'innovation digitale (MoMo, 4G LTE, Fibre) au Congo.",
    logoUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&auto=format&fit=crop&q=80",
    verified: true,
    isPublic: true,
    website: "https://www.mtn.cg",
    supportPhone: "+242066000000",
    supportEmail: "customercare.cg@mtn.com",
    supportWhatsApp: "+242066000123",
    address: "Avenue Amilcar Cabral, Centre-Ville",
    city: "Brazzaville",
    country: "Congo",
    openingHours: "Lun - Ven : 08h00 - 17h30 | Sam : 08h30 - 13h00",
    supportCategories: [
      "MoMo (Mobile Money) & Déblocage",
      "Pass Internet & Offres Yamo",
      "Problème Réseau & Connexion",
      "Identification & KYC Légal",
      "Offres Entreprises & Fibre"
    ]
  },
  {
    name: "Canal+ Congo",
    slug: "canal-plus-congo",
    category: "Médias & Divertissement",
    description: "Distributeur officiel des bouquets de chaînes télévisées et offres numériques par satellite et fibre au Congo.",
    logoUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80",
    verified: true,
    isPublic: true,
    website: "https://www.canalplus-afrique.com/cg",
    supportPhone: "+242055555050",
    supportEmail: "contact.congo@canal-plus.com",
    supportWhatsApp: "+242069002233",
    address: "Avenue Nelson Mandela",
    city: "Brazzaville",
    country: "Congo",
    openingHours: "Lun - Sam : 08h00 - 18h30",
    supportCategories: [
      "Réabonnement & Décodeur",
      "Code d'erreur (E16, E30...)",
      "Changement de Formule",
      "Installation Parabole & SAV Matériel",
      "Application CANAL+"
    ]
  },
  {
    name: "Ecobank Congo",
    slug: "ecobank-congo",
    category: "Banque & Finance",
    description: "Groupe bancaire panafricain offrant services bancaires aux particuliers, PME, grandes entreprises et solutions digitales Ecobank Mobile.",
    logoUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
    verified: true,
    isPublic: true,
    website: "https://www.ecobank.com/cg",
    supportPhone: "+242066606060",
    supportEmail: "ecobankenquiries@ecobank.com",
    supportWhatsApp: "+242055202020",
    address: "Immeuble Ecobank, Rond-point de la Poste",
    city: "Brazzaville",
    country: "Congo",
    openingHours: "Lun - Ven : 08h00 - 16h00 | Sam : 09h00 - 12h30",
    supportCategories: [
      "Carte Bancaire (Blocage / Perte)",
      "Application Ecobank Mobile & Omnilite",
      "Virements & Transferts Internationaux",
      "Relevés de Compte & Réclamations",
      "Prêts & Crédits"
    ]
  },
  {
    name: "Énergie Électrique du Congo (E2C)",
    slug: "e2c-congo",
    category: "Énergie & Services Publics",
    description: "Société nationale en charge de la distribution d'électricité, de la gestion des compteurs prépayés et du réseau public en République du Congo.",
    logoUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&auto=format&fit=crop&q=80",
    verified: true,
    isPublic: true,
    website: "https://www.e2c.cg",
    supportPhone: "+242050000022",
    supportEmail: "sav@e2c.cg",
    supportWhatsApp: "+242065002244",
    address: "Avenue Paul Doumer, Plaine",
    city: "Brazzaville",
    country: "Congo",
    openingHours: "24h/24 (Urgences & Pannes) | Agences : 07h30 - 15h30",
    supportCategories: [
      "Signalement de Panne de Secteur",
      "Recharge & Code Compteur Prépayé",
      "Demande de Nouveau Raccordement",
      "Facturation & Réclamation Index",
      "Câble Dangereux / Intervention Rapide"
    ]
  },
  {
    name: "La Congolaise de Banque (LCB)",
    slug: "lcb-bank",
    category: "Banque & Finance",
    description: "Banque commerciale historique du Congo, accompagnant les particuliers, commerçants et entreprises depuis plus de 60 ans.",
    logoUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80",
    verified: true,
    isPublic: true,
    website: "https://www.lcbbank.cg",
    supportPhone: "+242057777777",
    supportEmail: "contact@lcbbank.cg",
    supportWhatsApp: "+242068007788",
    address: "Boulevard Denis Sassou Nguesso, Centre-Ville",
    city: "Brazzaville",
    country: "Congo",
    openingHours: "Lun - Ven : 08h00 - 16h00",
    supportCategories: [
      "Opposition Carte GIMAC & VISA",
      "Assistance E-banking LCB Net",
      "Suivi de Dossier Crédit",
      "Transferts d'argent rapides",
      "Service Clientèle Entreprises"
    ]
  },
  {
    name: "TotalEnergies Marketing Congo",
    slug: "totalenergies-congo",
    category: "Énergie & Services Publics",
    description: "Réseau de stations-services, carburants, lubrifiants, gaz domestique et solutions solaires au Congo.",
    logoUrl: "https://images.unsplash.com/photo-1527018607619-a508a2be00be?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=1200&auto=format&fit=crop&q=80",
    verified: true,
    isPublic: true,
    website: "https://services.totalenergies.cg",
    supportPhone: "+242058888888",
    supportEmail: "sav.clients@totalenergies.cg",
    supportWhatsApp: "+242069008899",
    address: "Avenue de l'Indépendance",
    city: "Pointe-Noire",
    country: "Congo",
    openingHours: "Stations 24h/24 | SAV Bureau : 08h00 - 17h00",
    supportCategories: [
      "Carte Pétrolière & Recharge",
      "Disponibilité Bouteilles de Gaz",
      "Réclamations Station-Service",
      "Partenariats & Commandes Industrielles",
      "Solutions Lampes Solaires"
    ]
  },
  {
    name: "Express Union Congo",
    slug: "express-union-congo",
    category: "Banque & Finance",
    description: "Établissement de microfinance et de transfert d'argent national et sous-régional rapide et sécurisé.",
    logoUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=150&auto=format&fit=crop&q=80",
    coverUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
    verified: true,
    isPublic: true,
    website: "https://www.expressunioncongo.cg",
    supportPhone: "+242053333333",
    supportEmail: "contact@expressunion.cg",
    supportWhatsApp: "+242066778899",
    address: "Avenue des 3 Martyrs, Bacongo",
    city: "Brazzaville",
    country: "Congo",
    openingHours: "Lun - Sam : 07h30 - 18h00",
    supportCategories: [
      "Suivi de Transfert Bloqué / Non Reçu",
      "Compte Express Union Mobile",
      "Erreur d'Identité ou Code Secret",
      "Remboursement Transaction",
      "Localisation d'Agence"
    ]
  }
];

// Helper to ensure public companies exist in the DB
export async function ensureSeedCompanies() {
  try {
    for (const comp of SEED_COMPANIES) {
      const existing = await prisma.workspace.findUnique({
        where: { slug: comp.slug }
      });

      if (!existing) {
        await prisma.workspace.create({
          data: {
            ...comp,
            supportCategories: comp.supportCategories
          }
        });
      } else if (!existing.description || !existing.category) {
        await prisma.workspace.update({
          where: { slug: comp.slug },
          data: {
            ...comp,
            supportCategories: comp.supportCategories
          }
        });
      }
    }
  } catch (err) {
    console.error("[publicCompanyService] Error auto-seeding reference companies:", err.message);
  }
}

// Select only safe public fields
const PUBLIC_COMPANY_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  category: true,
  logoUrl: true,
  coverUrl: true,
  verified: true,
  isPublic: true,
  website: true,
  supportPhone: true,
  supportEmail: true,
  supportWhatsApp: true,
  address: true,
  city: true,
  country: true,
  openingHours: true,
  supportCategories: true,
  createdAt: true,
};

/**
 * List / search public companies with filters
 */
export async function getPublicCompanies({ search = "", category = "", city = "", limit = 20, offset = 0 } = {}) {
  await ensureSeedCompanies();

  const cacheKey = `public:companies:${search.toLowerCase().trim()}:${category.toLowerCase().trim()}:${city.toLowerCase().trim()}:${limit}:${offset}`;

  return cacheService.wrap(cacheKey, async () => {
    const where = {
      isPublic: true,
    };

    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category && category.trim().length > 0 && category !== "all" && category !== "Toutes") {
      where.category = { equals: category.trim(), mode: "insensitive" };
    }

    if (city && city.trim().length > 0 && city !== "all") {
      where.city = { equals: city.trim(), mode: "insensitive" };
    }

    const [total, companies] = await Promise.all([
      prisma.workspace.count({ where }),
      prisma.workspace.findMany({
        where,
        select: PUBLIC_COMPANY_SELECT,
        orderBy: [{ verified: "desc" }, { name: "asc" }],
        take: Number(limit) || 20,
        skip: Number(offset) || 0,
      }),
    ]);

    return {
      companies,
      total,
      limit: Number(limit) || 20,
      offset: Number(offset) || 0,
    };
  }, 180);
}

/**
 * Get popular / featured companies
 */
export async function getPopularPublicCompanies() {
  await ensureSeedCompanies();

  const cacheKey = "public:companies:popular";

  return cacheService.wrap(cacheKey, async () => {
    return prisma.workspace.findMany({
      where: { isPublic: true },
      select: PUBLIC_COMPANY_SELECT,
      orderBy: [{ verified: "desc" }, { createdAt: "asc" }],
      take: 8,
    });
  }, 300);
}

/**
 * Get category aggregates with counts
 */
export async function getPublicCategories() {
  await ensureSeedCompanies();

  const cacheKey = "public:companies:categories";

  return cacheService.wrap(cacheKey, async () => {
    const companies = await prisma.workspace.findMany({
      where: { isPublic: true },
      select: { category: true },
    });

    const categoryMap = {};
    for (const c of companies) {
      const cat = c.category || "Autre";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    }

    return Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count,
    })).sort((a, b) => b.count - a.count);
  }, 300);
}

/**
 * Get single public company by slug
 */
export async function getPublicCompanyBySlug(slug) {
  if (!slug) return null;

  await ensureSeedCompanies();

  const cacheKey = `public:company:${slug.toLowerCase().trim()}`;

  return cacheService.wrap(cacheKey, async () => {
    return prisma.workspace.findFirst({
      where: {
        slug: slug.trim(),
        isPublic: true,
      },
      select: PUBLIC_COMPANY_SELECT,
    });
  }, 300);
}
