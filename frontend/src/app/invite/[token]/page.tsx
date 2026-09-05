'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  UserCheck,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';

interface InvitationData {
  id: string;
  email: string;
  role: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  invitedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    async function loadInvitation() {
      if (!token) return;
      try {
        const res = await apiRequest(`/workspaces/invitations/${token}`);
        if (res.success && res.invitation) {
          setInvitation(res.invitation);
        } else {
          setError(res.message || 'Invitation introuvable ou expirée.');
        }
      } catch (err: any) {
        setError(err.message || 'Lien d’invitation invalide ou expiré.');
      } finally {
        setLoading(false);
      }
    }
    loadInvitation();
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);
    try {
      const res = await apiRequest(`/workspaces/invitations/${token}/accept`, {
        method: 'POST',
      });
      if (res.success) {
        setAccepted(true);
        setTimeout(() => {
          router.push('/app');
        }, 1200);
      } else {
        setError(res.message || 'Impossible d’accepter l’invitation.');
      }
    } catch (err: any) {
      setError(err.message || 'Veuillez vous connecter pour accepter l’invitation.');
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="mb-6">
        <Logo size="lg" />
      </div>

      <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-200/60 space-y-6 text-center">
        {loading ? (
          <div className="py-12 space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Vérification de l’invitation...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Invitation non valide</h2>
              <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
            </div>
            <Link href="/login" className="block pt-2">
              <Button variant="outline" className="w-full">
                Aller à la connexion
              </Button>
            </Link>
          </div>
        ) : accepted ? (
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Bienvenue dans l’équipe !</h2>
              <p className="text-xs text-slate-500">
                Vous avez rejoint <strong className="text-slate-900">{invitation?.workspace.name}</strong>. Redirection vers votre espace...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-inner">
              <Building2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Invitation d’équipe Zadesk
              </span>
              <h1 className="text-xl font-bold text-slate-900">
                Rejoignez {invitation?.workspace.name}
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong className="text-slate-700">{invitation?.invitedBy.firstName} {invitation?.invitedBy.lastName}</strong> vous invite à rejoindre l’espace SAV avec le rôle de{' '}
                <span className="font-semibold text-emerald-600 capitalize">{invitation?.role.toLowerCase()}</span>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Email invité :</span>
                <span className="font-semibold text-slate-800">{invitation?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Espace de travail :</span>
                <span className="font-semibold text-slate-800">{invitation?.workspace.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rôle attribué :</span>
                <span className="font-bold text-emerald-600">{invitation?.role}</span>
              </div>
            </div>

            <Button
              variant="gradient"
              onClick={handleAccept}
              isLoading={accepting}
              className="w-full py-3 text-sm font-bold shadow-lg shadow-emerald-500/20"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Accepter l’invitation & Rejoindre
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
