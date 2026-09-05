'use client';

import React, { useState } from 'react';
import {
  PhoneCall,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Save,
  MessageSquare,
  Shield,
  Smartphone,
  Zap,
} from 'lucide-react';
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
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-400" />
            Canal WhatsApp & Intégration Zavu
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Connectez vos numéros officiels WhatsApp Business pour recevoir et expédier les messages en temps réel.
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4" />
            <span>Paramètres enregistrés !</span>
          </div>
        )}
      </div>

      {/* WhatsApp Status Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0D1B3D] to-[#0D1B3D] border border-emerald-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Smartphone className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">Canal WhatsApp Actif & Connecté</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Numéro lié: <strong className="text-white font-mono">{phoneNumber}</strong>
            </p>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              Passerelle Cloud Zavu API opérationnelle (99.98% uptime)
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Affichage du QR Code de ré-appairage')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span>Scanner QR Code</span>
        </button>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Paramètres du Numéro WhatsApp
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Numéro WhatsApp Business
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Nom d&apos;expéditeur affiché
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold text-slate-300">
              Message d&apos;accueil automatique (Nouveau contact)
            </label>
            <textarea
              rows={3}
              value={greetingMessage}
              onChange={(e) => setGreetingMessage(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Webhook Card */}
        <div className="p-6 rounded-2xl bg-[#0D1B3D] border border-slate-800 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            URL de Réception Webhook
          </h2>
          <p className="text-xs text-slate-400">
            Cette URL reçoit les messages entrants de l&apos;API WhatsApp Zavu pour votre workspace.
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono select-all focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopyWebhook}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les Paramètres WhatsApp</span>
          </button>
        </div>
      </form>
    </div>
  );
}
