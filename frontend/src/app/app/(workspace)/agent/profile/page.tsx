'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  AlertCircle,
  Lock,
  RefreshCw,
  User,
  Sliders,
  Bell,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { agentApi } from '@/lib/api';
import {
  AgentProfileData,
  AvailabilityState,
  PresenceState,
  AccountStatus,
} from '@/types/workspace';

const PRESENCE_META: Record<
  PresenceState,
  { label: string; dotClass: string; desc: string }
> = {
  ONLINE: {
    label: 'En ligne',
    dotClass: 'bg-[#22C55E]',
    desc: 'Session active détectée avec activité récente.',
  },
  AWAY: {
    label: 'Absent',
    dotClass: 'bg-amber-500',
    desc: 'Session connectée sans activité récente.',
  },
  OFFLINE: {
    label: 'Hors ligne',
    dotClass: 'bg-slate-300',
    desc: 'Aucun signal de présence actif détecté.',
  },
};

const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  ACTIVE: 'Actif',
  SUSPENDED: 'Suspendu',
  ARCHIVED: 'Archivé',
};

const AVAILABILITY_OPTIONS: Array<{
  id: AvailabilityState;
  label: string;
  desc: string;
}> = [
  {
    id: 'AVAILABLE',
    label: 'Disponible',
    desc: 'Peut recevoir de nouvelles demandes et affectations.',
  },
  {
    id: 'BUSY',
    label: 'Occupé',
    desc: 'En traitement — suspend les nouvelles affectations automatiques.',
  },
  {
    id: 'DND',
    label: 'Ne pas déranger',
    desc: 'Ne pas solliciter pour de nouvelles demandes.',
  },
];

