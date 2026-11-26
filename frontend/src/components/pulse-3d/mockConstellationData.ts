import {
  Pulse3DConversation,
  Pulse3DConnection,
  Pulse3DClusterCenter,
} from './types';

export const PULSE_3D_CLUSTERS: Pulse3DClusterCenter[] = [
  { name: 'Paiements & Mobile Money', x: -13, y: 4.5, z: 3, color: '#10B981' },
  { name: 'Livraisons & Colis', x: 12, y: 5.5, z: -2, color: '#38BDF8' },
  { name: 'Support Matériel', x: -6, y: -5.5, z: -10, color: '#F59E0B' },
  { name: 'Facturation B2B', x: 13, y: -4.5, z: 9, color: '#818CF8' },
  { name: 'Accès & Compte', x: 0, y: 9.5, z: -9, color: '#34D399' },
];

const SEED_ITEMS: Array<
  Omit<Pulse3DConversation, 'x' | 'y' | 'z'>
> = [
  {
    id: 'p3d-1',
    customerName: 'Clarisse Moukala',
    customerPhone: '+242 06 841 22 10',
    category: 'Paiements & Mobile Money',
    status: 'OPEN',
    unreadCount: 2,
    ticketRef: 'TK-4012',
    lastMessage: 'Mon dépôt Airtel Money de 45 000 FCFA reste bloqué en validation.',
    lastMessageAt: '12:24',
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        senderName: 'Clarisse Moukala',
        content: 'Bonjour, j’ai effectué un paiement par Airtel Money il y a 15 minutes.',
        createdAt: '12:21',
      },
      {
        id: 'm2',
        senderType: 'CUSTOMER',
        senderName: 'Clarisse Moukala',
        content: 'Mon dépôt Airtel Money de 45 000 FCFA reste bloqué en validation.',
        createdAt: '12:24',
      },
    ],
  },
  {
    id: 'p3d-2',
    customerName: 'Brice Ndongo',
    customerPhone: '+242 05 712 90 34',
    category: 'Paiements & Mobile Money',
    status: 'ACTIVE',
    unreadCount: 1,
    ticketRef: 'TK-4012',
    lastMessage: 'Voici la capture de la référence TX-9921 demandée.',
    lastMessageAt: '12:19',
    messages: [
      {
        id: 'm1',
        senderType: 'AGENT',
        senderName: 'Conseiller SAV',
        content: 'Pouvez-vous nous confirmer le numéro de référence reçu par SMS ?',
        createdAt: '12:14',
      },
      {
        id: 'm2',
        senderType: 'CUSTOMER',
        senderName: 'Brice Ndongo',
        content: 'Voici la capture de la référence TX-9921 demandée.',
        createdAt: '12:19',
      },
    ],
  },
  {
    id: 'p3d-3',
    customerName: 'Mireille Kodia',
    customerPhone: '+242 06 551 09 44',
    category: 'Paiements & Mobile Money',
    status: 'WAITING_CUSTOMER',
    unreadCount: 0,
    lastMessage: 'Nous avons relancé la passerelle, vérifiez votre solde d’ici 10 min.',
    lastMessageAt: '11:58',
    messages: [
      {
        id: 'm1',
        senderType: 'AGENT',
        senderName: 'Conseiller SAV',
        content: 'Nous avons relancé la passerelle, vérifiez votre solde d’ici 10 min.',
        createdAt: '11:58',
      },
    ],
  },
  {
    id: 'p3d-4',
    customerName: 'Serge Bantsimba',
    customerPhone: '+242 06 320 45 11',
    category: 'Paiements & Mobile Money',
    status: 'RESOLVED',
    unreadCount: 0,
    lastMessage: 'Parfait, la régularisation est bien arrivée. Merci !',
    lastMessageAt: '10:40',
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        senderName: 'Serge Bantsimba',
        content: 'Parfait, la régularisation est bien arrivée. Merci !',
        createdAt: '10:40',
      },
    ],
  },
  {
    id: 'p3d-5',
    customerName: 'Patrick Nkouka',
    customerPhone: '+242 06 903 18 72',
    category: 'Livraisons & Colis',
    status: 'OPEN',
    unreadCount: 3,
    ticketRef: 'TK-4025',
    lastMessage: 'Le livreur n’a pas encore appelé pour le secteur Bacongo.',
    lastMessageAt: '12:27',
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        senderName: 'Patrick Nkouka',
        content: 'Bonjour, mon colis devait arriver ce matin entre 10h et 12h.',
        createdAt: '12:15',
      },
      {
        id: 'm2',
        senderType: 'CUSTOMER',
        senderName: 'Patrick Nkouka',
        content: 'Le livreur n’a pas encore appelé pour le secteur Bacongo.',
        createdAt: '12:27',
      },
    ],
  },
  {
    id: 'p3d-6',
    customerName: 'Nadia Makaya',
    customerPhone: '+242 05 339 77 15',
    category: 'Livraisons & Colis',
    status: 'ACTIVE',
    unreadCount: 0,
    lastMessage: 'Changement d’adresse confirmé vers Poto-Poto.',
    lastMessageAt: '12:08',
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        senderName: 'Nadia Makaya',
        content: 'Est-il possible de livrer à mon bureau à Poto-Poto plutôt qu’à domicile ?',
        createdAt: '12:02',
      },
      {
        id: 'm2',
        senderType: 'AGENT',
        senderName: 'Conseiller SAV',
        content: 'Changement d’adresse confirmé vers Poto-Poto.',
        createdAt: '12:08',
      },
    ],
  },
  {
    id: 'p3d-7',
    customerName: 'Ets. Lumière Congo',
    customerPhone: '+242 06 410 55 00',
    category: 'Livraisons & Colis',
    status: 'ACTIVE',
    unreadCount: 1,
    lastMessage: 'Le carton n°3 présente un choc sur le coin supérieur.',
    lastMessageAt: '12:22',
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        senderName: 'Ets. Lumière Congo',
        content: 'Le carton n°3 présente un choc sur le coin supérieur.',
        createdAt: '12:22',
      },
    ],
  },
  {
    id: 'p3d-8',
    customerName: 'Hervé Malonga',
    customerPhone: '+242 06 702 14 89',
    category: 'Livraisons & Colis',
    status: 'RESOLVED',
    unreadCount: 0,
    lastMessage: 'Colis réceptionné à Pointe-Noire, tout est conforme.',
    lastMessageAt: '09:45',
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        senderName: 'Hervé Malonga',
        content: 'Colis réceptionné à Pointe-Noire, tout est conforme.',
        createdAt: '09:45',
      },
    ],
  },
  {
    id: 'p3d-9',
    customerName: 'Pharmacie Centrale',
    customerPhone: '+242 05 510 22 09',
    category: 'Support Matériel',
    status: 'OPEN',
    unreadCount: 2,
    ticketRef: 'TK-4025',
    lastMessage: 'Le terminal affiche toujours une erreur lecteur puce après redémarrage.',
    lastMessageAt: '12:26',
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        senderName: 'Pharmacie Centrale',
        content: 'Le terminal affiche toujours une erreur lecteur puce après redémarrage.',
        createdAt: '12:26',
      },
    ],
  },
  {
    id: 'p3d-10',
    customerName: 'Garage Auto Plus',
    customerPhone: '+242 06 622 31 04',
    category: 'Support Matériel',
    status: 'ACTIVE',
    unreadCount: 0,
    lastMessage: 'Nous préparons l’échange standard du bloc d’alimentation.',
    lastMessageAt: '11:48',
    messages: [
      {
        id: 'm1',
        senderType: 'AI',
        senderName: 'Assistant Zalisk',
        content: 'Nous préparons l’échange standard du bloc d’alimentation.',
        createdAt: '11:48',
      },
    ],
  },
  {
    id: 'p3d-11',
    customerName: 'Boutique Océan',
    customerPhone: '+242 06 204 88 91',
    category: 'Support Matériel',
    status: 'WAITING_CUSTOMER',
    unreadCount: 0,
    lastMessage: 'Pouvez-vous tester avec le câble USB-C fourni dans la boîte ?',
    lastMessageAt: '11:12',
    messages: [
      {
        id: 'm1',
        senderType: 'AGENT',
        senderName: 'Conseiller SAV',
        content: 'Pouvez-vous tester avec le câble USB-C fourni dans la boîte ?',
        createdAt: '11:12',
      },
    ],
  },
  {
    id: 'p3d-12',
    customerName: 'Clinique Espoir',
    customerPhone: '+242 05 801 40 30',
    category: 'Support Matériel',
    status: 'ACTIVE',
    unreadCount: 1,
    lastMessage: 'L’imprimante thermique ne détecte plus le rouleau 80mm.',
    lastMessageAt: '12:17',
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        senderName: 'Clinique Espoir',
        content: 'L’imprimante thermique ne détecte plus le rouleau 80mm.',
        createdAt: '12:17',
      },
    ],
  },
  {
    id: 'p3d-13',
    customerName: 'BTP Horizon',
    customerPhone: '+242 06 990 12 00',
    category: 'Facturation B2B',
    status: 'ACTIVE',
    unreadCount: 1,
    ticketRef: 'TK-4033',
    lastMessage: 'Merci d’ajouter notre nouveau NIF sur la facture proforma.',
    lastMessageAt: '12:20',
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        senderName: 'BTP Horizon',
        content: 'Merci d’ajouter notre nouveau NIF sur la facture proforma.',
        createdAt: '12:20',
      },
    ],
  },
  {
    id: 'p3d-14',
    customerName: 'Cabinet Delta Audit',
    customerPhone: '+242 05 442 67 10',
    category: 'Facturation B2B',
    status: 'WAITING_CUSTOMER',
    unreadCount: 0,
    ticketRef: 'TK-4033',
    lastMessage: 'La facture corrigée a été envoyée sur votre adresse comptable.',
    lastMessageAt: '11:30',
    messages: [
      {
        id: 'm1',
        senderType: 'AGENT',
        senderName: 'Conseiller SAV',
        content: 'La facture corrigée a été envoyée sur votre adresse comptable.',
        createdAt: '11:30',
      },
    ],
  },
  {
    id: 'p3d-15',
    customerName: 'Supermarché Étoile',
    customerPhone: '+242 06 118 93 27',
    category: 'Facturation B2B',
    status: 'RESOLVED',
    unreadCount: 0,
    lastMessage: 'Virement reçu et quittance validée.',
    lastMessageAt: '10:05',
    messages: [
      {
        id: 'm1',
        senderType: 'AGENT',
        senderName: 'Conseiller SAV',
        content: 'Virement reçu et quittance validée.',
        createdAt: '10:05',
      },
    ],
  },
  {
    id: 'p3d-16',
    customerName: 'Aïcha Diallo',
    customerPhone: '+242 06 774 12 65',
    category: 'Accès & Compte',
    status: 'OPEN',
    unreadCount: 1,
    lastMessage: 'Je ne reçois pas le code OTP sur mon nouveau numéro.',
    lastMessageAt: '12:25',
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        senderName: 'Aïcha Diallo',
        content: 'Je ne reçois pas le code OTP sur mon nouveau numéro.',
        createdAt: '12:25',
      },
    ],
  },
  {
    id: 'p3d-17',
    customerName: 'Rodrigue Samba',
    customerPhone: '+242 05 229 03 88',
    category: 'Accès & Compte',
    status: 'ACTIVE',
    unreadCount: 0,
    lastMessage: 'Profil agent activé, il reste à valider l’accès agence Centre-Ville.',
    lastMessageAt: '11:51',
    messages: [
      {
        id: 'm1',
        senderType: 'INTERNAL_NOTE',
        senderName: 'Note interne',
        content: 'Profil agent activé, il reste à valider l’accès agence Centre-Ville.',
        createdAt: '11:51',
        isInternalNote: true,
      },
    ],
  },
  {
    id: 'p3d-18',
    customerName: 'Chantal Oba',
    customerPhone: '+242 06 390 61 52',
    category: 'Accès & Compte',
    status: 'RESOLVED',
    unreadCount: 0,
    lastMessage: 'Connexion rétablie sur les deux postes.',
    lastMessageAt: '10:15',
    messages: [
      {
        id: 'm1',
        senderType: 'CUSTOMER',
        senderName: 'Chantal Oba',
        content: 'Connexion rétablie sur les deux postes.',
        createdAt: '10:15',
      },
    ],
  },
];

