'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Shield,
  Sliders,
  Bell,
  CheckCircle2,
  AlertCircle,
  Lock,
  RefreshCw,
  Mail,
  User,
  Award,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { agentApi } from '@/lib/api';
import { AgentProfileData } from '@/types/workspace';

export default function AgentProfilePage() {
  const { currentWorkspace, user, userRole } = useWorkspace();
  const [profile, setProfile] = useState<AgentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [availability, setAvailability] = useState<'AVAILABLE' | 'BUSY' | 'AWAY' | 'OFFLINE'>('AVAILABLE');
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [notifications, setNotifications] = useState({
    ticketAssigned: true,
    ticketShared: true,
    customerMessage: true,
  });

  const fetchProfile = async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    try {
      const data = await agentApi.getProfile(currentWorkspace.id);
      if (data) {
        setProfile(data);
        setAvailability(data.availability || 'AVAILABLE');
        setMaxCapacity(data.maxCapacity || 10);
        if (data.notificationPreferences) {
          setNotifications((prev) => ({ ...prev, ...data.notificationPreferences }));
        }
      }
    } catch (err: any) {
      console.error('Failed to load agent profile:', err);
      setFeedback({ type: 'error', text: err.message || 'Impossible de charger le profil agent.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentWorkspace?.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    setSaving(true);
    setFeedback(null);
    try {
      await agentApi.updateProfile(currentWorkspace.id, {
        availability,
        maxCapacity: Number(maxCapacity),
        notificationPreferences: notifications,
      });
      setFeedback({ type: 'success', text: 'Profil mis à jour avec succès.' });
      await fetchProfile();
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Échec de la mise à jour du profil.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in pb-12">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Paramètres Opérationnels
              </span>
              <span className="text-xs text-slate-400">Rôle : <strong className="text-slate-700 capitalize">{userRole.toLowerCase()}</strong></span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Mon Profil Agent SAV
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Gérez votre disponibilité en temps réel, votre capacité de prise en charge et vos notifications.
            </p>
          </div>

          <button
            onClick={() => fetchProfile()}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer shadow-2xs self-start sm:self-auto"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Coordonnées & Identité (Lecture seule autorisée) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Coordonnées Professionnelles
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Prénom & Nom
              </label>
              <input
                type="text"
                disabled
                value={user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Adresse E-mail
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-semibold cursor-not-allowed"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Les coordonnées du compte sont administrées au niveau global de l&apos;authentification Zadesk.
          </p>
        </div>

        {/* Card 2: Disponibilité & Capacité de traitement */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Disponibilité & Capacité Opérationnelle
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Statut de disponibilité actuel
              </label>
              <select
                aria-label="Statut de disponibilité actuel"
                value={availability}
                onChange={(e) => setAvailability(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="AVAILABLE">🟢 Disponible (Reçoit les nouveaux dossiers)</option>
                <option value="BUSY">🟠 En ligne / Occupé (Priorité aux dossiers en cours)</option>
                <option value="AWAY">🟡 En pause / Absent (Suspend les attributions)</option>
                <option value="OFFLINE">⚪ Hors ligne (Déconnecté du service)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Le moteur d&apos;attribution n&apos;affecte de nouveaux dossiers qu&apos;aux agents au statut Disponible.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Capacité maximale simultanée (Dossiers)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Math.max(1, Math.min(30, Number(e.target.value))))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Nombre maximum de dossiers ouverts simultanés avant mise en attente.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Compétences Validées (Non modifiables librement par l'agent) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Compétences Validées & Certifiées
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Certifié par l&apos;Entreprise</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Vos compétences déterminent les dossiers que le moteur automatique vous affecte en priorité. Conformément aux règles de sécurité, elles sont certifiées par vos superviseurs.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {profile?.skills && profile.skills.length > 0 ? (
              profile.skills.map((sk) => (
                <div
                  key={sk.id}
                  className="px-3.5 py-2 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{sk.skill?.name || sk.skill?.code}</span>
                  {sk.isPrimary && (
                    <span className="text-[9px] font-bold bg-indigo-200/80 text-indigo-900 px-1.5 py-0.2 rounded-md">
                      Majeure
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">
                Aucune compétence spécifique renseignée. Vous recevrez les dossiers d&apos;assistance générale.
              </p>
            )}
          </div>
        </div>

        {/* Card 4: Préférences de notifications */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Préférences de Notifications Internes
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.ticketAssigned}
                onChange={(e) => setNotifications({ ...notifications, ticketAssigned: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs text-slate-700 font-medium">
                M&apos;alerter immédiatement lors de l&apos;affectation automatique d&apos;un nouveau ticket
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.ticketShared}
                onChange={(e) => setNotifications({ ...notifications, ticketShared: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs text-slate-700 font-medium">
                M&apos;alerter lorsqu&apos;un collègue me partage un dossier de support
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.customerMessage}
                onChange={(e) => setNotifications({ ...notifications, customerMessage: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-xs text-slate-700 font-medium">
                M&apos;alerter lors de la réception d&apos;un nouveau message sur mes conversations actives
              </span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer mes paramètres'}
          </button>
        </div>
      </form>
    </div>
  );
}
