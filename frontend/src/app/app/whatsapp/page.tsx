'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  QrCode,
  CheckCircle2,
  Copy,
  Save,
  Shield,
  Smartphone,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';

export default function WhatsAppPage() {
  const { currentWorkspace } = useWorkspace();
  const [phoneNumber, setPhoneNumber] = useState('+225 07 00 00 00 00');
  const [senderName, setSenderName] = useState('Zadesk SAV Officiel');
  const [greetingMessage, setGreetingMessage] = useState(
    'Bonjour et bienvenue au SAV Zadesk ! Que puis-je faire pour vous aujourd’hui ?'
  );
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const webhookUrl = `https://api.zadesk.com/webhooks/whatsapp/${currentWorkspace?.slug || 'my-workspace'}`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-600" />
            Canal WhatsApp & Intégration Zavu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Connectez vos numéros officiels WhatsApp Business pour recevoir et expédier les messages en temps réel.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Paramètres enregistrés !</span>
          </div>
        )}
      </div>

      {/* WhatsApp Status Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-emerald-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-900">Canal WhatsApp Connecté</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Numéro lié : <strong className="text-slate-800 font-mono">{phoneNumber}</strong>
            </p>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              Passerelle Cloud Zavu API opérationnelle (99.98% disponibilité)
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Affichage du QR Code de ré-appairage')}
          className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-2 self-start sm:self-auto shadow-2xs cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-emerald-600" />
          <span>Scanner QR Code</span>
        </button>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            Paramètres du Numéro WhatsApp
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700">Numéro WhatsApp Business</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700">Nom d&apos;expéditeur affiché</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2 text-xs">
            <label className="font-semibold text-slate-700">
              Message d&apos;accueil automatique (Nouveau contact)
            </label>
            <textarea
              rows={3}
              value={greetingMessage}
              onChange={(e) => setGreetingMessage(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Webhook Card */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-600" />
            URL de Réception Webhook
          </h2>
          <p className="text-xs text-slate-500">
            Cette URL reçoit les messages entrants de la passerelle WhatsApp Zavu pour votre workspace.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-mono select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="gradient" rightIcon={<Save className="w-4 h-4" />}>
            Enregistrer les Paramètres WhatsApp
          </Button>
        </div>
      </form>
    </div>
  );
}
