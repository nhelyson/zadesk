# ZADESK — DIRECTIVES D'EXPÉRIENCE MOBILE & PWA (DIRECTION 4)
## Standards d'Ergonomie Tactile & Conception Mobile Native

> **Cadre :** Déclinaison mobile de la Direction 4 (*Operational Editorial System*).  
> **Norme de référence :** Apple Human Interface Guidelines (WWDC) & Principes Mobile-Native d'Emil Kowalski.  
> **Format de référence :** 390 × 844 px (Viewport iPhone standard, testable sur Android).

---

## 1. POSTURE OPÉRATIONNELLE : LE SMARTPHONE N'EST PAS UN DESKTOP RÉDUIT

Une interface de gestion sur mobile ne peut pas être une simple compression d'une page grand écran.  
Les commerçants et managers de la zone CEMAC consultent Zadesk dans des conditions réelles de mobilité :
- En déplacement entre deux agences (Douala Akwa & Bonanjo, Yaoundé Bastos & Centre).
- À une seule main (généralement le pouce droit).
- Avec des connexions 4G/3G parfois intermittentes.
- Sous une luminosité extérieure variable.

L'expérience doit être immédiate, physique et sans aucune friction tactile.

---

## 2. LES 8 RÈGLES D'OR DE L'EXPÉRIENCE MOBILE NATIVE

### Règle 1 : La Zone Naturelle du Pouce (Thumb-Zone Ergonomics)
- **Actions primaires en bas :** Les boutons cruciaux (*"Prendre en charge immédiatement"*, *"Répondre"*, *"Valider"*) doivent être situés dans le tiers inférieur de l'écran, là où le pouce se pose naturellement sans contorsion.
- **Navigation basse fixe :** La barre de navigation à 5 onglets reste ancrée au bas de l'écran avec une hauteur tactile de **60px** incluant le padding de sécurité (`env(safe-area-inset-bottom)`).
- **Consultation en haut :** Les données de synthèse et l'en-tête éditorial se situent dans la partie supérieure, idéale pour la lecture sans masquer l'écran avec les doigts.

### Règle 2 : Cibles Tactiles Strictes de 44 px Minimum
Conformément aux normes iOS et Android :
- Tout bouton, onglet, icône ou sélecteur cliquable doit mesurer **au moins 44 × 44 pixels** de zone tactile active.
- Lorsque l'icône visuelle est petite (ex: 18px), son conteneur tactile parent doit s'étendre à 44px minimum via padding.

### Règle 3 : Suppression Immédiate du Flash Gris (`Tap Highlight`)
Sur les navigateurs mobiles WebKit et Chromium, chaque clic génère un rectangle gris ou bleu transparent disgracieux qui trahit le site web ordinaire.
```css
/* Déclaration globale obligatoire */
* {
  -webkit-tap-highlight-color: transparent;
}
```

### Règle 4 : Suppression de la Latence de 300 ms au Toucher
Les navigateurs mobiles attendent traditionnellement 300ms pour vérifier si l'utilisateur effectue un double-tap de zoom. Cette latence donne une sensation d'application lente.
```css
/* Suppression de la latence de 300ms sur tous les éléments cliquables */
button, a, input, select, [role="button"] {
  touch-action: manipulation;
}
```

