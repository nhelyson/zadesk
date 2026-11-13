"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  OnboardingHeader,
  SaveStatus,
} from "@/components/onboarding/OnboardingHeader";
import {
  OnboardingSidebar,
  ONBOARDING_STEPS,
} from "@/components/onboarding/OnboardingSidebar";
import {
  OnboardingPreview,
  OnboardingPreviewData,
} from "@/components/onboarding/OnboardingPreview";
import { workspaceApi, apiRequest } from "@/lib/api";
import { User } from "@/types/workspace";
import { getContrastTextColor } from "@/lib/brandTheme";
import {
  Building2,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Phone,
  MessageSquare,
  Mail,
  Globe,
  MapPin,
  Clock,
  Plus,
  X,
  Palette,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Users,
  Tag,
  Briefcase,
  Layers,
  ChevronRight,
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

const SECTOR_SUGGESTIONS: Record<string, string[]> = {
  "Commerce & Distribution": [
    "Suivi de commande & expédition",
    "Retour, échange ou remboursement",
    "Disponibilité produit en stock",
    "Facturation & Paiement Mobile Money",
    "Réclamation article défectueux",
  ],
  "Télécommunications & FAI": [
    "Forfait Internet & Rechargement 4G",
    "Assistance Mobile Money / Retrait",
    "Panne réseau ou box Fibre",
    "Remplacement SIM & KYC",
    "Offre Pro & Facturation",
  ],
  "Banque & Microfinance": [
    "Relevé & Solde de compte",
    "Blocage carte ou compte",
    "Demande de prêt ou microcrédit",
    "Virement & Transfert d'argent",
    "Localisation d'agences & DAB",
  ],
  "Santé & Pharmacie": [
    "Disponibilité de médicaments",
    "Prise de rendez-vous consultation",
    "Service de garde & Urgences",
    "Prise en charge assurance",
    "Horaires d'ouverture & Accès",
  ],
  "Transport & Logistique": [
    "Suivi de colis / bordereau",
    "Tarifs & Devis de fret",
    "Retard ou anomalie de livraison",
    "Modification d'adresse de réception",
    "Perte ou colis endommagé",
  ],
  "Services & Technologies": [
    "Assistance technique & dépannage",
    "Configuration & Déploiement",
    "Demande de devis & Partenariat",
    "Facturation & Renouvellement",
    "Assistance aux utilisateurs",
  ],
  "Hôtellerie & Restauration": [
    "Réservation de chambre ou table",
    "Modification ou annulation",
    "Demande de devis événement / traiteur",
    "Réclamation service & facturation",
    "Renseignements sur les équipements",
  ],
  "Énergie & Eau": [
    "Signalement de coupure ou panne",
    "Recharge compteur prépayé",
    "Facturation & Paiement d'échéance",
    "Demande de raccordement",
    "Service d'astreinte & urgence",
  ],
  "Autre secteur": [
    "Assistance générale",
    "Suivi de dossier en cours",
    "Réclamation client",
    "Demande d'information",
  ],
};

const BRAND_PALETTES = [
  { name: "Navy Institutionnel", primary: "#0D1B3D" },
  { name: "Bleu Congo Telecom", primary: "#1D4ED8" },
  { name: "Rouge Énergie", primary: "#E11D48" },
  { name: "Ambre Chaleureux", primary: "#D97706" },
  { name: "Vert Banque", primary: "#047857" },
  { name: "Violet Moderne", primary: "#7C3AED" },
  { name: "Ardoise Foncée", primary: "#1E293B" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState(1);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isInitializing, setIsInitializing] = useState(true);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Entreprise & Situation SAV
    hasExistingSav: null as "yes" | "no" | null,
    companyName: "",
    slug: "",
    slugEdited: false,
    sector: "Commerce & Distribution",
    description: "",
    country: "Congo",
    city: "Brazzaville",
    address: "",

    // Step 2: Identité SAV
    supportName: "",
    supportMission: "",
    supportCategories: SECTOR_SUGGESTIONS["Commerce & Distribution"],
    responseSla: "Moins de 24h",

    // Step 3: Organisation du service
    supportLead: "",
    teamSize: "1",
    openingHours: "Lundi - Vendredi : 08h00 - 18h00 | Samedi : 09h00 - 13h00",

    // Step 4: Canaux de contact
    supportWhatsApp: "",
    supportPhone: "",
    supportEmail: "",
    website: "",

    // Step 5: Personnalisation
    brandPrimaryColor: "#0D1B3D",
  });

  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [nameAvailability, setNameAvailability] = useState<{
    checking: boolean;
    available?: boolean;
    reason?: string;
  }>({ checking: false });

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-Save Debounce Ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nameCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load: Check Auth Session & Fetch Server Draft
  useEffect(() => {
    let isMounted = true;
    async function loadSessionAndDraft() {
      setIsInitializing(true);
      try {
        // Direct session verification
        const meRes = await apiRequest<User>('/auth/me');
        if (!meRes.authenticated || !meRes.user) {
          if (typeof window !== 'undefined') {
            window.location.replace('/login?redirect=' + encodeURIComponent('/app/onboarding'));
          }
          return;
        }

        const currentUser = meRes.user;
        if (isMounted) {
          setUser(currentUser);
        }

        // Fetch user draft
        const draft = await workspaceApi.getOnboardingDraft();
        if (isMounted && draft && draft.exists && draft.data) {
          setFormData((prev) => ({
            ...prev,
            ...draft.data,
            supportEmail: draft.data.supportEmail || currentUser.email || prev.supportEmail,
            supportLead: draft.data.supportLead || `${currentUser.firstName} ${currentUser.lastName}`.trim() || prev.supportLead,
          }));
          const restoredStep = Math.min(Math.max(1, draft.step || 1), 6);
          setCurrentStep(restoredStep);
          setMaxAccessibleStep(Math.max(restoredStep, 1));
          setSaveStatus("saved");
        } else if (isMounted) {
          setFormData((prev) => ({
            ...prev,
            supportEmail: prev.supportEmail || currentUser.email,
            supportLead: prev.supportLead || `${currentUser.firstName} ${currentUser.lastName}`.trim(),
          }));
        }
      } catch (err) {
        console.warn("Notice: Impossible d'initialiser l'onboarding:", err);
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }

    loadSessionAndDraft();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // 2. Auto-Save trigger on form modification
  const triggerAutoSave = useCallback(
    (stepToSave: number, dataToSave: typeof formData) => {
      if (isInitializing) return;

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      setSaveStatus("saving");

      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          await workspaceApi.saveOnboardingDraft(stepToSave, dataToSave);
          setSaveStatus("saved");
        } catch (err) {
          console.error("Auto-save draft failed:", err);
          setSaveStatus("error");
        }
      }, 750);
    },
    [isInitializing]
  );

  // 3. Keep slug in sync with companyName unless manually customized
  useEffect(() => {
    if (!formData.slugEdited && formData.companyName.trim()) {
      const generated = slugify(formData.companyName);
      setFormData((prev) => ({ ...prev, slug: generated }));
    }
  }, [formData.companyName, formData.slugEdited]);

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
      triggerAutoSave(currentStep, updated);
      return updated;
    });
  };

  // Sector Change updates categories
  const handleSectorChange = (newSector: string) => {
    const defaultCats = SECTOR_SUGGESTIONS[newSector] || SECTOR_SUGGESTIONS["Autre secteur"];
    setFormData((prev) => {
      const updated = {
        ...prev,
        sector: newSector,
        supportCategories: defaultCats,
      };
      triggerAutoSave(currentStep, updated);
      return updated;
    });
  };

  // Categories management
  const handleToggleCategory = (cat: string) => {
    const exists = formData.supportCategories.includes(cat);
    const updatedCats = exists
      ? formData.supportCategories.filter((c) => c !== cat)
      : [...formData.supportCategories, cat];

    updateField("supportCategories", updatedCats);
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (!formData.supportCategories.includes(trimmed)) {
      updateField("supportCategories", [...formData.supportCategories, trimmed]);
    }
    setNewCategoryInput("");
  };

  const handleRemoveCategory = (cat: string) => {
    updateField(
      "supportCategories",
      formData.supportCategories.filter((c) => c !== cat)
    );
  };

  // Navigation handlers
  const handleNextStep = () => {
    setErrorMsg(null);

    // Step 1 Validation
    if (currentStep === 1) {
      if (!formData.hasExistingSav) {
        setErrorMsg("Veuillez indiquer si votre entreprise dispose déjà d'un service après-vente.");
        return;
      }
      if (!formData.companyName.trim()) {
        setErrorMsg("Le nom officiel de l'entreprise est obligatoire.");
        return;
      }
      if (nameAvailability.available === false) {
        setErrorMsg(nameAvailability.reason || "Ce nom d'entreprise est déjà enregistré.");
        return;
      }
    }

    const next = currentStep + 1;
    setCurrentStep(next);
    setMaxAccessibleStep((prev) => Math.max(prev, next));
    triggerAutoSave(next, formData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    const prev = Math.max(1, currentStep - 1);
    setCurrentStep(prev);
    triggerAutoSave(prev, formData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectStep = (stepId: number) => {
    if (stepId <= maxAccessibleStep) {
      setErrorMsg(null);
      setCurrentStep(stepId);
      triggerAutoSave(stepId, formData);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Final Action: Deploy Workspace
  const handleDeploySAV = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.companyName.trim(),
        slug: formData.slug.trim() || slugify(formData.companyName),
        hasExistingSav: formData.hasExistingSav === "yes",
        category: formData.sector,
        description: formData.description.trim() || undefined,
        city: formData.city.trim() || "Brazzaville",
        country: formData.country.trim() || "Congo",
        address: formData.address.trim() || undefined,
        supportWhatsApp: formData.supportWhatsApp.trim() || undefined,
        supportPhone: formData.supportPhone.trim() || undefined,
        supportEmail: formData.supportEmail.trim() || undefined,
        website: formData.website.trim() || undefined,
        openingHours: formData.openingHours.trim() || undefined,
        supportCategories: formData.supportCategories,
      };

      const created = await workspaceApi.createWorkspace(payload);

      // Save newly created workspace slug/id as active
      if (typeof window !== "undefined" && (created?.id || created?.slug)) {
        localStorage.setItem("zadesk_active_workspace", created.id || created.slug);
      }

      // Redirect directly to the initialized workspace
      router.push("/app");
    } catch (err: any) {
      console.error("Workspace deployment error:", err);
      setErrorMsg(err.message || "Impossible de déployer votre espace SAV. Veuillez vérifier les informations et réessayer.");
      setIsSubmitting(false);
    }
  };

  const previewData: OnboardingPreviewData = {
    companyName: formData.companyName,
    slug: formData.slug || slugify(formData.companyName),
    sector: formData.sector,
    description: formData.description,
    city: formData.city,
    country: formData.country,
    supportWhatsApp: formData.supportWhatsApp,
    supportPhone: formData.supportPhone,
    supportEmail: formData.supportEmail,
    website: formData.website,
    openingHours: formData.openingHours,
    supportCategories: formData.supportCategories,
    brandPrimaryColor: formData.brandPrimaryColor,
    hasExistingSav: formData.hasExistingSav,
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-500 animate-pulse">
            Vérification de votre session Zadesk...
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
        currentStep={currentStep}
        totalSteps={6}
        onPause={() => router.push("/app")}
      />

      {/* 2. Main Stage (Sidebar + Form + Preview) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile floating button to toggle preview */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">
            Étape {currentStep} : {ONBOARDING_STEPS[currentStep - 1]?.title}
          </span>
          <button
            type="button"
            onClick={() => setMobilePreviewOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{mobilePreviewOpen ? "Masquer l'aperçu" : "Aperçu du SAV"}</span>
          </button>
        </div>

        {/* Mobile preview slide */}
        {mobilePreviewOpen && (
          <div className="lg:hidden mb-6 animate-fade-in">
            <OnboardingPreview data={previewData} />
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-start gap-6 xl:gap-8">
          {/* Left: Step Stepper Navigation */}
          <OnboardingSidebar
            currentStep={currentStep}
            onSelectStep={handleSelectStep}
            maxAccessibleStep={maxAccessibleStep}
          />

          {/* Center: Main Form Card */}
          <div className="flex-1 w-full min-w-0 space-y-6">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start justify-between gap-3 animate-fade-in">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  onClick={() => setErrorMsg(null)}
                  className="text-rose-500 hover:text-rose-800 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-7">
              {/* ÉTAPE 1 : ENTREPRISE & MATURITÉ SAV */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Étape 1 sur 6
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
                      Informations Générales & Situation SAV
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Identifiez votre organisation et précisez la situation actuelle de votre service après-vente.
                    </p>
                  </div>

                  {/* Question fondamentale de maturité SAV */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-slate-700 shrink-0" />
                      <h3 className="text-xs font-bold text-navy-900">
                        Votre entreprise dispose-t-elle déjà d&apos;un service après-vente ?
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Option A: Oui */}
                      <button
                        type="button"
                        onClick={() => updateField("hasExistingSav", "yes")}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          formData.hasExistingSav === "yes"
                            ? "bg-white border-emerald-500 shadow-xs ring-2 ring-emerald-500/20"
                            : "bg-white hover:bg-slate-100/70 border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900">
                            Oui, nous avons déjà un SAV
                          </p>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              formData.hasExistingSav === "yes"
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {formData.hasExistingSav === "yes" && (
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Nous souhaitons centraliser, moderniser et automatiser nos échanges clients avec Zadesk.
                        </p>
                      </button>

                      {/* Option B: Non */}
                      <button
                        type="button"
                        onClick={() => updateField("hasExistingSav", "no")}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          formData.hasExistingSav === "no"
                            ? "bg-white border-emerald-500 shadow-xs ring-2 ring-emerald-500/20"
                            : "bg-white hover:bg-slate-100/70 border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900">
                            Non, nous souhaitons en créer un
                          </p>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              formData.hasExistingSav === "no"
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {formData.hasExistingSav === "no" && (
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          Nous voulons structurer et déployer notre premier guichet officiel d&apos;assistance client.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-4">
                    {/* Nom officiel */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-900">
                          Nom officiel de l&apos;entreprise <span className="text-rose-500">*</span>
                        </label>
                        {nameAvailability.checking && (
                          <span className="text-[10px] text-slate-400">Vérification de disponibilité...</span>
                        )}
                        {!nameAvailability.checking && nameAvailability.available === true && (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Nom disponible
                          </span>
                        )}
                        {!nameAvailability.checking && nameAvailability.available === false && (
                          <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-rose-500" />
                            Nom déjà utilisé
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => updateField("companyName", e.target.value)}
                        placeholder="Ex: TotalEnergies Congo, Pharmacie du Fleuve..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                      />
                      {nameAvailability.reason && nameAvailability.available === false && (
                        <p className="text-[11px] text-rose-600 mt-1">{nameAvailability.reason}</p>
                      )}
                    </div>

                    {/* Secteur d'activité */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900">
                        Secteur d&apos;activité
                      </label>
                      <select
                        value={formData.sector}
                        onChange={(e) => handleSectorChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all bg-white"
                      >
                        {Object.keys(SECTOR_SUGGESTIONS).map((sec) => (
                          <option key={sec} value={sec}>
                            {sec}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900">
                        Description de l&apos;activité (facultatif)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        placeholder="Courte présentation de vos services et activités..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400 resize-none"
                      />
                    </div>

                    {/* Implantation géographique */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-900">Pays</label>
                        <select
                          value={formData.country}
                          onChange={(e) => updateField("country", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all bg-white"
                        >
                          <option value="Congo">République du Congo</option>
                          <option value="Cameroun">Cameroun</option>
                          <option value="Gabon">Gabon</option>
                          <option value="RDC">RDC (Kinshasa)</option>
                          <option value="Tchad">Tchad</option>
                          <option value="Centrafrique">Centrafrique</option>
                          <option value="Guinée Équatoriale">Guinée Équatoriale</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-900">Ville principale</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          placeholder="Ex: Brazzaville, Pointe-Noire..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900">
                        Adresse professionnelle ou quartier (facultatif)
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        placeholder="Ex: Avenue Amilcar Cabral, Centre-Ville..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 : IDENTITÉ DU SERVICE APRÈS-VENTE */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Étape 2 sur 6
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
                      Identité & Mission du Service Client
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Définissez l&apos;intitulé de votre guichet et les motifs de demandes fréquentes pris en charge.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900">
                        Appellation officielle du service
                      </label>
                      <input
                        type="text"
                        value={formData.supportName}
                        onChange={(e) => updateField("supportName", e.target.value)}
                        placeholder={`Service Client & SAV — ${formData.companyName || "Entreprise"}`}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all"
                      />
                      <p className="text-[11px] text-slate-400">
                        Ce titre apparaîtra en en-tête des échanges avec vos clients.
                      </p>
                    </div>

                    {/* Motifs / Catégories de réclamations */}
                    <div className="space-y-2.5 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-900">
                          Motifs d&apos;assistance & réclamations supportés ({formData.supportCategories.length})
                        </label>
                        <span className="text-[10px] text-slate-400">Cliquer pour activer/désactiver</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {formData.supportCategories.map((cat, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 shadow-2xs group"
                          >
                            <span>{cat}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCategory(cat)}
                              className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                              title="Retirer cette catégorie"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Add Category Form */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddCategory();
                            }
                          }}
                          placeholder="Ajouter un motif personnalisé..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                        />
                        <button
                          type="button"
                          onClick={handleAddCategory}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Ajouter</span>
                        </button>
                      </div>
                    </div>

                    {/* Engagement de délai */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-bold text-slate-900">
                        Engagement indicatif de délai de prise en charge
                      </label>
                      <select
                        value={formData.responseSla}
                        onChange={(e) => updateField("responseSla", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 bg-white"
                      >
                        <option value="Immédiat pendant les heures ouvrées">Immédiat pendant les heures ouvrées</option>
                        <option value="Moins de 2h">Moins de 2 heures</option>
                        <option value="Moins de 24h">Moins de 24 heures (Recommandé)</option>
                        <option value="Sous 48h ouvrées">Sous 48 heures ouvrées</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 : ORGANISATION DU SAV */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Étape 3 sur 6
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
                      Organisation du Service & Horaires
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Structurez l&apos;organisation opérationnelle de votre équipe et les plages de disponibilité humaine.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Responsable SAV */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900">
                        Responsable du service client
                      </label>
                      <input
                        type="text"
                        value={formData.supportLead}
                        onChange={(e) => updateField("supportLead", e.target.value)}
                        placeholder="Ex: Japhet Ikoume"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />
                    </div>

                    {/* Équipe envisagée */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900">
                        Nombre de conseillers envisagé au lancement
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {[
                          { id: "1", label: "1 conseiller", desc: "Démarrer seul" },
                          { id: "2-5", label: "2 à 5", desc: "Petite équipe" },
                          { id: "6-15", label: "6 à 15", desc: "Équipe SAV" },
                          { id: "15+", label: "Plus de 15", desc: "Centre d'appels" },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => updateField("teamSize", opt.id)}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              formData.teamSize === opt.id
                                ? "bg-white border-emerald-500 shadow-xs ring-2 ring-emerald-500/20"
                                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                            }`}
                          >
                            <p className="font-bold text-slate-900">{opt.label}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Horaires d'ouverture */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-bold text-slate-900">
                        Horaires d&apos;ouverture des conseillers
                      </label>
                      <input
                        type="text"
                        value={formData.openingHours}
                        onChange={(e) => updateField("openingHours", e.target.value)}
                        placeholder="Lundi - Vendredi : 08h00 - 18h00 | Samedi : 09h00 - 13h00"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 font-mono"
                      />
                      <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                        <span className="text-slate-400">Modèles rapides :</span>
                        <button
                          type="button"
                          onClick={() => updateField("openingHours", "Lundi - Vendredi : 08h00 - 18h00")}
                          className="text-emerald-700 hover:underline cursor-pointer"
                        >
                          Lun - Ven (8h-18h)
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => updateField("openingHours", "Lundi - Samedi : 07h30 - 19h00")}
                          className="text-emerald-700 hover:underline cursor-pointer"
                        >
                          Lun - Sam (7h30-19h)
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => updateField("openingHours", "7j/7 : 08h00 - 20h00")}
                          className="text-emerald-700 hover:underline cursor-pointer"
                        >
                          7j/7 Continu
                        </button>
                      </div>
                    </div>

                    {/* Explication transparence */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-slate-600 text-xs leading-relaxed">
                      <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">Accueil 24/7 & Traitement humain</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Les clients peuvent déposer leurs messages 24h/24. Vos conseillers prendront le relais pendant vos plages d&apos;ouverture indiquées.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 4 : CANAUX DE CONTACT */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Étape 4 sur 6
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
                      Canaux de Contact Officiels
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Renseignez les coordonnées vérifiées mises à disposition de vos clients pour vous joindre.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* WhatsApp */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Numéro WhatsApp SAV officiel</span>
                        </label>
                        <span className="text-[10px] text-slate-400">Recommandé en zone CEMAC</span>
                      </div>
                      <input
                        type="text"
                        value={formData.supportWhatsApp}
                        onChange={(e) => updateField("supportWhatsApp", e.target.value)}
                        placeholder="Ex: +242 06 600 00 00"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 font-mono"
                      />
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Ce numéro sera affiché avec un lien direct WhatsApp pour vos clients. L&apos;API Cloud WhatsApp Business pourra être connectée plus tard dans vos paramètres.
                      </p>
                    </div>

                    {/* Téléphone */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>Téléphone d&apos;assistance directe</span>
                      </label>
                      <input
                        type="text"
                        value={formData.supportPhone}
                        onChange={(e) => updateField("supportPhone", e.target.value)}
                        placeholder="Ex: +242 05 500 00 00"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 font-mono"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>Adresse email officielle d&apos;assistance</span>
                      </label>
                      <input
                        type="email"
                        value={formData.supportEmail}
                        onChange={(e) => updateField("supportEmail", e.target.value)}
                        placeholder="serviceclient@votre-entreprise.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />
                    </div>

                    {/* Site Web */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        <span>Site internet officiel (facultatif)</span>
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => updateField("website", e.target.value)}
                        placeholder="https://www.votre-entreprise.cg"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 5 : PERSONNALISATION & IMAGE */}
              {currentStep === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Étape 5 sur 6
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
                      Personnalisation Visuelle & URL SAV
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Définissez l&apos;identité visuelle de votre guichet et son adresse web publique.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Palette de marque */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-900">
                        Couleur principale de votre marque
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Cette couleur habillera l&apos;en-tête de votre guichet et vos boutons clients avec un contraste WCAG AA automatique.
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {BRAND_PALETTES.map((p) => {
                          const isSelected = formData.brandPrimaryColor.toLowerCase() === p.primary.toLowerCase();
                          return (
                            <button
                              key={p.primary}
                              type="button"
                              onClick={() => updateField("brandPrimaryColor", p.primary)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-white border-slate-900 shadow-xs ring-2 ring-slate-900/10 text-slate-900"
                                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                              }`}
                            >
                              <span
                                className="w-4 h-4 rounded-full shrink-0 shadow-2xs"
                                style={{ backgroundColor: p.primary }}
                              />
                              <span>{p.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom color input */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="color"
                          value={formData.brandPrimaryColor}
                          onChange={(e) => updateField("brandPrimaryColor", e.target.value)}
                          className="w-9 h-9 rounded-xl border border-slate-200 p-0.5 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.brandPrimaryColor}
                          onChange={(e) => updateField("brandPrimaryColor", e.target.value)}
                          placeholder="#0D1B3D"
                          className="w-32 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase text-slate-900"
                        />
                        <span className="text-[11px] text-slate-400">Code HEX personnalisé</span>
                      </div>
                    </div>

                    {/* URL publique / Slug */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-bold text-slate-900">
                        Identifiant d&apos;adresse web (URL Zadesk)
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-500 font-mono shrink-0">
                          zadesk.com/entreprises/
                        </span>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              slug: slugify(e.target.value),
                              slugEdited: true,
                            }));
                            triggerAutoSave(currentStep, {
                              ...formData,
                              slug: slugify(e.target.value),
                              slugEdited: true,
                            });
                          }}
                          placeholder="votre-entreprise"
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:border-slate-400"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Vos clients pourront directement accéder à votre SAV via ce lien sécurisé sans mot de passe.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 6 : RÉCAPITULATIF & VALIDATION */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                      Étape 6 sur 6
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
                      Récapitulatif & Déploiement du SAV
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Vérifiez les paramètres de votre service client avant de procéder à l&apos;activation définitive.
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-xs space-y-3.5">
                    {/* Section 1 */}
                    <div className="pt-0 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Organisation</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{formData.companyName || "Non défini"}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {formData.sector} • {formData.city}, {formData.country}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">
                          Situation SAV : {formData.hasExistingSav === "yes" ? "Service client préexistant à moderniser" : "Nouveau service client créé"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectStep(1)}
                        className="text-xs font-semibold text-emerald-700 hover:underline shrink-0"
                      >
                        Modifier
                      </button>
                    </div>

                    {/* Section 2 */}
                    <div className="pt-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Identité & Mission</p>
                        <p className="font-bold text-slate-800 mt-0.5">
                          {formData.supportName || `SAV ${formData.companyName}`}
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {formData.supportCategories.length} motif(s) d&apos;assistance configuré(s) • Délai : {formData.responseSla}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectStep(2)}
                        className="text-xs font-semibold text-emerald-700 hover:underline shrink-0"
                      >
                        Modifier
                      </button>
                    </div>

                    {/* Section 3 */}
                    <div className="pt-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Organisation & Horaires</p>
                        <p className="font-bold text-slate-800 mt-0.5">
                          Responsable : {formData.supportLead || "Admin"} ({formData.teamSize} conseiller(s))
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5 font-mono">
                          {formData.openingHours}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectStep(3)}
                        className="text-xs font-semibold text-emerald-700 hover:underline shrink-0"
                      >
                        Modifier
                      </button>
                    </div>

                    {/* Section 4 */}
                    <div className="pt-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Canaux de contact</p>
                        <p className="font-bold text-slate-800 mt-0.5">
                          WhatsApp : {formData.supportWhatsApp || "Non renseigné"}
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Tél : {formData.supportPhone || "Non renseigné"} • Email : {formData.supportEmail}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectStep(4)}
                        className="text-xs font-semibold text-emerald-700 hover:underline shrink-0"
                      >
                        Modifier
                      </button>
                    </div>

                    {/* Section 5 */}
                    <div className="pt-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Adresse Publique & Marque</p>
                        <p className="font-mono text-emerald-800 font-bold mt-0.5">
                          /entreprises/{formData.slug || slugify(formData.companyName)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="w-3 h-3 rounded-full shadow-2xs"
                            style={{ backgroundColor: formData.brandPrimaryColor }}
                          />
                          <span className="text-[11px] text-slate-600 font-mono">
                            {formData.brandPrimaryColor}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectStep(5)}
                        className="text-xs font-semibold text-emerald-700 hover:underline shrink-0"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>

                  {/* Reassurance */}
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-950 leading-relaxed">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Création officielle et immédiate</p>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        En confirmant, votre entreprise sera définitivement initialisée. Vous serez configuré comme Propriétaire (OWNER) et redirigé vers votre espace de pilotage.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Précédent</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <span>Continuer</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDeploySAV}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Déploiement en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Créer et déployer mon espace SAV</span>
                        <Zap className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Desktop Live Contextual Preview */}
          <div className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-24 space-y-3">
            <div className="px-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Guichet SAV en temps réel
              </p>
            </div>
            <OnboardingPreview data={previewData} />
          </div>
        </div>
      </main>
    </div>
  );
}