export default function AgentProfilePage() {
  const { currentWorkspace, user, userRole, myPresence } = useWorkspace();
  const [profile, setProfile] = useState<AgentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const [availability, setAvailability] = useState<AvailabilityState>('AVAILABLE');
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [notificationApp, setNotificationApp] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    try {
      const data = await agentApi.getProfile(currentWorkspace.id);
      if (data) {
        setProfile(data);
        setAvailability(
          data.availability === 'BUSY' || data.availability === 'DND'
            ? data.availability
            : 'AVAILABLE'
        );
        setMaxCapacity(data.maxCapacity || 10);
        setNotificationApp(data.notificationApp !== false);
        setNotificationEmail(data.notificationEmail !== false);
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Impossible de charger votre profil conseiller.',
      });
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace?.id) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await agentApi.updateProfile(currentWorkspace.id, {
        availability,
        maxCapacity: Number(maxCapacity),
        notificationApp,
        notificationEmail,
      });
      if (res?.profile) {
        setProfile(res.profile);
      }
      setFeedback({ type: 'success', text: 'Disponibilité et paramètres enregistrés.' });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Échec de la mise à jour de vos paramètres.',
      });
    } finally {
      setSaving(false);
    }
  };

  const livePresence = myPresence !== 'OFFLINE' ? myPresence : profile?.presence || 'OFFLINE';
  const presenceMeta = PRESENCE_META[livePresence];
  const accountLabel = ACCOUNT_STATUS_LABEL[profile?.accountStatus || 'ACTIVE'];

  return (
    <div className="max-w-3xl space-y-6 pb-12">
      {feedback && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2 text-xs font-semibold border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          Rôle actif : <strong className="text-[#0D1B3D]">{userRole}</strong>
        </span>
        <button
          type="button"
          onClick={() => fetchProfile()}
          className="h-9 px-3 rounded-lg bg-white hover:bg-[#F4F3EF] text-slate-600 border border-[#E5E4DF] cursor-pointer flex items-center gap-1.5 text-xs font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0D1B3D]' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Bloc 1 : Présence détectée & État administratif (lecture seule) */}
      <div className="p-5 rounded-xl bg-white border border-[#E5E4DF] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E4DF] pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-bold text-[#0D1B3D]">
              Identité, présence détectée & état du compte
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Lecture seule</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] space-y-1">
            <span className="text-[10px] font-medium text-slate-400 block">
              Présence détectée par Zalisk
            </span>
            <div className="flex items-center gap-2 font-bold text-[#0D1B3D]">
              <span className={`w-2 h-2 rounded-full ${presenceMeta.dotClass}`} />
              <span>{presenceMeta.label}</span>
            </div>
            <p className="text-[11px] text-slate-500">{presenceMeta.desc}</p>
          </div>

          <div className="p-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] space-y-1">
            <span className="text-[10px] font-medium text-slate-400 block">
              État administratif du compte
            </span>
            <p className="font-bold text-[#0D1B3D]">{accountLabel}</p>
            <p className="text-[11px] text-slate-500">
              {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()} ·{' '}
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Bloc 2 : Disponibilité contrôlée par le conseiller */}
        <div className="p-5 rounded-xl bg-white border border-[#E5E4DF] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E4DF] pb-3">
            <Sliders className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-bold text-[#0D1B3D]">
              Ma disponibilité & capacité opérationnelle
            </h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#0D1B3D] block">
              Souhaitez-vous recevoir de nouvelles demandes ?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {AVAILABILITY_OPTIONS.map((opt) => {
                const selected = availability === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setAvailability(opt.id)}
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#FAFAF8] border-[#0D1B3D] ring-1 ring-[#0D1B3D]/20'
                        : 'bg-white border-[#E5E4DF] hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <span className="text-xs font-bold text-[#0D1B3D] block">{opt.label}</span>
                    <span className="text-[11px] text-slate-500 block mt-1 leading-snug">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 max-w-xs space-y-1">
            <label className="text-xs font-semibold text-[#0D1B3D] block">
              Capacité maximale simultanée (dossiers)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Math.max(1, Math.min(30, Number(e.target.value))))}
              className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs font-semibold text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
            />
          </div>
        </div>

        {/* Bloc 3 : Compétences (lecture seule pour le conseiller) */}
        <div className="p-5 rounded-xl bg-white border border-[#E5E4DF] space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5E4DF] pb-3">
            <h2 className="text-xs font-bold text-[#0D1B3D]">Mes compétences associées</h2>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Gérées par l&apos;entreprise</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {profile?.skills && profile.skills.length > 0 ? (
              profile.skills.map((sk) => (
                <span
                  key={sk.id}
                  className="px-2.5 py-1 rounded-md bg-[#F4F3EF] border border-[#E5E4DF] text-xs font-medium text-[#0D1B3D]"
                >
                  {sk.skill?.name || sk.skill?.code}
                </span>
              ))
            ) : (
              <p className="text-xs text-slate-500">
                Aucune compétence spécifique associée — vous traitez l&apos;ensemble des demandes
                générales.
              </p>
            )}
          </div>

          {['OWNER', 'ADMIN', 'MANAGER'].includes(userRole) && (
            <div className="pt-1">
              <Link
                href="/app/agents"
                className="text-xs font-medium text-[#0D1B3D] hover:underline"
              >
                Gérer les compétences dans Équipe et accès →
              </Link>
            </div>
          )}
        </div>

        {/* Bloc 4 : Préférences de notifications */}
        <div className="p-5 rounded-xl bg-white border border-[#E5E4DF] space-y-3">
          <div className="flex items-center gap-2 border-b border-[#E5E4DF] pb-3">
            <Bell className="w-4 h-4 text-slate-400" />
            <h2 className="text-xs font-bold text-[#0D1B3D]">Préférences de notifications</h2>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={notificationApp}
              onChange={(e) => setNotificationApp(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#0D1B3D] focus:ring-[#0D1B3D]"
            />
            <span>Recevoir les alertes temps réel dans Zalisk et par notification bureau</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#0D1B3D] focus:ring-[#0D1B3D]"
            />
            <span>Recevoir un rappel par e-mail lorsque je suis hors ligne ou sans push actif</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 h-10 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer mes paramètres'}
          </button>
        </div>
      </form>
    </div>
  );
}