// Deterministic pseudo-random helper for stable 3D offsets
function seededOffset(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function findFree3DPosition(
  cluster: Pulse3DClusterCenter,
  existing: Array<{ x: number; y: number; z: number }>,
  indexInCluster: number,
  seedOffset = 0
): { x: number; y: number; z: number } {
  const minDistance = 4.6;
  const goldenAngle = 2.399963229728653;

  for (let step = indexInCluster; step < indexInCluster + 120; step++) {
    const r = step === 0 ? 0.6 : 4.2 + Math.sqrt(step) * 2.55;
    const theta = step * goldenAngle + seededOffset(step + seedOffset) * 0.6;
    const phi = (seededOffset(step * 3 + 7 + seedOffset) - 0.5) * Math.PI * 0.72;

    const cand = {
      x: cluster.x + Math.cos(theta) * Math.cos(phi) * r,
      y: cluster.y + Math.sin(phi) * r * 0.85,
      z: cluster.z + Math.sin(theta) * Math.cos(phi) * r,
    };

    const collides = existing.some((p) => {
      const dx = p.x - cand.x;
      const dy = p.y - cand.y;
      const dz = p.z - cand.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz) < minDistance;
    });

    if (!collides) {
      return cand;
    }
  }

  return {
    x: cluster.x + (seededOffset(seedOffset + 1) - 0.5) * 10,
    y: cluster.y + (seededOffset(seedOffset + 2) - 0.5) * 8,
    z: cluster.z + (seededOffset(seedOffset + 3) - 0.5) * 10,
  };
}

