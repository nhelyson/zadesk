"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { OnboardingHeader, SaveStatus } from "@/components/onboarding/OnboardingHeader";
import { OnboardingPreview, OnboardingPreviewData } from "@/components/onboarding/OnboardingPreview";
import { OnboardingStepIndicator } from "@/components/onboarding/OnboardingStepIndicator";
import { Step1Company } from "@/components/onboarding/Step1Company";
import { Step2LocationContact } from "@/components/onboarding/Step2LocationContact";
import { Step3Review } from "@/components/onboarding/Step3Review";
import { Step4CommercialRecap } from "@/components/onboarding/Step4CommercialRecap";
import { OnboardingMobileNav } from "@/components/onboarding/OnboardingMobileNav";
import { workspaceApi, apiRequest } from "@/lib/api";
import { User } from "@/types/workspace";
import { Loader2 } from "lucide-react";

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

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hasWorkspace, setHasWorkspace] = useState(false);

  // 3 Progressive Steps (1: Entreprise, 2: Localisation & Contact, 3: Aperçu & Validation) + Step 4: Récapitulatif Commercial
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxAccessibleStep, setMaxAccessibleStep] = useState<number>(1);
  const [selectedPlan, setSelectedPlan] = useState<string>("decouverte");
  const [createdWorkspace, setCreatedWorkspace] = useState<{ id: string; name: string; slug: string } | null>(null);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isInitializing, setIsInitializing] = useState(true);

  // Form State (5 Core Fields + Slug)
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

  // Animation DOM references
  const step1And2ContainerRef = useRef<HTMLDivElement>(null);
  const step3StageRef = useRef<HTMLDivElement>(null);
  const step3HeaderRef = useRef<HTMLDivElement>(null);
  const step3PhoneRef = useRef<HTMLDivElement>(null);
  const step3RecapRef = useRef<HTMLDivElement>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nameCheckTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load: Check Auth Session & Fetch Server Draft
  useEffect(() => {
    let isMounted = true;
    async function loadSessionAndDraft() {
      setIsInitializing(true);
      try {
        const meRes = await apiRequest<any>("/auth/me");
        const currentUser = (meRes?.user || meRes?.data?.user || meRes?.data) as User | undefined;

        if (!currentUser) {
          if (typeof window !== "undefined") {
            window.location.replace("/login?redirect=" + encodeURIComponent("/app"));
          }
          return;
        }

        // GUARD: If user already possesses an active workspace, redirect immediately
        const memberships = (currentUser as any)?.memberships || [];
        const hasExistingWorkspace = Boolean(
          meRes?.hasWorkspace || memberships.length > 0
        );

        if (hasExistingWorkspace) {
          if (typeof window !== "undefined") {
            router.replace("/app");
            return;
          }
        }

        if (isMounted) {
          setUser(currentUser);
          setHasWorkspace(hasExistingWorkspace);
        }

        // Resolve selected commercial plan from URL param, storage or server draft
        let resolvedPlan = "decouverte";
        if (typeof window !== "undefined") {
          const p = new URLSearchParams(window.location.search);
          const planQuery = p.get("plan") || sessionStorage.getItem("zadesk_selected_plan");
          if (planQuery && ["decouverte", "starter", "pro", "entreprise"].includes(planQuery.toLowerCase().trim())) {
            resolvedPlan = planQuery.toLowerCase().trim();
          }
        }

        // Fetch draft if previously saved
        try {
          const draftRes = await apiRequest<any>("/workspaces/onboarding/draft");
          const draftData = draftRes?.data?.draft || draftRes?.draft || draftRes?.data;
          const savedStep = draftRes?.data?.step || draftRes?.step || draftData?.step;

          if (isMounted && draftData) {
            if (draftData.selectedPlan && ["decouverte", "starter", "pro", "entreprise"].includes(draftData.selectedPlan.toLowerCase().trim())) {
              resolvedPlan = draftData.selectedPlan.toLowerCase().trim();
            }

            const restoredName = draftData.companyName || draftData.name || "";
            const restoredData = {
              companyName: restoredName,
              slug: draftData.slug || (restoredName ? slugify(restoredName) : ""),
              sector: draftData.sector || draftData.category || "Commerce et boutique",
              country: draftData.country || "Congo",
              city: draftData.city || "Brazzaville",
              supportWhatsApp: draftData.supportWhatsApp || "",
            };

            setFormData((prev) => ({
              ...prev,
              ...restoredData,
            }));

            // Restore step if valid
            if (typeof savedStep === "number" && savedStep >= 1 && savedStep <= 3) {
              const clamped = Math.min(savedStep, 3);
              setCurrentStep(clamped);
              setMaxAccessibleStep(clamped);
            } else if (restoredName.trim().length >= 2) {
              setMaxAccessibleStep(2);
            }

            setSaveStatus("saved");
          }
        } catch {
          // If draft endpoint fails, continue gracefully with defaults
        }

        if (isMounted) {
          setSelectedPlan(resolvedPlan);
          sessionStorage.setItem("zadesk_selected_plan", resolvedPlan);
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

  // 2. Debounced Auto-Save
  const triggerAutoSave = useCallback(
    (step: number, dataToSave: typeof formData) => {
      if (isInitializing) return;

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      setSaveStatus("saving");

      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          await workspaceApi.saveOnboardingDraft(step, { ...dataToSave, selectedPlan });
          setSaveStatus("saved");
        } catch (err) {
          console.error("Auto-save draft failed:", err);
          setSaveStatus("error");
        }
      }, 750);
    },
    [isInitializing, selectedPlan]
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

  // Update Field helper
  const updateField = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      triggerAutoSave(currentStep, updated);
      return updated;
    });
  };

  // GSAP Animations (Step transitions & Step 3 Discovery Sequence)
  useEffect(() => {
    if (isInitializing) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (currentStep === 1 || currentStep === 2) {
        if (step1And2ContainerRef.current) {
          gsap.fromTo(
            step1And2ContainerRef.current,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out", clearProps: "all" }
          );
        }
      } else if (currentStep === 3) {
        // Orchestrated discovery sequence for Step 3
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        if (step3HeaderRef.current) {
          tl.fromTo(
            step3HeaderRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.4 }
          );
        }

        if (step3PhoneRef.current) {
          tl.fromTo(
            step3PhoneRef.current,
            { opacity: 0, y: 24, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.55 },
            "-=0.2"
          );
        }

        if (step3RecapRef.current) {
          tl.fromTo(
            step3RecapRef.current,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.45 },
            "-=0.3"
          );
        }
      }
    });

    return () => ctx.revert();
  }, [currentStep, isInitializing]);

  // Step Navigation Handlers
  const handleNextFromStep1 = () => {
    const trimmedName = formData.companyName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg("Veuillez renseigner le nom de votre entreprise (au moins 2 caractères).");
      return;
    }
    if (nameAvailability.available === false) {
      setErrorMsg(nameAvailability.reason || "Ce nom d'entreprise est déjà enregistré dans ce pays.");
      return;
    }

    setErrorMsg(null);
    const nextStep = 2;
    setCurrentStep(nextStep);
    setMaxAccessibleStep((prev) => Math.max(prev, nextStep));
    triggerAutoSave(nextStep, formData);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextFromStep2 = () => {
    if (!formData.city.trim() || formData.city.trim().length < 2) {
      setErrorMsg("Veuillez indiquer la ville de votre activité.");
      return;
    }

    setErrorMsg(null);
    const nextStep = 3;
    setCurrentStep(nextStep);
    setMaxAccessibleStep((prev) => Math.max(prev, nextStep));
    triggerAutoSave(nextStep, formData);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setErrorMsg(null);
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      triggerAutoSave(prevStep, formData);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleGoToStep = (targetStep: number) => {
    if (targetStep <= maxAccessibleStep && targetStep !== currentStep) {
      setErrorMsg(null);
      setCurrentStep(targetStep);
      triggerAutoSave(targetStep, formData);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  // Final Submit & Create Workspace
  const handleFinalSubmit = async () => {
    setErrorMsg(null);

    const trimmedName = formData.companyName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg("Veuillez renseigner le nom de votre entreprise (au moins 2 caractères).");
      setCurrentStep(1);
      return;
    }

    if (nameAvailability.available === false) {
      setErrorMsg(nameAvailability.reason || "Ce nom d'entreprise est déjà utilisé dans ce pays.");
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      const normPlan = (selectedPlan || "decouverte").toUpperCase();
      const payload = {
        name: trimmedName,
        category: formData.sector || "Commerce et boutique",
        country: formData.country || "Congo",
        city: formData.city.trim() || undefined,
        supportWhatsApp: formData.supportWhatsApp.trim() || undefined,
        selectedPlan: normPlan,
      };

      const created = await workspaceApi.createWorkspace(payload);
      const wsData = created?.workspace || created?.data?.workspace || created;

      if (typeof window !== "undefined" && (wsData?.id || wsData?.slug)) {
        localStorage.setItem("zadesk_active_workspace", wsData.id || wsData.slug);
      }

      // Parcours A : Si offre Découverte, redirection directe sans paiement vers /app
      if (normPlan === "DECOUVERTE") {
        router.push("/app");
        return;
      }

      // Parcours B : Pour toute formule payante (Starter, Pro, Entreprise)
      // Enregistrement de l'intention commerciale et transition vers l'Étape 4 (Récapitulatif)
      try {
        await apiRequest("/commercial/intent", {
          method: "POST",
          body: JSON.stringify({
            planId: normPlan,
            workspaceId: wsData?.id,
          }),
        });
      } catch (intentErr) {
        console.warn("Notice enregistrement intention commerciale:", intentErr);
      }

      setCreatedWorkspace({
        id: wsData?.id || "",
        name: wsData?.name || trimmedName,
        slug: wsData?.slug || formData.slug,
      });

      setCurrentStep(4);
      setMaxAccessibleStep(4);
      setIsSubmitting(false);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      console.error("Workspace creation failed:", err);
      setErrorMsg(
        err.message || "Impossible de créer votre espace. Veuillez vérifier les informations."
      );
      setIsSubmitting(false);
    }
  };

  // Pause Onboarding ("Reprendre plus tard")
  const handlePauseOnboarding = async () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    setSaveStatus("saving");
    try {
      await workspaceApi.saveOnboardingDraft(currentStep, formData);
      setSaveStatus("saved");
    } catch (e) {
      console.warn("Could not save draft before leaving:", e);
    }

    if (hasWorkspace) {
      router.push("/app");
    } else {
      router.push("/");
    }
  };

  const previewData: OnboardingPreviewData = {
    companyName: formData.companyName,
    slug: formData.slug || slugify(formData.companyName),
    sector: formData.sector,
    city: formData.city,
    country: formData.country,
    supportWhatsApp: formData.supportWhatsApp,
    supportCategories: ["Information", "Commande", "Tarifs & Devis", "Autre demande"],
  };

  // Condition for Mobile Next button
  const canProceedMobile =
    currentStep === 1
      ? formData.companyName.trim().length >= 2 && nameAvailability.available !== false
      : currentStep === 2
      ? formData.city.trim().length >= 2
      : true;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0D1B3D] animate-spin" />
          <p className="text-xs font-semibold text-slate-600">
            Chargement de votre espace...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative flex-1 flex flex-col min-h-screen bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(13,27,61,0.04),rgba(248,250,252,0.95)_70%)] bg-[#F8FAFC] text-[#0D1B3D]">
      {/* 1. Header Institutionnel Sobre */}
      <OnboardingHeader
        saveStatus={saveStatus}
        currentStep={currentStep}
        totalSteps={3}
        hasWorkspace={hasWorkspace}
        onPause={handlePauseOnboarding}
      />

      {/* 2. Main Stage */}
      <main className="relative z-10 flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 sm:pb-12">
        {/* ============================================================ */}
        {/* ÉTAPES 1 & 2 : FORMULAIRE PLEIN CENTRE (ZÉRO VISUALISEUR)      */}
        {/* ============================================================ */}
        {(currentStep === 1 || currentStep === 2) && (
          <div className="w-full max-w-2xl lg:max-w-3xl mx-auto space-y-6">
            {/* Indicateur de Progression Discret */}
            <div className="flex justify-center sm:justify-start">
              <OnboardingStepIndicator
                currentStep={currentStep}
                maxAccessibleStep={maxAccessibleStep}
                onStepClick={handleGoToStep}
              />
            </div>

            {/* Carte de Formulaire Éditoriale Généreuse */}
            <div
              ref={step1And2ContainerRef}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-[0_20px_50px_rgba(13,27,61,0.05),0_1px_3px_rgba(0,0,0,0.02)] transition-all"
            >
              {currentStep === 1 && (
                <Step1Company
                  companyName={formData.companyName}
                  sector={formData.sector}
                  nameAvailability={nameAvailability}
                  onUpdateField={updateField}
                  onNext={handleNextFromStep1}
                />
              )}

              {currentStep === 2 && (
                <Step2LocationContact
                  country={formData.country}
                  city={formData.city}
                  supportWhatsApp={formData.supportWhatsApp}
                  onUpdateField={updateField}
                  onNext={handleNextFromStep2}
                  onBack={handleBack}
                />
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ÉTAPE 3 : SCÈNE ÉDITORIALE AVEC SMARTPHONE GÉNÉRIQUE EN VEDETTE */}
        {/* ============================================================ */}
        {currentStep === 3 && (
          <div ref={step3StageRef} className="w-full max-w-[1240px] mx-auto space-y-8">
            {/* En-tête & Progression de la Scène */}
            <div ref={step3HeaderRef} className="space-y-4">
              <div className="flex justify-center sm:justify-start">
                <OnboardingStepIndicator
                  currentStep={currentStep}
                  maxAccessibleStep={maxAccessibleStep}
                  onStepClick={handleGoToStep}
                  hasCommercialRecap={selectedPlan !== "decouverte"}
                />
              </div>

              <div className="text-left space-y-1.5 max-w-2xl">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0D1B3D] tracking-tight">
                  Découvrez votre guichet public officiel
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Voici le rendu exact de la page d&apos;accueil que vos clients et partenaires consulteront pour échanger avec votre équipe, déposer des réclamations ou obtenir une assistance.
                </p>
              </div>
            </div>

            {/* Scène Asymétrique Desktop / Séquentielle Mobile */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10 xl:gap-14">
              {/* 
                SMARTPHONE GÉNÉRIQUE HAUTE FINITION (Au premier plan)
                Défilement vertical indépendant à l'intérieur
              */}
              <div
                ref={step3PhoneRef}
                className="w-full max-w-[360px] sm:max-w-[380px] shrink-0 flex flex-col items-center"
              >
                <div className="w-full flex items-center justify-between px-2 mb-2 text-[11px] font-semibold text-slate-400">
                  <span>Aperçu interactif</span>
                  <span className="font-mono text-slate-500">
                    zadesk.com/entreprises/{previewData.slug}
                  </span>
                </div>

                <OnboardingPreview data={previewData} />
              </div>

              {/* RÉCAPITULATIF ÉDITORIAL & VALIDATION */}
              <div
                ref={step3RecapRef}
                className="w-full max-w-xl lg:max-w-lg xl:max-w-xl space-y-6"
              >
                <Step3Review
                  companyName={formData.companyName}
                  sector={formData.sector}
                  country={formData.country}
                  city={formData.city}
                  supportWhatsApp={formData.supportWhatsApp}
                  generatedSlug={formData.slug}
                  selectedPlan={selectedPlan}
                  isSubmitting={isSubmitting}
                  submitError={errorMsg}
                  onGoToStep={handleGoToStep}
                  onSubmit={handleFinalSubmit}
                  onBack={handleBack}
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* ÉTAPE 4 : RÉCAPITULATIF COMMERCIAL & VALIDATION TARIFAIRE   */}
        {/* ============================================================ */}
        {currentStep === 4 && (
          <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="space-y-4">
              <div className="flex justify-center sm:justify-start">
                <OnboardingStepIndicator
                  currentStep={4}
                  maxAccessibleStep={4}
                  hasCommercialRecap={true}
                />
              </div>

              <div className="text-left space-y-1.5">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0D1B3D] tracking-tight uppercase">
                  Récapitulatif de votre formule
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Votre espace a été créé avec succès avec l&apos;accès Découverte actif. Vérifiez le détail de votre abonnement avant le passage au règlement.
                </p>
              </div>
            </div>

            <Step4CommercialRecap
              companyName={createdWorkspace?.name || formData.companyName}
              planId={selectedPlan}
              planName={
                selectedPlan === "starter"
                  ? "Starter"
                  : selectedPlan === "pro"
                  ? "Pro"
                  : selectedPlan === "entreprise"
                  ? "Entreprise"
                  : "Découverte"
              }
              priceXaf={
                selectedPlan === "starter"
                  ? 10000
                  : selectedPlan === "pro"
                  ? 45000
                  : selectedPlan === "entreprise"
                  ? 150000
                  : 0
              }
              workspaceSlug={createdWorkspace?.slug || formData.slug}
              onContinueToWorkspace={() => router.push("/app")}
            />
          </div>
        )}
      </main>

      {/* Barre d'Action Flottante Mobile (active uniquement lors des étapes 1 à 3) */}
      {currentStep <= 3 && (
        <OnboardingMobileNav
          currentStep={currentStep}
          isSubmitting={isSubmitting}
          canProceed={canProceedMobile}
          customSubmitLabel={selectedPlan !== "decouverte" ? "Créer & voir le récapitulatif" : "Activer mon espace"}
          onNext={() => {
            if (currentStep === 1) handleNextFromStep1();
            else if (currentStep === 2) handleNextFromStep2();
            else if (currentStep === 3) handleFinalSubmit();
          }}
          onBack={handleBack}
        />
      )}
    </div>
  );
}
