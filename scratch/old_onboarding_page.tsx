"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { OnboardingHeader, SaveStatus } from "@/components/onboarding/OnboardingHeader";
import { OnboardingPreview, OnboardingPreviewData } from "@/components/onboarding/OnboardingPreview";
import { workspaceApi, apiRequest } from "@/lib/api";
import { User } from "@/types/workspace";
import {
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  MessageSquare,
  MapPin,
  Building2,
  Sparkles,
  ArrowRight,
  Eye,
  Loader2,
} from "lucide-react";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .slice(0, 50);
}

const ACTIVITY_DOMAINS = [
  "Commerce et boutique",
  "Alimentation et restauration",
  "Beauté et bien-être",
  "Services",
  "Artisanat",
  "Transport et livraison",
  "Technologie et informatique",
  "Autre",
];

const SUPPORTED_COUNTRIES = [
  { value: "Congo", label: "République du Congo" },
  { value: "Cameroun", label: "Cameroun" },
  { value: "Gabon", label: "Gabon" },
  { value: "RDC", label: "RDC (Kinshasa)" },
  { value: "Tchad", label: "Tchad" },
  { value: "Centrafrique", label: "Centrafrique" },
  { value: "Guinée Équatoriale", label: "Guinée Équatoriale" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isInitializing, setIsInitializing] = useState(true);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Simplified Form State (5 Core Fields)
  const [formData, setFormData] = useState({
    companyName: "",
    slug: "",
    sector: "Commerce et boutique",
    country: "Congo",
    city: "Brazzaville",
    supportWhatsApp: "",
  });

  const [nameAvailability, setNameAvailability] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
  }>({ checking: false });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nameCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load: Check Auth Session & Fetch Server Draft
  useEffect(() => {
    let isMounted = true;
    async function loadSessionAndDraft() {
      setIsInitializing(true);
      try {
        const meRes = await apiRequest<User>("/auth/me");
        if (!meRes.authenticated || !meRes.user) {
          if (typeof window !== "undefined") {
            window.location.replace("/login?redirect=" + encodeURIComponent("/app/onboarding"));
          }
          return;
        }

        const currentUser = meRes.user;
        if (isMounted) {
          setUser(currentUser);
        }

        // Fetch draft if previously saved
        const draft = await workspaceApi.getOnboardingDraft();
        if (isMounted && draft && draft.exists && draft.data) {
          setFormData((prev) => ({
            ...prev,
            companyName: draft.data.companyName || prev.companyName,
            slug: draft.data.slug || slugify(draft.data.companyName || ""),
            sector: draft.data.sector || draft.data.category || prev.sector,
            country: draft.data.country || prev.country,
            city: draft.data.city || prev.city,
            supportWhatsApp: draft.data.supportWhatsApp || prev.supportWhatsApp,
          }));
          setSaveStatus("saved");
        }
      } catch (err) {
        console.warn("Notice initialisation onboarding:", err);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }

    loadSessionAndDraft();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // 2. Debounced Auto-Save trigger
  const triggerAutoSave = useCallback(
    (dataToSave: typeof formData) => {
      if (isInitializing) return;

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      setSaveStatus("saving");

      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          await workspaceApi.saveOnboardingDraft(1, dataToSave);
          setSaveStatus("saved");
        } catch (err) {
          console.error("Auto-save draft failed:", err);
          setSaveStatus("error");
        }
      }, 750);
    },
    [isInitializing]
  );

  // 3. Keep slug in sync with companyName
  useEffect(() => {
    if (formData.companyName.trim()) {
      const generated = slugify(formData.companyName);
      setFormData((prev) => ({ ...prev, slug: generated }));
    }
  }, [formData.companyName]);

  // 4. Real-time Name Uniqueness Check
  useEffect(() => {
    const trimmed = formData.companyName.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameAvailability({ checking: false });
      return;
    }

    if (nameCheckTimerRef.current) {
      clearTimeout(nameCheckTimerRef.current);
    }

    setNameAvailability({ checking: true });

    nameCheckTimerRef.current = setTimeout(async () => {
      try {
        const res = await workspaceApi.checkCompanyName(trimmed, formData.country);
        if (res) {
          setNameAvailability({
            checking: false,
            available: res.available,
            reason: res.reason,
          });
        }
      } catch (err: any) {
        setNameAvailability({
          checking: false,
          available: false,
          reason: err.message || "Erreur de vérification du nom.",
        });
      }
    }, 600);

    return () => {
      if (nameCheckTimerRef.current) clearTimeout(nameCheckTimerRef.current);
    };
  }, [formData.companyName, formData.country]);

  // Generic Field Updater
  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      triggerAutoSave(updated);
      return updated;
    });
  };

  // 5. Submit & Create Workspace
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedName = formData.companyName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg("Veuillez renseigner le nom de votre activité (au moins 2 caractères).");
      return;
    }

    if (nameAvailability.available === false) {
      setErrorMsg(nameAvailability.reason || "Ce nom d'activité est déjà enregistré dans ce pays.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: trimmedName,
        category: formData.sector || "Commerce et boutique",
        country: formData.country || "Congo",
        city: formData.city.trim() || undefined,
        supportWhatsApp: formData.supportWhatsApp.trim() || undefined,
      };

      const created = await workspaceApi.createWorkspace(payload);

      if (typeof window !== "undefined" && (created?.id || created?.slug)) {
        localStorage.setItem("zadesk_active_workspace", created.id || created.slug);
      }

      router.push("/app");
    } catch (err: any) {
      console.error("Workspace creation failed:", err);
      setErrorMsg(
        err.message || "Impossible de créer votre espace. Veuillez vérifier les informations."
      );
      setIsSubmitting(false);
    }
  };

  const previewData: OnboardingPreviewData = {
    companyName: formData.companyName,
    slug: formData.slug || slugify(formData.companyName),
    sector: formData.sector,
    city: formData.city,
    country: formData.country,
    supportWhatsApp: formData.supportWhatsApp,
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Préparation de votre espace Zadesk...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F7F8FA] text-[#172033]">
      {/* 1. Header Institutionnel */}
      <OnboardingHeader
        saveStatus={saveStatus}
        onPause={() => router.push("/app")}
      />

      {/* 2. Main Stage */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Mobile preview toggle */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            Aperçu de votre page publique
          </span>
          <button
            type="button"
            onClick={() => setMobilePreviewOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{mobilePreviewOpen ? "Masquer l'aperçu" : "Voir l'aperçu"}</span>
          </button>
        </div>

        {mobilePreviewOpen && (
          <div className="lg:hidden mb-6 animate-fade-in">
            <OnboardingPreview data={previewData} />
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-start justify-center gap-8 xl:gap-12">
          {/* Left: Main Simple Form Card */}
          <div className="w-full lg:max-w-xl space-y-6">
            {/* Title & Subtitle */}
            <div className="space-y-1.5 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Prêt en 30 secondes</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0D1B3D] tracking-tight">
                Créons votre espace Zadesk
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Quelques informations sur votre activité et vous pourrez commencer.
              </p>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start justify-between gap-3 animate-fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="text-rose-500 hover:text-rose-800 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Form Box */}
            <form
              onSubmit={handleCreateWorkspace}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl shadow-slate-200/40 space-y-5"
            >
              {/* Champ 1 — Nom de votre activité (Obligatoire) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900">
                    Nom de votre activité <span className="text-rose-500">*</span>
                  </label>
                  {nameAvailability.checking && (
                    <span className="text-[10px] text-slate-400">Vérification...</span>
                  )}
                  {!nameAvailability.checking && nameAvailability.available === true && (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Disponible
                    </span>
                  )}
                  {!nameAvailability.checking && nameAvailability.available === false && (
                    <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-500" />
                      Déjà utilisé
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  placeholder="Ex : Chez Maman, Boutique Japhet, Restaurant Le Bon Goût..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                />
                {nameAvailability.reason && nameAvailability.available === false && (
                  <p className="text-[11px] text-rose-600 mt-1">{nameAvailability.reason}</p>
                )}
              </div>

              {/* Champ 2 — Domaine d'activité (Facultatif) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900">
                  Domaine d&apos;activité
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => updateField("sector", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white cursor-pointer"
                >
                  {ACTIVITY_DOMAINS.map((dom) => (
                    <option key={dom} value={dom}>
                      {dom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Champ 3 & 4 — Pays (Obligatoire) & Ville (Facultatif) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900">
                    Pays <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white cursor-pointer"
                  >
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Ex : Brazzaville, Pointe-Noire..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Champ 5 — WhatsApp de contact (Facultatif) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Votre numéro WhatsApp professionnel</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Facultatif</span>
                </div>
                <input
                  type="text"
                  value={formData.supportWhatsApp}
                  onChange={(e) => updateField("supportWhatsApp", e.target.value)}
                  placeholder="Ex : +242 06 600 00 00"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 font-mono placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Permettez à vos clients de vous contacter plus facilement via un bouton direct sur votre page.
                </p>
              </div>

              {/* Submit Action */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-2xl bg-[#0D1B3D] hover:bg-[#152C61] text-white font-bold text-sm transition-all shadow-md shadow-[#0D1B3D]/15 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Création de votre espace en cours...</span>
                    </>
                  ) : (
                    <>
                      <span>Créer mon espace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center pt-1">
                Vous pourrez ajouter des collaborateurs, vos horaires et personnaliser votre page à tout moment dans votre espace.
              </p>
            </form>
          </div>

          {/* Right: Companion Live Preview (Desktop) */}
          <div className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-24 space-y-3">
            <div className="px-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Aperçu en temps réel de votre page
              </p>
            </div>
            <OnboardingPreview data={previewData} />
          </div>
        </div>
      </main>
    </div>
  );
}
