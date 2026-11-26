'use client';

import React, { useState } from 'react';
import {
  Modal,
  ConfirmationModal,
} from '@/components/ui/Modal';
import { ContextMenu } from '@/components/ui/ContextMenu';
import {
  OperationalCard,
  NavigationCard,
  FinancialCard,
  MetricCard,
} from '@/components/ui/CardVariants';
import {
  InvoiceDocument,
  InvoiceData,
} from '@/components/ui/InvoiceDocument';
import {
  Eye,
  Edit2,
  Trash2,
  Share2,
  MessageSquare,
  FolderKanban,
  CheckCircle2,
  Plus,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Layers,
  Sparkles,
} from 'lucide-react';

const SAMPLE_INVOICE: InvoiceData = {
  invoiceNumber: 'ZD-INV-2026-0891',
  issueDate: '01 Nov 2026',
  dueDate: '15 Nov 2026',
  paidAt: '01 Nov 2026 à 14:28',
  paymentMethod: 'Airtel Money Congo (via SasPay)',
  transactionReference: 'SAS-PAY-99214-CG',
  status: 'PAID',
  emitter: {
    name: 'Zalisk Technologies SAS',
    legalForm: 'Société par Actions Simplifiée',
    address: 'Avenue Denis Sassou Nguesso, Centre-Ville',
    city: 'Brazzaville',
    country: 'République du Congo',
    rccm: 'CG-BZV-01-2024-B14-00192',
    nif: '0202410984920',
    supportEmail: 'facturation@zadesk.com',
  },
  client: {
    workspaceName: 'Boutique Japhet',
    contactName: 'Japhet Ikoule',
    email: 'contact@boutique-japhet.cg',
    address: 'Plateau des 15 Ans, Moungali',
    city: 'Brazzaville',
    country: 'Congo',
  },
  items: [
    {
      id: 'item-1',
      description: 'Abonnement Zalisk Entreprise — Forfait Starter',
      details: 'Dispositif de relation client SAV, 2 conseillers inclus, messagerie instantanée directe',
      quantity: 1,
      unitPriceXaf: 10000,
      totalXaf: 10000,
    },
    {
      id: 'item-2',
      description: 'Pack Établissement Secondaire — Agence Moungali',
      details: 'Gestion multi-boutique et routage des réclamations locales',
      quantity: 1,
      unitPriceXaf: 5000,
      totalXaf: 5000,
    },
  ],
  subtotalXaf: 15000,
  taxRatePercent: 0,
  taxAmountXaf: 0,
  totalXaf: 15000,
  currency: 'FCFA',
};

