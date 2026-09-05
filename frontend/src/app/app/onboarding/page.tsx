'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  PhoneCall,
  UserPlus,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  QrCode,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';

const steps = [
  { id: 1, title: 'Informations Entreprise', icon: Building2, desc: 'Identité et agence principale' },
  { id: 2, title: 'Connexion WhatsApp', icon: PhoneCall, desc: 'Lier votre numéro Zavu' },
  { id: 3, title: 'Équipe & Conseillers', icon: UserPlus, desc: 'Inviter vos agents SAV' },
  { id: 4, title: 'Base RAG & Documents', icon: BookOpen, desc: 'Importer vos procédures et FAQ' },
  { id: 5, title: 'Intelligence IA', icon: Sparkles, desc: 'Tonalité et règles d’escalade' },
  { id: 6, title: 'Activation SAV', icon: CheckCircle2, desc: 'Mise en ligne de votre guichet' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { currentWorkspace } = useWorkspace();
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [companyName, setCompanyName] = useState(currentWorkspace?.name || 'Mon Entreprise');
  const [sector, setSector] = useState('E-commerce & Distribution');
  const [city, setCity] = useState('Abidjan');
  const [whatsappNumber, setWhatsappNumber] = useState('+225 07 00 00 00 00');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentRole, setAgentRole] = useState('AGENT');
  const [invitedList, setInvitedList] = useState<Array<{ email: string; role: string }>>([]);
  const [aiConfidence, setAiConfidence] = useState(85);

  const handleAddAgent = () => {
    if (!agentEmail.trim()) return;
    setInvitedList((prev) => [...prev, { email: agentEmail.trim(), role: agentRole }]);
    setAgentEmail('');
  };

  const handleFinish = () => {
    router.push('/app');
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Assistant de Démarrage Zadesk
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Construisons votre SAV Intelligent
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Configurez votre espace en quelques minutes pour commencer à automatiser et fluidifier vos échanges WhatsApp.
        </p>
      </div>

      {/* Steps Stepper */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="grid grid-cols-6 gap-2">
          {steps.map((s) => {
            const isDone = s.id < currentStep;
            const isCurrent = s.id === currentStep;
            const Icon = s.icon;

            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl text-center transition-all ${
                  isCurrent
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                    : isDone
                    ? 'text-emerald-600 hover:bg-slate-50'
                    : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrent
                      ? 'bg-emerald-600 text-white'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <span className="text-[10px] font-medium truncate w-full hidden sm:block">
                  {s.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl shadow-slate-200/40 space-y-6">
        {/* Step 1 */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">Étape 1 : Informations de votre Entreprise</h2>
              <p className="text-xs text-slate-500">Précisez le nom officiel et l&apos;implantation principale de votre activité.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Nom de l&apos;organisation / Entreprise</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Secteur d&apos;activité</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="E-commerce & Distribution">Commerce, Vente en ligne & Distribution</option>
                    <option value="Services & Télécoms">Services, Télécoms & IT</option>
                    <option value="Santé & Cliniques">Santé, Cliniques & Pharmacies</option>
                    <option value="Éducation & Formation">Éducation & Formation</option>
                    <option value="Transport & Logistique">Transport, Livraison & Logistique</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Ville du siège / Agence principale</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">Étape 2 : Connexion de votre numéro WhatsApp</h2>
              <p className="text-xs text-slate-500">Liez votre numéro professionnel via la passerelle Cloud Zavu.</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Passerelle Zavu WhatsApp</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">Permet à votre IA et à vos agents de dialoguer directement avec vos clients.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert('Affichage du QR Code d’appairage')}
                className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 shrink-0"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Scanner QR Code</span>
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700">Numéro WhatsApp Business officiel</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Step 3 */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">Étape 3 : Ajouter votre Équipe SAV</h2>
              <p className="text-xs text-slate-500">Invitez vos conseillers. Ils recevront un lien direct pour rejoindre votre Workspace.</p>
            </div>

            <div className="flex gap-2">
              <input
                type="email"
                placeholder="email.conseiller@entreprise.ci"
                value={agentEmail}
                onChange={(e) => setAgentEmail(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
              />
              <select
                value={agentRole}
                onChange={(e) => setAgentRole(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
              >
                <option value="AGENT">Agent (SAV Quotidien)</option>
                <option value="MANAGER">Manager (Opérations)</option>
                <option value="ADMIN">Admin (Supervision)</option>
              </select>
              <Button size="sm" onClick={handleAddAgent} className="shrink-0">
                Ajouter
              </Button>
            </div>

            {invitedList.length > 0 && (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-2 text-xs">
                {invitedList.map((inv, idx) => (
                  <div key={idx} className="py-2 px-3 flex items-center justify-between">
                    <span className="text-slate-800 font-medium">{inv.email}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold">
                      {inv.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4 */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">Étape 4 : Base de Connaissances & Procédures (RAG)</h2>
              <p className="text-xs text-slate-500">Fournissez les documents que l&apos;IA doit utiliser pour répondre précisément.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { title: 'Politique de Retour & Remboursement Wave', state: 'Pré-chargé' },
                { title: 'Délais de Livraison Abidjan / Intérieur', state: 'Pré-chargé' },
                { title: 'Guide SAV & Dépannage Matériel', state: 'Pré-chargé' },
                { title: 'Conditions Générales de Garantie', state: 'Pré-chargé' },
              ].map((doc, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-800 truncate pr-2">{doc.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                    {doc.state}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5 */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">Étape 5 : Intelligence IA & Règles d&apos;Escalade</h2>
              <p className="text-xs text-slate-500">Définissez quand l&apos;IA répond en autonomie et quand elle transfère aux agents humains.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Seuil de certitude RAG requis</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {aiConfidence}% de certitude
                </span>
              </div>
              <input
                type="range"
                min="60"
                max="98"
                value={aiConfidence}
                onChange={(e) => setAiConfidence(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                En dessous de {aiConfidence}%, l&apos;IA ne devine rien et passe immédiatement la main à un conseiller de votre équipe.
              </p>
            </div>
          </div>
        )}

        {/* Step 6 */}
        {currentStep === 6 && (
          <div className="space-y-5 text-center py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Votre SAV Zadesk est Prêt !</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Votre entreprise <strong className="text-slate-800">{companyName}</strong> dispose maintenant d&apos;un centre de contrôle SAV moderne avec IA hybride et dossiers de continuité.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Footer Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Étape précédente
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setCurrentStep((prev) => prev + 1)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Continuer
            </Button>
          ) : (
            <Button
              variant="gradient"
              size="sm"
              onClick={handleFinish}
              rightIcon={<Zap className="w-4 h-4" />}
            >
              Accéder à mon Espace SAV
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