### Règle 5 : Feedback Tactile Instantané au Press (`:active`)
Sur mobile, le hover n'existe pas. L'utilisateur a besoin de ressentir que le système a reçu son geste dès l'enfoncement du doigt (pointer-down), pas au relâchement.
```css
/* Réaction physique instantanée sur les boutons */
.btn-primary:active, .mobile-card:active {
  transform: scale(0.98);
  transition: transform 80ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Règle 6 : Isolation des Styles Hover (Anti-Sticky Hover Bug)
Sur smartphone, un style `:hover` reste collé à l'élément après le clic jusqu'à ce que l'utilisateur tape ailleurs, ce qui provoque des boutons qui restent surlignés.
```css
/* Tous les hovers doivent être strictement isolés */
@media (hover: hover) and (pointer: fine) {
  .btn-primary:hover {
    background-color: var(--z-color-navy-800);
  }
}
```

### Règle 7 : Prévention du Zoom Automatique Intempestif sur les Champs
Sur iOS Safari, tout champ de saisie dont la taille de police est inférieure à 16px déclenche un zoom avant automatique qui casse la mise en page.
```css
/* Taille minimale des inputs sur mobile */
@media (max-width: 768px) {
  input, select, textarea {
    font-size: 16px !important;
  }
}
```

### Règle 8 : Respect des Safe Areas et Viewports Dynamiques
Pour éviter que le contenu ne soit tronqué par l'encoche (notch) ou la barre de navigation système :
```css
body {
  height: 100dvh; /* Utiliser dvh plutôt que vh pour éviter les sauts d'interface */
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

---

## 3. COMPOSANTS SPÉCIFIQUES À L'USAGE MOBILE

### A. Bottom Sheets (Tiroirs Inférieurs) au lieu des Modales Centrées
Sur smartphone, une modale centrée avec une croix en haut à droite est inconfortable à atteindre et bloque l'écran.  
**Règle Zadesk Mobile :** Tout dialogue ou détail de dossier s'ouvre sous la forme d'une **Bottom Sheet** qui remonte depuis le bas de l'écran :
- Poignée tactile en haut (`width: 36px; height: 4px; border-radius: 9999px; background: #CBD5E1;`).
- Fermeture naturelle d'un glissement vers le bas (swipe down).
- Fond blanc avec coins supérieurs arrondis à 16px (`rounded-t-2xl`).

### B. La Bottom Navigation Bar Officielle à 5 Onglets (Phase 1 Validée)
La barre de navigation basse respecte strictement les 5 onglets canoniques validés :
1. **Accueil (`/app`) :** Vue synthétique opérationnelle et arbitrage des urgences du quart.
2. **Conversations (`/app/conversations`) :** Messagerie directe avec les clients via le portail web.
3. **Demandes (`/app/tickets`) :** Liste et suivi des réclamations formelles.
4. **Paramètres (`/app/settings`) :** Réglages du compte, profil, agences et notifications.
5. **Menu :** Ouvre le tiroir latéral complet donnant accès à l'ensemble des 5 piliers métier (Service Client, Mon Équipe, Intelligence Artificielle, Performances, Administration).

### C. Philosophie Tactile : Cartes vs Surfaces Ouvertes sur Mobile
- **La Carte (Card / Plate) :** Réservée aux unités décisionnelles discrètes et autonomes. Sur mobile, l'îlot d'arbitrage prioritaire n°1 bénéficie d'un traitement en carte (fond blanc, liseré ambre de 4px, bouton pleine largeur de 44px) car il s'agit d'un point focal unique exigeant une action.
- **La Surface Ouverte & Liste Continue :** Utilisée pour la file de traitement des demandes et les conversations. Les lignes sont séparées par de simples hairlines de 1px (`rgba(13, 27, 61, 0.08)`). Enfermer chaque ticket dans une boîte blanche sur smartphone consommerait 24px de marges inutiles par élément et réduirait considérablement le nombre d'éléments visibles sans défilement.

---

## 4. EXPÉRIENCE PWA INSTALLABLE

Lorsque Zadesk est installé sur l'écran d'accueil d'un smartphone (PWA) :
- `display: standalone` : suppression totale de l'URL bar du navigateur.
- `theme-color: #FAFAF8` (ou `#FFFFFF`) pour harmoniser la barre de statut système avec le design Zadesk.
- `overscroll-behavior-y: none` pour empêcher l'effet élastique d'actualisation involontaire lors du défilement des listes de tickets.

---
*Ces directives garantissent une sensation d'application native de premier ordre pour les utilisateurs mobiles de Zadesk.*