export function buildInitialMockConversations(): Pulse3DConversation[] {
  const clusterCounts = new Map<string, number>();
  const placed: Pulse3DConversation[] = [];

  SEED_ITEMS.forEach((item, globalIdx) => {
    const cluster =
      PULSE_3D_CLUSTERS.find((c) => c.name === item.category) || PULSE_3D_CLUSTERS[0];
    const localIdx = clusterCounts.get(cluster.name) || 0;
    clusterCounts.set(cluster.name, localIdx + 1);

    const pos = findFree3DPosition(cluster, placed, localIdx, globalIdx + 1);
    placed.push({
      ...item,
      ...pos,
    });
  });

  return placed;
}

/**
 * Coherent sparse 3D network topology:
 * - Minimum Spanning Tree inside each category cluster (+ up to 1 short cycle edge)
 * - Cross-cluster bridges only when sharing a ticketRef
 */
export function build3DConnections(conversations: Pulse3DConversation[]): Pulse3DConnection[] {
  const connections: Pulse3DConnection[] = [];
  const edgeKeys = new Set<string>();

  const addEdge = (a: Pulse3DConversation, b: Pulse3DConversation, kind: 'cluster' | 'ticket') => {
    const [u, v] = a.id < b.id ? [a.id, b.id] : [b.id, a.id];
    const key = `${u}::${v}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    connections.push({
      id: `edge-${key}`,
      fromId: a.id,
      toId: b.id,
      kind,
      category: a.category,
    });
  };

  // Group by category and build MST + 1 close harmonic edge per cluster
  const byCat = new Map<string, Pulse3DConversation[]>();
  conversations.forEach((c) => {
    const list = byCat.get(c.category);
    if (list) list.push(c);
    else byCat.set(c.category, [c]);
  });

  const dist3D = (a: Pulse3DConversation, b: Pulse3DConversation) =>
    Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

  byCat.forEach((members) => {
    if (members.length < 2) return;
    const connected = new Set<string>([members[0].id]);

    while (connected.size < members.length) {
      let bestA: Pulse3DConversation | null = null;
      let bestB: Pulse3DConversation | null = null;
      let bestD = Infinity;
      for (const a of members) {
        if (!connected.has(a.id)) continue;
        for (const b of members) {
          if (connected.has(b.id)) continue;
          const d = dist3D(a, b);
          if (d < bestD) {
            bestD = d;
            bestA = a;
            bestB = b;
          }
        }
      }
      if (!bestA || !bestB) break;
      addEdge(bestA, bestB, 'cluster');
      connected.add(bestB.id);
    }

    // Add 1 or 2 subtle intra-cluster closing loops between nearest non-connected pairs
    if (members.length >= 3) {
      let addedLoops = 0;
      const pairs: Array<{ a: Pulse3DConversation; b: Pulse3DConversation; d: number }> = [];
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const a = members[i];
          const b = members[j];
          const [u, v] = a.id < b.id ? [a.id, b.id] : [b.id, a.id];
          if (!edgeKeys.has(`${u}::${v}`)) {
            pairs.push({ a, b, d: dist3D(a, b) });
          }
        }
      }
      pairs.sort((p1, p2) => p1.d - p2.d);
      for (const p of pairs) {
        if (addedLoops >= Math.min(2, Math.floor(members.length / 2))) break;
        addEdge(p.a, p.b, 'cluster');
        addedLoops++;
      }
    }
  });

  // Ticket bridges across clusters
  for (let i = 0; i < conversations.length; i++) {
    for (let j = i + 1; j < conversations.length; j++) {
      const a = conversations[i];
      const b = conversations[j];
      if (a.ticketRef && a.ticketRef === b.ticketRef) {
        addEdge(a, b, 'ticket');
      }
    }
  }

  return connections;
}

export const SIMULATED_INCOMING_MESSAGES = [
  'Bonjour, je viens d’envoyer le justificatif demandé.',
  'Toujours en attente de votre confirmation s’il vous plaît.',
  'Le voyant rouge clignote à nouveau sur le boîtier.',
  'Pouvez-vous vérifier mon dossier urgent cet après-midi ?',
  'Merci, le livreur vient de passer devant notre agence !',
  'Le code de validation vient d’expirer, pouvez-vous en renvoyer un ?',
];

export const SIMULATED_NEW_CUSTOMERS = [
  { name: 'Yannick Loubassou', phone: '+242 06 814 50 12', category: 'Paiements & Mobile Money' },
  { name: 'Maison Mbemba', phone: '+242 05 301 92 70', category: 'Livraisons & Colis' },
  { name: 'Optique Pointe-Noire', phone: '+242 06 544 19 80', category: 'Support Matériel' },
  { name: 'TransCongo Express', phone: '+242 06 710 04 33', category: 'Facturation B2B' },
  { name: 'Estelle Massengo', phone: '+242 05 688 41 25', category: 'Accès & Compte' },
];
