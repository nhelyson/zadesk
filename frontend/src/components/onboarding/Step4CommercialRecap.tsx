"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  ArrowRight, 
  ShieldCheck, 
  Info, 
  Clock, 
  Sparkles,
  Building2,
  Lock
} from "lucide-react";

export interface Step4CommercialRecapProps {
  companyName: string;
  planId: string;
  planName: string;
  priceXaf: number;
  workspaceSlug?: string;
  onContinueToWorkspace: () => void;
}

export const Step4CommercialRecap: React.FC<Step4CommercialRecapProps> = ({
  companyName,
  planId,
  planName,
  priceXaf,
  workspaceSlug,
  onContinueToWorkspace,
}) => {
  const router = useRouter();
  const [showGatewayPreparedModal, setShowGatewayPreparedModal] = useState(false);

  const formattedPrice = new Intl.NumberFormat("fr-FR").format(priceXaf);

  return (
    <div className="space-y-6">
      
      {/* 1. Bannière de succès immédiat : Espace créé et Découverte active */}
      <div className="p-5 rounded-3xl bg-emerald-50/80 border border-emerald-200/90 text-emerald-950 flex items-start gap-4 shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-bold tracking-tight text-emerald-900">
            Votre espace entreprise est prêt • Accès Découverte actif
          </div>
          <p className="text-xs leading-relaxed text-emerald-800">
            Votre espace <span className="font-semibold text-emerald-950">« {companyName} »</span> a été initialisé avec succès. Vous bénéficiez d&apos;ores et déjà de l&apos;accès gratuit Découverte en illimité.
          </p>
        </div>
      </div>

      {/* 2. Fiche Récapitulative Commerciale Contractuelle */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden divide-y divide-slate-100">
        
        {/* Entête du bon de commande / souscription */}
        <div className="p-6 sm:p-7 bg-[#FBFBFC]">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Récapitulatif de souscription
            </span>
            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
              Intention enregistrée
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0D1B3D] tracking-tight uppercase">
            Formule {planName}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Entreprise bénéficiaire : <span className="font-semibold text-slate-800">{companyName}</span>
          </p>
        </div>

        {/* Détail financier rigoureux sans artifice */}
        <div className="p-6 sm:p-7 space-y-4 text-xs sm:text-sm">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-600">Abonnement mensuel {planName}</span>
            <span className="font-mono font-bold text-slate-900">{formattedPrice} FCFA</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-600">Périodicité</span>
            <span className="font-medium text-slate-900">Mensuelle sans engagement</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-600">Frais de mise en service</span>
            <span className="font-mono font-semibold text-emerald-700">0 FCFA (Offerts)</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-slate-600">Engagement de durée</span>
            <span className="font-medium text-slate-900">Aucun (résiliation libre)</span>
          </div>

          {/* Montant total à régler maintenant */}
          <div className="pt-2 flex items-baseline justify-between text-base sm:text-lg font-black text-[#0D1B3D]">
            <span>Total à régler aujourd&apos;hui</span>
            <div className="text-right">
              <span className="font-mono text-2xl sm:text-3xl text-emerald-700">{formattedPrice}</span>
              <span className="font-mono text-xs sm:text-sm text-slate-500 ml-1.5 font-normal">FCFA (XAF)</span>
            </div>
          </div>

        </div>

        {/* Moyens de paiement disponibles */}
        <div className="p-6 sm:p-7 bg-slate-50/60 space-y-3">
          <span className="text-xs font-semibold text-slate-700 block">
            Moyens de paiement acceptés en zone CEMAC :
          </span>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <div className="px-3 py-2 rounded-xl bg-white border border-slate-200/90 font-medium inline-flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Airtel Money</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white border border-slate-200/90 font-medium inline-flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-amber-500" />
              <span>MTN Mobile Money</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-white border border-slate-200/90 font-medium inline-flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-[#0D1B3D]" />
              <span>Cartes bancaires (Visa / Mastercard)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Paiement sécurisé par SasPay CEMAC. Vos fonds sont traités directement sans conservation de coordonnées bancaires.
          </p>
        </div>

      </div>

      {/* 3. Garantie fondamentale de non-blocage de l'espace */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start gap-3 text-xs text-slate-600 leading-relaxed">
        <Info className="w-4 h-4 text-[#0D1B3D] shrink-0 mt-0.5" />
        <span>
          <strong className="text-slate-900">Règle de continuité :</strong> Si vous choisissez de différer ce règlement, votre espace reste immédiatement accessible en offre Découverte. Vous conservez toutes vos données et vos accès sans aucun blocage.
        </span>
      </div>

      {/* 4. Actions Explicites */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Action Secondaire : Découverte immédiate sans payer */}
        <button
          type="button"
          onClick={onContinueToWorkspace}
          style={{ touchAction: "manipulation" }}
          className="w-full sm:w-auto order-2 sm:order-1 h-12 px-5 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-950 font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Accéder à mon espace en Découverte</span>
        </button>

        {/* Action Principale : Passer au paiement */}
        <button
          type="button"
          onClick={() => setShowGatewayPreparedModal(true)}
          style={{ touchAction: "manipulation" }}
          className="w-full sm:w-auto order-1 sm:order-2 h-12 px-7 rounded-xl bg-[#0D1B3D] hover:bg-slate-900 active:scale-[0.98] text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-slate-900/10"
        >
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Procéder au paiement ({formattedPrice} FCFA)</span>
          <ArrowRight className="w-4 h-4 text-slate-300" />
        </button>

      </div>

      {/* MODAL : État de préparation de la passerelle SasPay */}
      {showGatewayPreparedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-[#0D1B3D]">
                Passerelle SasPay Préparée
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Le raccordement technique de facturation SasPay pour votre intention <span className="font-semibold text-slate-900">« {planName} »</span> ({formattedPrice} FCFA/mois) est validé côté serveur.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <div className="font-bold text-slate-900">État du parcours commercial :</div>
              <ul className="space-y-1 list-disc list-inside">
                <li>Votre espace entreprise est créé.</li>
                <li>L&apos;offre Découverte permanente est active sans limite.</li>
                <li>Votre intention de souscription est enregistrée.</li>
                <li>Les appels de paiement réels SasPay seront ouverts lors de la Phase D.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowGatewayPreparedModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={onContinueToWorkspace}
                className="w-full sm:w-auto h-11 px-6 rounded-xl bg-[#0D1B3D] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-xs"
              >
                <span>Accéder à mon espace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

