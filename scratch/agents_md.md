> ## Documentation Index
> Fetch the complete documentation index at: https://docs.saspay.me/llms.txt
> Use this file to discover all available pages before exploring further.

# Règles pour assistants IA (AGENTS.md)

> Ajoutez les règles essentielles de l'API SasPay aux instructions de votre projet pour un assistant de code.

Un fichier `AGENTS.md` donne à un assistant de code des instructions propres à votre projet. Les règles ci-dessous réduisent les erreurs fréquentes : exposition de la clé API, livraison avant confirmation du paiement, retry d'un débit sans clé d'idempotence.

Ajoutez l'extrait suivant à un fichier `AGENTS.md` à la racine de votre projet.

```markdown AGENTS.md theme={null}
## Intégration de l'API SasPay

- Utilisez la documentation officielle : /llms.txt de la documentation SasPay.
- Utilisez la spécification OpenAPI : /api-reference/openapi.json.
- Utilisez l'URL de base `https://api.saspay.me/api/v1`.
- Effectuez toutes les requêtes SasPay depuis le backend.
- Stockez la clé API dans un gestionnaire de secrets ou une variable d'environnement.
- Ne placez jamais la clé API dans le frontend, les logs ou le dépôt Git.
- Envoyez la clé avec `Authorization: Bearer sk_test_...` en développement, `sk_live_...` en production.
- Montants : chaînes décimales (`"2500.00"`), jamais de flottants.
- Envoyez un `Idempotency-Key` sur `POST /payments/softpay/`, `POST /payouts/initialize/`, `POST /wallet-transfers/` et `POST /payments/{payment_id}/retry/`.
- Ne livrez un produit ou n'activez un accès que lorsque `GET /payments/{payment_id}/verify/` renvoie `SUCCESS`.
- Si `checkout_url` est non vide après un softpay, redirigez le client vers cette URL.
- Vérifiez la signature des webhooks (`X-Webhook-Signature`, `X-Webhook-Timestamp`) sur le corps brut, et rejetez un horodatage de plus de 300 secondes.
- Pour un retrait, whitelistez l'IP du serveur ; sinon l'appel renvoie `403 ip_not_whitelisted`.
- Gérez les réponses `401`, `403`, `404`, `409`, `422` et `429` selon l'endpoint ; en cas de `429`, espacez les appels.
- N'inventez aucun endpoint, champ, statut ou événement absent de la spécification OpenAPI.
```

## Pourquoi l'ajouter ?

Ces règles restent disponibles pendant les tâches de développement, sans avoir à relire la documentation à chaque fois.

> [!TIP]
>
> Combinez `AGENTS.md` avec la [skill SasPay](https://docs.saspay.me/ai/skill.md) pour donner à l'assistant un guide d'intégration complet, et avec `llms.txt` pour accéder à la documentation à jour.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.