export default function DesignSystemLaboratoryPage() {
  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState(false);

  // Form states
  const [ticketCategory, setTicketCategory] = useState('Matériel');
  const [ticketPriority, setTicketPriority] = useState('HIGH');
  const [ticketSubject, setTicketSubject] = useState('Problème de chargeur sur terminal POS');
  const [ticketClient, setTicketClient] = useState('Koffi Jean-Luc');

  // Context menu feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="space-y-10 pb-20 select-none">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Laboratory Header */}
      <div className="border-b border-slate-200/80 pb-6 pt-2">
        <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs mb-1">
          <Layers className="w-4 h-4" />
          <span>Bibliothèque de Design Patterns • Zalisk UI System</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
          Patterns & Composants Officiels
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
          Prototype interactif représentatif des 4 familles de design patterns pour la Workspace : 
          <strong> Menus & Pop-ups</strong>, <strong>Modales & Dialogues</strong>, <strong>Facturation Professionnelle</strong> et <strong>Cartes Spécialisées</strong>.
        </p>
      </div>

      {/* ============================================================== */}
      {/* 1. SECTION : POP-UPS & MENUS CONTEXTUELS                       */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-sans">
              1. Menus contextuels & Popovers
            </h2>
            <p className="text-xs text-slate-500">
              Micro-interactions fluides, positionnement intelligent et gestion du clavier (Échap / Flèches).
            </p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-700 block">
              Menu d&apos;actions de dossier :
            </span>
            <p className="text-[11px] text-slate-400">
              Cliquez pour ouvrir le menu d&apos;action contextuelle.
            </p>
          </div>

          <ContextMenu
            items={[
              {
                id: 'view',
                label: 'Consulter le dossier',
                icon: Eye,
                shortcut: '⌘O',
                onClick: () => showToast('Action : Consultation du dossier'),
              },
              {
                id: 'edit',
                label: 'Modifier la priorité',
                icon: Edit2,
                onClick: () => showToast('Action : Modification de priorité'),
              },
              {
                id: 'share',
                label: 'Partager le lien',
                icon: Share2,
                shortcut: '⌘C',
                onClick: () => showToast('Lien copié dans le presse-papiers'),
              },
              {
                id: 'delete',
                label: 'Clôturer définitivement',
                icon: Trash2,
                variant: 'danger',
                dividerBefore: true,
                onClick: () => setConfirmModalOpen(true),
              },
            ]}
          />

          <div className="w-[1px] h-10 bg-slate-200 hidden sm:block" />

          {/* Trigger Personnalisé sous forme de Bouton d'Action */}
          <ContextMenu
            align="left"
            trigger={
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center gap-2 active:scale-95 cursor-pointer shadow-sm"
              >
                <span>Actions rapides SAV</span>
                <span className="text-slate-400">▾</span>
              </button>
            }
            items={[
              {
                id: 'new-ticket',
                label: 'Créer un nouveau dossier',
                icon: Plus,
                shortcut: '⌘N',
                onClick: () => setFormModalOpen(true),
              },
              {
                id: 'resolve',
                label: 'Marquer comme résolu',
                icon: CheckCircle2,
                variant: 'success',
                onClick: () => showToast('Dossier marqué comme résolu'),
              },
            ]}
          />
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. SECTION : MODALES & DIALOGUES                               */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-sans">
            2. Modales & Dialogues Système
          </h2>
          <p className="text-xs text-slate-500">
            Fidélité Apple Design : animation spring interruptible, header/footer fixes, scroll interne et adaptation responsive en tiroir inférieur (Bottom Sheet) sur mobile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card Trigger 1 : Form Modal */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Modale de Formulaire (Création / Qualification)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Exemple complet avec champs structurés, sélecteurs d&apos;urgence, validation et actions principales / secondaires.
            </p>
            <button
              type="button"
              onClick={() => setFormModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all active:scale-95 shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ouvrir la modale formulaire</span>
            </button>
          </div>

          {/* Card Trigger 2 : Confirmation Modal */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">
              Modale de Confirmation (Action Critique)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Protection contre les actions destructives ou irréversibles avec explications claires des conséquences.
            </p>
            <button
              type="button"
              onClick={() => setConfirmModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-rose-700 font-semibold text-xs transition-all active:scale-95 cursor-pointer flex items-center gap-2 border border-slate-200"
            >
              <span>Tester la modale de confirmation</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. SECTION : CARDS SPÉCIALISÉES (FAMILLES DISTINCTES)          */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-sans">
            3. Familles de Cartes Spécialisées
          </h2>
          <p className="text-xs text-slate-500">
            Chaque carte possède une structure et des interactions adaptées à son rôle : opérationnel, navigation, finance ou statistique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Carte 1 : Opérationnelle */}
          <OperationalCard
            title="Koffi Jean-Luc"
            subtitle="Terminal POS #POS-991"
            statusText="Priorité haute"
            statusVariant="danger"
            timeAgo="13:30"
            quote="Bonjour, mon matériel a été déposé hier en agence. Avez-vous débuté l'expertise ?"
            actionLabel="Prendre en charge"
            onAction={() => showToast('Prise en charge du client Koffi Jean-Luc')}
          />

          {/* Carte 2 : Navigation */}
          <NavigationCard
            title="Cockpit Conversations"
            description="Boîte de réception unifiée en temps réel avec qualification automatique."
            icon={MessageSquare}
            href="/app/conversations"
            badge="En direct"
          />

          {/* Carte 3 : Métrique / KPI (Quantro Style) */}
          <MetricCard
            label="Résolution moyenne SAV"
            value="18 min"
            changeText="+14% plus rapide ce mois"
            trend="up"
            icon={FolderKanban}
          />

          {/* Carte 4 : Financière */}
          <FinancialCard
            planName="Starter"
            priceFormatted="10 000 FCFA"
            period="/ mois"
            status="ACTIVE"
            nextBillingDate="01 Déc 2026"
            onViewInvoice={() => setInvoicePreviewOpen(true)}
          />
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. SECTION : FACTURATION PROFESSIONNELLE & IMPRESSION          */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-sans">
              4. Facturation Professionnelle & Reçus
            </h2>
            <p className="text-xs text-slate-500">
              Document officiel certifié prêt pour l&apos;impression A4 ou l&apos;exportation PDF avec données réelles (FCFA / SasPay).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setInvoicePreviewOpen((prev) => !prev)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors active:scale-95 cursor-pointer flex items-center gap-2 self-start"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>{invoicePreviewOpen ? 'Masquer la facture' : 'Afficher la facture officielle'}</span>
          </button>
        </div>

        {invoicePreviewOpen && (
          <div className="">
            <InvoiceDocument invoice={SAMPLE_INVOICE} />
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* MODALES EN CONDITIONS RÉELLES                                   */}
      {/* ============================================================== */}

      {/* A. Modale de Formulaire */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title="Créer un nouveau dossier SAV"
        subtitle="Enregistrez une nouvelle réclamation client avec attribution immédiate."
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setFormModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors active:scale-95"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={() => {
                setFormModalOpen(false);
                showToast('Dossier SAV créé avec succès');
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all active:scale-95"
            >
              Créer le dossier
            </button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Nom du client ou de l&apos;entreprise
            </label>
            <input
              type="text"
              value={ticketClient}
              onChange={(e) => setTicketClient(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all"
              placeholder="Ex: Koffi Jean-Luc"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Catégorie
              </label>
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all"
              >
                <option value="Matériel">Assistance Matérielle</option>
                <option value="Paiement">Paiement & Facturation</option>
                <option value="Accès">Compte & Accès</option>
                <option value="Autre">Autre demande</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Niveau d&apos;urgence
              </label>
              <select
                value={ticketPriority}
                onChange={(e) => setTicketPriority(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all font-semibold"
              >
                <option value="LOW">Basse (Standard)</option>
                <option value="MEDIUM">Moyenne (Sous 24h)</option>
                <option value="HIGH">Haute (Prioritaire)</option>
                <option value="CRITICAL">Critique (Immédiate)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Objet de la réclamation
            </label>
            <input
              type="text"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 block">
              Description détaillée des symptômes
            </label>
            <textarea
              rows={3}
              defaultValue="Le terminal s'éteint après 5 minutes d'utilisation sur batterie. Le témoin de charge reste rouge clignotant."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:bg-white transition-all leading-relaxed"
            />
          </div>
        </form>
      </Modal>

      {/* B. Modale de Confirmation */}
      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => {
          setConfirmModalOpen(false);
          showToast('Dossier clôturé avec succès');
        }}
        variant="danger"
        title="Clôturer définitivement le dossier ?"
        message="Cette action archivera la réclamation. Le client recevra un récapitulatif de clôture et ne pourra plus ajouter de nouveau message sur ce fil."
        confirmLabel="Oui, clôturer"
        cancelLabel="Conserver ouvert"
      />
    </div>
  );
}
