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
  LogOut,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';
import { getMeApi, logoutApi, UserProfile } from '@/lib/auth';

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
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [invRes, meRes]: [any, any] = await Promise.all([
        apiRequest(`/workspaces/invitations/${token}`).catch((err) => ({
          success: false,
          invitation: null,
          message: err.message,
        })),
        getMeApi().catch(() => ({ authenticated: false, user: null })),
      ]);

      if (invRes.success && invRes.invitation) {
        setInvitation(invRes.invitation);
      } else {
        setError(invRes.message || 'Invitation introuvable ou expirée.');
      }

      if (meRes.authenticated && meRes.user) {
        setIsAuthenticated(true);
        setCurrentUser(meRes.user);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch (err: any) {
      setError(err.message || 'Lien d’invitation invalide ou expiré.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutApi();
      setIsAuthenticated(false);
      setCurrentUser(null);
    } catch (err) {
      // ignore
    } finally {
      setLoggingOut(false);
    }
  };

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
      setError(err.message || 'Erreur lors de l’acceptation de l’invitation.');
    } finally {
      setAccepting(false);
    }
  };

  const isEmailMatching =
    isAuthenticated &&
    currentUser &&
    invitation &&
    currentUser.email.toLowerCase().trim() === invitation.email.toLowerCase().trim();

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

            {/* Invitation Details Summary */}
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

            {/* Auth States & Actions */}
            {isAuthenticated ? (
              isEmailMatching ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span>Connecté en tant que <strong>{currentUser?.email}</strong></span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
              ) : (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-800 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Compte différent détecté
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      Vous êtes connecté avec <strong>{currentUser?.email}</strong>, mais cette invitation est réservée à <strong>{invitation?.email}</strong>.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    isLoading={loggingOut}
                    className="w-full py-2.5 text-xs font-semibold"
                    leftIcon={<LogOut className="w-3.5 h-3.5" />}
                  >
                    Se déconnecter pour changer de compte
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pour accepter cette invitation, veuillez vous identifier avec l’adresse <strong className="text-slate-800">{invitation?.email}</strong>.
                </p>

                <div className="space-y-2">
                  <Link
                    href={`/register?email=${encodeURIComponent(invitation?.email || '')}&inviteToken=${token}`}
                    className="block"
                  >
                    <Button
                      variant="gradient"
                      className="w-full py-2.5 text-xs font-bold shadow-md shadow-emerald-500/20"
                      leftIcon={<UserPlus className="w-4 h-4" />}
                    >
                      Nouveau sur Zadesk : Créer mon compte
                    </Button>
                  </Link>

                  <Link
                    href={`/login?email=${encodeURIComponent(invitation?.email || '')}&inviteToken=${token}`}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full py-2.5 text-xs font-semibold"
                      leftIcon={<LogIn className="w-4 h-4" />}
                    >
                      J’ai déjà un compte : Me connecter
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
