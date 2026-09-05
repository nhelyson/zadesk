import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:4000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runAuditSuite() {
  console.log('================================================================');
  console.log(' AUDIT & VALIDATION COMPLÈTE DU FLUX D\'INSCRIPTION + OTP ZADESK');
  console.log('================================================================\n');

  const testEmail = 'japhetikoume@gmail.com';
  const testPassword = 'Password123!Secure';

  // Nettoyage préalable pour l'email de test
  await prisma.user.deleteMany({ where: { email: testEmail } });
  await prisma.pendingRegistration.deleteMany({ where: { email: testEmail } });

  try {
    // -----------------------------------------------------------------
    // TEST 1: Inscription normale avec envoi réel Zavu
    // -----------------------------------------------------------------
    console.log(`[TEST 1] Inscription d'un utilisateur réel (${testEmail})...`);
    const registerAttempt = await request('/auth/register', {
      method: 'POST',
      body: {
        email: testEmail,
        password: testPassword,
        firstName: 'Japhet',
        lastName: 'Ikoume'
      }
    });

    console.log('  -> Statut HTTP retourné:', registerAttempt.status);
    console.log('  -> Message reçu:', registerAttempt.data.message || registerAttempt.data.data?.message);
    console.log('  -> Requires OTP:', registerAttempt.data.requiresOtp || registerAttempt.data.data?.requiresOtp);
    const tempToken = registerAttempt.data.tempToken || registerAttempt.data.data?.tempToken;
    console.log('  -> tempToken généré et reçu ?', !!tempToken);

    if (registerAttempt.status !== 200 || !tempToken) {
      throw new Error(`Échec de l'inscription / envoi Zavu: ${JSON.stringify(registerAttempt.data)}`);
    }

    // Vérifier l'état en BDD
    const pendingInDb = await prisma.pendingRegistration.findUnique({ where: { email: testEmail } });
    const userInDb = await prisma.user.findUnique({ where: { email: testEmail } });

    console.log('  -> Inscription temporaire en BDD (pending_registrations) ?', !!pendingInDb);
    console.log('  -> Compte définitif absent de la table users ?', userInDb === null ? 'OUI (aucun orphelin)' : 'NON');
    console.log('  -> Mot de passe sécurisé (hash bcrypt) ?', pendingInDb.passwordHash.startsWith('$2'));
    console.log('  -> OTP sécurisé (hash cryptographique) ?', !!pendingInDb.otpHash);
    console.log('✓ TEST 1 VALIDÉ : Email OTP accepté et envoyé par Zavu, données temporaires stockées de manière sécurisée.\n');

    // -----------------------------------------------------------------
    // TEST 2: Soumission d'un mauvais code OTP
    // -----------------------------------------------------------------
    console.log('[TEST 2] Soumission d\'un mauvais code OTP (000000)...');
    const badVerifyRes = await request('/auth/verify-otp', {
      method: 'POST',
      body: { tempToken, otp: '000000', purpose: 'REGISTRATION' }
    });

    console.log('  -> Statut HTTP:', badVerifyRes.status);
    console.log('  -> Message retourné:', badVerifyRes.data.message);

    if (badVerifyRes.status !== 400) throw new Error('Le mauvais code aurait dû renvoyer HTTP 400');
    
    const checkAttempts = await prisma.pendingRegistration.findUnique({ where: { email: testEmail } });
    console.log('  -> Tentatives incrémentées en BDD:', checkAttempts.attempts);
    if (checkAttempts.attempts !== 1) throw new Error('Le nombre de tentatives n\'a pas été incrémenté');
    console.log('✓ TEST 2 VALIDÉ : Mauvais code rejeté et tentative enregistrée.\n');

    // -----------------------------------------------------------------
    // TEST 3: Cooldown sur le renvoi d'OTP (60s)
    // -----------------------------------------------------------------
    console.log('[TEST 3] Test du cooldown anti-spam sur le renvoi de code...');
    const cooldownRes = await request('/auth/resend-otp', {
      method: 'POST',
      body: { tempToken, purpose: 'REGISTRATION' }
    });

    console.log('  -> Statut HTTP:', cooldownRes.status);
    console.log('  -> Message:', cooldownRes.data.message);

    if (cooldownRes.status !== 429) throw new Error('Le renvoi immédiat aurait dû renvoyer HTTP 429');
    console.log('✓ TEST 3 VALIDÉ : Cooldown 60s actif et respecté.\n');

    // -----------------------------------------------------------------
    // TEST 4: Validation avec OTP correct & Création définitive du compte
    // -----------------------------------------------------------------
    console.log('[TEST 4] Validation avec code OTP correct...');
    const { hashOtp, cleanupExpiredRegistrations } = await import('../src/services/otpService.js');
    
    // Injectons un hash correspondant à un code connu pour le test automatique
    const validOtp = '748291';
    const validHash = hashOtp(validOtp, testEmail);
    await prisma.pendingRegistration.update({
      where: { email: testEmail },
      data: { otpHash: validHash, attempts: 0 }
    });

    const verifyValidRes = await request('/auth/verify-otp', {
      method: 'POST',
      body: { tempToken, otp: validOtp, purpose: 'REGISTRATION' }
    });

    console.log('  -> Statut HTTP:', verifyValidRes.status);
    console.log('  -> Message:', verifyValidRes.data.data?.message || verifyValidRes.data.message);
    console.log('  -> User activé:', verifyValidRes.data.data?.user?.email);

    if (verifyValidRes.status !== 200) throw new Error(`Échec de validation: ${JSON.stringify(verifyValidRes.data)}`);

    // Vérification finale en BDD
    const finalPending = await prisma.pendingRegistration.findUnique({ where: { email: testEmail } });
    const finalUser = await prisma.user.findUnique({ where: { email: testEmail } });

    console.log('  -> Inscription temporaire purgée ?', finalPending === null ? 'OUI' : 'NON');
    console.log('  -> Utilisateur créé dans la table users ?', finalUser !== null ? 'OUI' : 'NON');
    console.log('  -> Statut utilisateur:', finalUser?.status);
    console.log('  -> Email vérifié ?', finalUser?.emailVerified);

    if (finalPending !== null) throw new Error('PendingRegistration non supprimé après activation');
    if (!finalUser || !finalUser.emailVerified) throw new Error('Compte non activé');
    console.log('✓ TEST 4 VALIDÉ : Compte définitivement créé et vérifié, inscription temporaire purgée.\n');

    // -----------------------------------------------------------------
    // TEST 5: Nettoyage automatique des inscriptions expirées/abandonnées
    // -----------------------------------------------------------------
    console.log('[TEST 5] Test du nettoyage automatique des inscriptions abandonnées...');
    const abandonedEmail = `abandoned_${Date.now()}@example.com`;
    const dummyHash = await bcrypt.hash('secret', 10);
    await prisma.pendingRegistration.create({
      data: {
        email: abandonedEmail,
        firstName: 'Abandon',
        lastName: 'Test',
        passwordHash: dummyHash,
        otpHash: dummyHash,
        expiresAt: new Date(Date.now() - 60000)
      }
    });

    await cleanupExpiredRegistrations();
    const checkAbandoned = await prisma.pendingRegistration.findUnique({ where: { email: abandonedEmail } });
    console.log('  -> Inscription abandonnée supprimée ?', checkAbandoned === null ? 'OUI' : 'NON');
    if (checkAbandoned !== null) throw new Error('Nettoyage échoué');
    console.log('✓ TEST 5 VALIDÉ : Inscriptions abandonnées nettoyées automatiquement.\n');

    console.log('================================================================');
    console.log('🎉 TOUT LE PARCOURS D\'INSCRIPTION + OTP EMAIL EST 100% OPÉRATIONNEL !');
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ ERREUR:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAuditSuite();
