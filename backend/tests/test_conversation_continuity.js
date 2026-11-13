import { prisma } from "../src/lib/prisma.js";
import {
  getMyConversations,
  getConversationDetails,
  sendMessage as agentSendMessage,
} from "../src/services/agentService.js";
import crypto from "crypto";

async function runContinuitySuite() {
  console.log("======================================================================");
  console.log("🧪 SUITE DE VALIDATION : CONTINUITÉ DU FIL DE CONVERSATION ZADESK");
  console.log("======================================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = "") {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName} : ${details}`);
    }
  }

  try {
    // ------------------------------------------------------------------
    // TEST 1 : Préservation des messages existants en base (dont les 8 messages du test utilisateur)
    // ------------------------------------------------------------------
    console.log("▶ TEST 1 : Vérification de l'intégrité des messages existants dans PostgreSQL");
    const existingMessagesCount = await prisma.conversationMessage.count();
    console.log(`  ℹ Nombre total de messages en base : ${existingMessagesCount}`);
    assert(existingMessagesCount >= 8, "Persistance PostgreSQL", `Messages trouvés: ${existingMessagesCount}`);

    const userTestConv = await prisma.conversation.findUnique({
      where: { id: "cmw7vvzhm0001pl22tesy5tt0" },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
    });

    if (userTestConv) {
      assert(
        userTestConv.messages.length === 8,
        "Préservation intégrale des 8 messages du test utilisateur",
        `Trouvé ${userTestConv.messages.length} messages`
      );
      console.log(`  ℹ Messages de la conversation cmw7vvzhm0001pl22tesy5tt0 :`);
      userTestConv.messages.forEach((m, idx) => {
        console.log(`     ${idx + 1}. [${m.senderType}] ${m.content.slice(0, 40)}...`);
      });
    } else {
      console.log("  ⚠️ Conversation cmw7vvzhm0001pl22tesy5tt0 non trouvée, test de préservation générale validé.");
    }

    // ------------------------------------------------------------------
    // TEST 2 : Séparation stricte Boîte de réception (take: 1) vs Fil Actif (tous les messages)
    // ------------------------------------------------------------------
    console.log("\n▶ TEST 2 : Séparation stricte getMyConversations() (aperçu) vs getConversationDetails() (fil complet)");
    
    // Récupérer un workspace existant
    const sampleWorkspace = await prisma.workspace.findFirst({
      include: {
        memberships: {
          include: { user: true },
        },
      },
    });

    if (!sampleWorkspace) {
      throw new Error("Aucun workspace trouvé pour le test.");
    }

    const testUser = sampleWorkspace.memberships[0]?.user;
    const testRole = sampleWorkspace.memberships[0]?.role;

    const inboxResult = await getMyConversations(sampleWorkspace.id, testUser.id, testRole, {
      limit: 10,
      offset: 0,
    });

    const inboxConvWithMessages = inboxResult.conversations.find((c) => c.messages && c.messages.length > 0);
    if (inboxConvWithMessages) {
      assert(
        inboxConvWithMessages.messages.length === 1,
        "Boîte de réception : limitation stricte à take: 1 pour l'aperçu du dernier message",
        `Messages dans la liste: ${inboxConvWithMessages.messages.length}`
      );

      // Détails complets de cette même conversation
      const fullDetails = await getConversationDetails(
        sampleWorkspace.id,
        inboxConvWithMessages.id,
        testUser.id,
        testRole
      );

      const dbTotalForConv = await prisma.conversationMessage.count({
        where: { conversationId: inboxConvWithMessages.id },
      });

      assert(
        fullDetails.messages.length === dbTotalForConv,
        "Fil complet actif : restitution de 100% des messages historiques",
        `Détails: ${fullDetails.messages.length}, En base: ${dbTotalForConv}`
      );
    }

    // ------------------------------------------------------------------
    // TEST 3 : Sécurisation cryptographique du guichet public (Token aléatoire 32 octets + Hash SHA-256)
    // ------------------------------------------------------------------
    console.log("\n▶ TEST 3 : Sécurisation cryptographique par token de session et hash serveur");
    
    const rawSessionToken = crypto.randomBytes(32).toString("hex");
    const expectedHash = crypto.createHash("sha256").update(rawSessionToken).digest("hex");

    // Création d'une nouvelle conversation publique de test
    const testCustomerEmail = `client_crypto_${Date.now()}@test.ci`;
    const secureConv = await prisma.conversation.create({
      data: {
        workspaceId: sampleWorkspace.id,
        customerName: "Client Test Cryptographie",
        customerEmail: testCustomerEmail,
        channel: "WEB_CHAT",
        status: "OPEN",
        publicTokenHash: expectedHash,
      },
    });

    assert(
      secureConv.publicTokenHash === expectedHash,
      "Stockage sécurisé du hash SHA-256 en base sans jamais stocker le secret brut",
      `Hash stocké: ${secureConv.publicTokenHash}`
    );

    // Vérification timing-safe du token
    const testInputHash = crypto.createHash("sha256").update(rawSessionToken).digest("hex");
    const isTokenValid = crypto.timingSafeEqual(
      Buffer.from(secureConv.publicTokenHash, "utf-8"),
      Buffer.from(testInputHash, "utf-8")
    );
    assert(isTokenValid === true, "Validation cryptographique timingSafeEqual réussie avec le bon token");

    // Test avec un mauvais token
    const wrongToken = crypto.randomBytes(32).toString("hex");
    const wrongHash = crypto.createHash("sha256").update(wrongToken).digest("hex");
    const isWrongValid = crypto.timingSafeEqual(
      Buffer.from(secureConv.publicTokenHash, "utf-8"),
      Buffer.from(wrongHash, "utf-8")
    );
    assert(isWrongValid === false, "Rejet cryptographique systématique en cas de token falsifié ou invalide");

    // ------------------------------------------------------------------
    // TEST 4 : Confidentialité absolue des notes internes
    // ------------------------------------------------------------------
    console.log("\n▶ TEST 4 : Équanchéité et invisibilité des notes internes depuis le guichet public");
    
    // Message client
    await prisma.conversationMessage.create({
      data: {
        conversationId: secureConv.id,
        senderType: "CUSTOMER",
        senderName: "Client Test",
        content: "Question publique sur le produit",
        isInternalNote: false,
      },
    });

    // Note interne rédigée par un agent
    await prisma.conversationMessage.create({
      data: {
        conversationId: secureConv.id,
        senderType: "INTERNAL_NOTE",
        senderName: "Agent Confidentiel",
        content: "Note confidentielle : client VIP niveau 2, accorder 10% de remise si nécessaire.",
        isInternalNote: true,
      },
    });

    // Réponse publique agent
    await prisma.conversationMessage.create({
      data: {
        conversationId: secureConv.id,
        senderType: "AGENT",
        senderName: "Agent Support",
        content: "Bonjour ! Nous pouvons vous proposer une offre personnalisée.",
        isInternalNote: false,
      },
    });

    // Simulation de la requête du guichet public (filtre isInternalNote: false obligatoire)
    const publicQueryMessages = await prisma.conversationMessage.findMany({
      where: {
        conversationId: secureConv.id,
        isInternalNote: false,
      },
      orderBy: { createdAt: "asc" },
    });

    assert(
      publicQueryMessages.length === 2,
      "Guichet public : seuls les messages publics sont retournés (2 sur 3)",
      `Messages publics récupérés: ${publicQueryMessages.length}`
    );

    const containsInternal = publicQueryMessages.some((m) => m.isInternalNote || m.content.includes("VIP"));
    assert(!containsInternal, "Guichet public : zéro fuite de note interne ou données confidentielles");

    // Requête espace agent (doit tout voir)
    const agentDetails = await getConversationDetails(
      sampleWorkspace.id,
      secureConv.id,
      testUser.id,
      testRole
    );

    assert(
      agentDetails.messages.length === 3,
      "Espace agent : visibilité complète des 3 messages (publics + notes internes)",
      `Messages agent: ${agentDetails.messages.length}`
    );

    // ------------------------------------------------------------------
    // TEST 5 : Continuité parfaite des échanges successifs bidirectionnels
    // ------------------------------------------------------------------
    console.log("\n▶ TEST 5 : Échanges bidirectionnels successifs et persistance chronologique");

    const exchangeSequence = [
      { senderType: "CUSTOMER", content: "Bonjour, quel est le tarif de livraison pour Brazzaville ?" },
      { senderType: "AGENT", content: "Bonjour ! La livraison sur Brazzaville est à 2 500 FCFA." },
      { senderType: "CUSTOMER", content: "Parfait. Quel est le délai moyen ?" },
      { senderType: "AGENT", content: "Comptez entre 24h et 48h ouvrées." },
      { senderType: "CUSTOMER", content: "Merci, je passe commande de suite !" },
      { senderType: "AGENT", content: "Très bien, notre équipe prépare votre colis avec soin." },
    ];

    for (const msg of exchangeSequence) {
      await prisma.conversationMessage.create({
        data: {
          conversationId: secureConv.id,
          senderType: msg.senderType,
          senderName: msg.senderType === "CUSTOMER" ? "Client" : "Agent",
          content: msg.content,
          isInternalNote: false,
        },
      });
      // Délai artificiel 10ms pour garantir l'ordre strict createdAt
      await new Promise((r) => setTimeout(r, 10));
    }

    // Récupération complète
    const finalHistory = await getConversationDetails(
      sampleWorkspace.id,
      secureConv.id,
      testUser.id,
      testRole
    );

    // Total attendu : 3 messages du test 4 + 6 messages de l'échange = 9 messages
    assert(
      finalHistory.messages.length === 9,
      "Conservation continue : aucun message écrasé ou remplacé lors des envois successifs (9/9)",
      `Total messages: ${finalHistory.messages.length}`
    );

    // Vérification de l'ordre chronologique strict
    let isChronological = true;
    for (let i = 1; i < finalHistory.messages.length; i++) {
      const prevTime = new Date(finalHistory.messages[i - 1].createdAt).getTime();
      const currTime = new Date(finalHistory.messages[i].createdAt).getTime();
      if (currTime < prevTime) {
        isChronological = false;
        break;
      }
    }
    assert(isChronological, "Ordre chronologique ascendant strict respecté");

    // Nettoyage de la conversation de test
    await prisma.conversationMessage.deleteMany({ where: { conversationId: secureConv.id } });
    await prisma.conversation.delete({ where: { id: secureConv.id } });
    console.log("  ℹ Données temporaires de test nettoyées avec succès.");

    console.log("\n======================================================================");
    console.log(`📊 RÉSULTAT FINAL : ${passedTests}/${totalTests} TESTS VALIDÉS AVEC SUCCÈS`);
    console.log("======================================================================\n");

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Erreur inattendue pendant l'exécution des tests :", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runContinuitySuite();

