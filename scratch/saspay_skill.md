> ## Documentation Index
> Fetch the complete documentation index at: https://docs.saspay.me/llms.txt
> Use this file to discover all available pages before exploring further.

# Skill SasPay

> Un guide d'intégration complet pour les assistants IA : encaissement, vérification, retraits, webhooks, erreurs.

La skill SasPay est un fichier `SKILL.md` qui décrit l'intégration complète de SasPay dans une application, quelle que soit la stack. Elle couvre :

* le choix entre softpay (push direct) et checkout hébergé ;
* la vérification avant livraison, et l'idempotence sur les routes qui déplacent de l'argent ;
* les retraits, avec les contraintes d'IP whitelistée et de devise ;
* la vérification de signature des webhooks, avec un exemple de code ;
* la classification des erreurs par code HTTP, et une définition de terminé.

[⬇️ Télécharger la skill (SKILL.md)](https://files.viraclip.me/saspay/docs/SKILL.txt?response-content-disposition=attachment%3B%20filename%3D%22SKILL.md%22)

Fichier à déposer dans le dossier de skills de votre assistant.

> [!NOTE]
>
> La skill ne remplace pas la référence API : en cas de doute, la spécification [OpenAPI](https://docs.saspay.me/api-reference/openapi.json) fait foi.

## Utiliser la skill

Placez le fichier `SKILL.md` dans le dépôt de votre projet, dans le dossier de skills de votre assistant, puis demandez-lui une intégration SasPay. Pour les règles permanentes, ajoutez aussi l'extrait de la page [Règles pour assistants IA](https://docs.saspay.me/ai/agents-md.md) à votre `AGENTS.md`.


This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.