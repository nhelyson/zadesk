export interface PlanConfig {
  id: "decouverte" | "starter" | "pro" | "entreprise";
  canonicalId: "DECOUVERTE" | "STARTER" | "PRO" | "ENTREPRISE";
  name: string;
  tagline: string;
  audience: string;
  price: string;
  priceXaf: number;
  periodLabel: string;
  isPopular?: boolean;
  badge?: string;
  cta: string;
  href: string;
  quotas: {
    agents: string;
    establishments: string;
    whatsapp: string;
    storage: string;
  };
  features: string[];
}

export const OFFICIAL_PLANS_CONFIG: PlanConfig[] = [
  {
    id: "decouverte",
    canonicalId: "DECOUVERTE",
    name: "Découverte",
    tagline: "Offre gratuite permanente pour lancer sa relation client.",
    audience: "Pour tester et lancer le service client de son entreprise sans engagement financier.",
    price: "0",
    priceXaf: 0,
    periodLabel: "FCFA permanent",
    cta: "Commencer gratuitement",
    href: "/register?plan=decouverte",
    quotas: {
      agents: "1 conseiller inclus (propriétaire)",
      establishments: "1 établissement principal",
      whatsapp: "Messagerie web directe",
      storage: "500 Mo de pièces jointes",
    },
    features: [
      "1 agent connecté (propriétaire)",
      "1 établissement principal",
      "Espace public d'entreprise vérifié",
      "Messagerie web directe Zadesk sans compte client",
      "Chat instantané sans compte ni application pour le client",
      "Boîte de réception partagée & historique des échanges",
      "Attribution manuelle des conversations",
      "Assistance standard par e-mail",
    ],
  },
  {
    id: "starter",
    canonicalId: "STARTER",
    name: "Starter",
    tagline: "Pour structurer la relation client en ligne d'une PME ou boutique active.",
    audience: "Idéal pour les commerces, artisans et prestataires avec 1 à 2 conseillers dédiés.",
    price: "10 000",
    priceXaf: 10000,
    periodLabel: "FCFA / mois",
    cta: "Choisir Starter",
    href: "/register?plan=starter",
    quotas: {
      agents: "1 à 2 conseillers dédiés",
      establishments: "1 établissement principal",
      whatsapp: "Messagerie haute réactivité",
      storage: "2 Go de documents",
    },
    features: [
      "1 à 2 agents connectés",
      "1 établissement principal",
      "Espace public de l'entreprise",
      "Messagerie web Zadesk haute réactivité",
      "Chat instantané sans compte ni application pour le client",
      "Boîte partagée & historique des échanges unifié",
      "Attribution manuelle & organisation d'équipe",
      "Routage intelligent des demandes par compétences",
      "100 résolutions automatiques par IA / mois (En préparation)",
      "Assistance standard par e-mail",
    ],
  },
  {
    id: "pro",
    canonicalId: "PRO",
    name: "Pro",
    tagline: "Pour les entreprises avec une équipe relation client active et points de vente.",
    audience: "Conçu pour les équipes en croissance, showrooms et boutiques avec comptoirs physiques.",
    price: "45 000",
    priceXaf: 45000,
    periodLabel: "FCFA / mois",
    isPopular: true,
    badge: "Recommandé",
    cta: "Choisir Pro",
    href: "/register?plan=pro",
    quotas: {
      agents: "Jusqu'à 5 conseillers avec rôles",
      establishments: "Jusqu'à 3 agences physiques",
      whatsapp: "Disponibilité prioritaire",
      storage: "10 Go sécurisés",
    },
    features: [
      "Jusqu'à 5 agents avec rôles spécialisés (Admin, Manager, Agent)",
      "Gestion multi-établissements (jusqu'à 3 agences physiques)",
      "Messagerie Zadesk haute disponibilité",
      "Routage intelligent et prioritaire par compétences",
      "Mesure d'activité et charge des agents en temps réel",
      "IA connectée aux documents et catalogues (En préparation)",
      "Génération de QR codes pour les points de vente (En préparation)",
      "Assistance prioritaire dédiée",
    ],
  },
  {
    id: "entreprise",
    canonicalId: "ENTREPRISE",
    name: "Entreprise",
    tagline: "Pour les réseaux de distribution, cliniques et multi-agences régionales.",
    audience: "Pour les organisations structurées avec plusieurs implantations ou filiales.",
    price: "150 000",
    priceXaf: 150000,
    periodLabel: "FCFA / mois",
    cta: "Choisir Entreprise",
    href: "/register?plan=entreprise",
    quotas: {
      agents: "Conseillers illimités",
      establishments: "Multi-implantations régionales",
      whatsapp: "Canal dédié haute capacité",
      storage: "50 Go et archivage sécurisé",
    },
    features: [
      "Agents, managers et agences sans limite logicielle",
      "Espaces multi-établissements & agences régionales",
      "Gestion des rôles et permissions d'équipe sur-mesure",
      "SLA personnalisés et garantis (En préparation)",
      "Intégration API personnalisée (En préparation)",
      "Responsable de compte Zadesk dédié (Prestation humaine)",
      "Formation complète des équipes sur site ou à distance (Prestation humaine)",
      "Étude personnalisée d'intégration avec vos outils tiers (Prestation humaine)",
    ],
  },
];

export function getPlanConfig(planId: string | null | undefined): PlanConfig {
  const norm = (planId || "decouverte").toLowerCase().trim();
  const match = OFFICIAL_PLANS_CONFIG.find(
    (p) => p.id === norm || p.canonicalId.toLowerCase() === norm
  );
  return match || OFFICIAL_PLANS_CONFIG[0];
}
