'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Building2,
  Settings,
  Globe,
  Phone,
  Mail,
  MapPin,
  Palette,
  Sparkles,
  MessageSquare,
  Clock,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Monitor,
  Search,
  RotateCcw,
  Upload,
  ArrowUpRight,
  Save,
  Check,
  X,
  Copy,
  Info,
  Calendar,
  Layers,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { workspaceApi } from '@/lib/api';
import {
  resolveCompanyBrandPalette,
  deriveHarmoniousPalette,
  extractPaletteFromImage,
  getBrandCssVariables,
  CompanyBrandPalette,
} from '@/lib/brandTheme';
import { Workspace } from '@/types/workspace';

// Available business sectors
const CATEGORIES = [
  'Télécommunications',
  'Banque & Finance',
  'Santé & Pharmacie',
  'Transport & Logistique',
  'E-commerce & Distribution',
  'Énergie & Eau',
  'Médias & Divertissement',
  'Hôtellerie & Restauration',
  'Services Publics & Administration',
  'Automobile & Équipements',
  'Autre',
];

// Available Timezones
const TIMEZONES = [
  { value: 'Africa/Brazzaville', label: 'Brazzaville / Kinshasa (GMT+1)' },
  { value: 'Africa/Douala', label: 'Douala / Yaoundé (GMT+1)' },
  { value: 'Africa/Libreville', label: 'Libreville (GMT+1)' },
  { value: 'Africa/Bangui', label: 'Bangui (GMT+1)' },
  { value: 'Africa/N_Djamena', label: "N'Djamena (GMT+1)'" },
  { value: 'Africa/Abidjan', label: 'Abidjan / Dakar (GMT+0)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1 / GMT+2)' },
];

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' },
];

const DEFAULT_CANNED_RESPONSES = [
  {
    id: 'cr-1',
    title: 'Message de bienvenue SAV',
    category: 'Accueil',
    content:
      "Bonjour ! Merci d'avoir contacté le service après-vente officiel. Un conseiller dédié prend en charge votre dossier. En quoi pouvons-nous vous assister ?",
    isActive: true,
  },
  {
    id: 'cr-2',
    title: 'Demande de pièces justificatives',
    category: 'Informations générales',
    content:
      "Afin de traiter votre dossier dans les meilleurs délais, pourriez-vous nous transmettre une photo nette du reçu d'achat ou de la facture, ainsi que le numéro de série de votre appareil ?",
    isActive: true,
  },
  {
    id: 'cr-3',
    title: 'Dossier transmis au service technique',
    category: 'Suivi des demandes',
    content:
      'Votre dossier a été transmis à notre équipe technique spécialisée. Un technicien analyse votre requête et nous reviendrons vers vous sous un délai de 24h ouvrées.',
    isActive: true,
  },
  {
    id: 'cr-4',
    title: 'Délai de traitement standard',
    category: 'Délais de traitement',
    content:
      'Nous vous informons que le délai moyen de diagnostic et de prise en charge pour ce type de demande est de 24 à 48 heures ouvrées.',
    isActive: true,
  },
  {
    id: 'cr-5',
    title: "Prise en charge d'une réclamation",
    category: 'Réclamations',
    content:
      'Nous comprenons parfaitement votre situation et regrettons la gêne occasionnée. Votre réclamation a été placée en priorité haute auprès de notre responsable qualité.',
    isActive: true,
  },
  {
    id: 'cr-6',
    title: 'Clôture et résolution satisfaisante',
    category: 'Clôture de conversation',
    content:
      "Nous sommes ravis d'avoir pu résoudre votre demande ! N'hésitez pas à nous recontacter si vous avez d'autres questions. Excellente journée !",
    isActive: true,
  },
];

const DEFAULT_SCHEDULE = {
  timezone: 'Africa/Brazzaville',
  isTemporarilyClosed: false,
  temporaryClosureMessage: '',
  schedule: {
    monday: { isOpen: true, slots: [{ open: '08:00', close: '18:00' }] },
    tuesday: { isOpen: true, slots: [{ open: '08:00', close: '18:00' }] },
    wednesday: { isOpen: true, slots: [{ open: '08:00', close: '18:00' }] },
    thursday: { isOpen: true, slots: [{ open: '08:00', close: '18:00' }] },
    friday: { isOpen: true, slots: [{ open: '08:00', close: '18:00' }] },
    saturday: { isOpen: true, slots: [{ open: '09:00', close: '13:00' }] },
    sunday: { isOpen: false, slots: [{ open: '09:00', close: '12:00' }] },
  },
};

function generateOpeningHoursSummary(
  scheduleObj: typeof DEFAULT_SCHEDULE.schedule,
  isTemporarilyClosed: boolean,
  tempMsg?: string
): string {
  if (isTemporarilyClosed) {
    return tempMsg?.trim() || 'Service temporairement fermé pour maintenance ou inventaire.';
  }

  const parts: string[] = [];
  const weekdaysOpen = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].every(
    (d) => scheduleObj[d as keyof typeof scheduleObj]?.isOpen
  );

  const getDayHours = (d: keyof typeof scheduleObj) => {
    const day = scheduleObj[d];
    if (!day || !day.isOpen || day.slots.length === 0) return 'Fermé';
    return day.slots.map((s) => `${s.open.replace(':', 'h')} - ${s.close.replace(':', 'h')}`).join(' & ');
  };

  const monHours = getDayHours('monday');
  const allWeekdaysSame = ['tuesday', 'wednesday', 'thursday', 'friday'].every(
    (d) => getDayHours(d as keyof typeof scheduleObj) === monHours
  );

  if (weekdaysOpen && allWeekdaysSame) {
    parts.push(`Lundi - Vendredi : ${monHours}`);
  } else {
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach((d) => {
      const label = DAYS_OF_WEEK.find((x) => x.key === d)?.label;
      const h = getDayHours(d as keyof typeof scheduleObj);
      if (h !== 'Fermé') parts.push(`${label} : ${h}`);
    });
  }

  const satHours = getDayHours('saturday');
  if (satHours !== 'Fermé') {
    parts.push(`Samedi : ${satHours}`);
  }

  const sunHours = getDayHours('sunday');
  if (sunHours !== 'Fermé') {
    parts.push(`Dimanche : ${sunHours}`);
  }

  return parts.length > 0 ? parts.join(' · ') : 'Lundi - Vendredi : 08h00 - 18h00';
}

type SettingsTab = 'general' | 'branding' | 'canned' | 'hours' | 'danger';

export default function SettingsPage() {
  const { currentWorkspace, userRole, setCurrentWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // General state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Autre');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Brazzaville');
  const [country, setCountry] = useState('Congo');
  const [supportPhone, setSupportPhone] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportWhatsApp, setSupportWhatsApp] = useState('');
  const [website, setWebsite] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // Visual Identity & Branding state
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<CompanyBrandPalette>(() =>
    resolveCompanyBrandPalette({ name: 'Zadesk' })
  );
  const [extractedPalette, setExtractedPalette] = useState<CompanyBrandPalette | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canned Responses state
  const [cannedResponses, setCannedResponses] = useState(DEFAULT_CANNED_RESPONSES);
  const [cannedSearch, setCannedSearch] = useState('');
  const [cannedCategoryFilter, setCannedCategoryFilter] = useState('ALL');
  const [editingResponse, setEditingResponse] = useState<any | null>(null);
  const [isCannedModalOpen, setIsCannedModalOpen] = useState(false);

  // Business Hours state
  const [businessHours, setBusinessHours] = useState(DEFAULT_SCHEDULE);

  // Load detailed workspace data from server
  const loadWorkspaceDetails = async () => {
    if (!currentWorkspace?.id) return;
    setLoading(true);
    try {
      const ws = await workspaceApi.getWorkspace(currentWorkspace.id);
      if (ws) {
        setName(ws.name || '');
        setSlug(ws.slug || '');
        setCategory(ws.category || 'Autre');
        setDescription(ws.description || '');
        setAddress(ws.address || '');
        setCity(ws.city || 'Brazzaville');
        setCountry(ws.country || 'Congo');
        setSupportPhone(ws.supportPhone || '');
        setSupportEmail(ws.supportEmail || '');
        setSupportWhatsApp(ws.supportWhatsApp || '');
        setWebsite(ws.website || '');
        setIsPublic(ws.isPublic !== undefined ? ws.isPublic : true);
        setLogoUrl(ws.logoUrl || null);
        setCoverUrl(ws.coverUrl || null);

        // Resolve palette
        const resolved = resolveCompanyBrandPalette({
          slug: ws.slug,
          name: ws.name,
          category: ws.category,
          brandPalette: ws.brandPalette,
          brandColor: ws.brandColor,
        });
        setPalette(resolved);

        // Canned responses
        if (Array.isArray(ws.cannedResponses) && ws.cannedResponses.length > 0) {
          setCannedResponses(ws.cannedResponses);
        } else {
          setCannedResponses(DEFAULT_CANNED_RESPONSES);
        }

        // Business hours
        if (ws.businessHours?.schedule) {
          setBusinessHours(ws.businessHours);
        } else {
          setBusinessHours(DEFAULT_SCHEDULE);
        }
      }
    } catch (err: any) {
      console.error('Erreur chargement workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceDetails();
  }, [currentWorkspace?.id]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as SettingsTab;
      if (tabParam && ['general', 'branding', 'canned', 'hours', 'danger'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  // Handle Save All Settings
  const handleSave = async (extraPayload: Record<string, any> = {}) => {
    if (!currentWorkspace?.id) return;
    setSaving(true);
    setErrorMessage(null);

    const targetBusinessHours = extraPayload.businessHours || businessHours;
    const generatedOpeningHours = generateOpeningHoursSummary(
      targetBusinessHours.schedule,
      targetBusinessHours.isTemporarilyClosed,
      targetBusinessHours.temporaryClosureMessage
    );

    const payload = {
      name: name.trim(),
      category,
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      supportPhone: supportPhone.trim(),
      supportEmail: supportEmail.trim(),
      supportWhatsApp: supportWhatsApp.trim(),
      website: website.trim(),
      isPublic,
      logoUrl,
      coverUrl,
      brandColor: palette.primary,
      brandPalette: palette,
      cannedResponses,
      businessHours: targetBusinessHours,
      openingHours: generatedOpeningHours,
      ...extraPayload,
    };

    try {
      const updated = await workspaceApi.updateWorkspace(currentWorkspace.id, payload);
      if (updated) {
        setCurrentWorkspace(updated);
        setSavedSuccess('Paramètres de l’entreprise enregistrés avec succès !');
        setTimeout(() => setSavedSuccess(null), 3500);
      }
    } catch (err: any) {
      console.error('Erreur sauvegarde:', err);
      setErrorMessage(err.message || 'Impossible d’enregistrer les modifications.');
    } finally {
      setSaving(false);
    }
  };

  // Logo upload & color extraction handler
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image valide (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('La taille du logo ne doit pas dépasser 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setLogoUrl(dataUrl);

      // Extract dominant palette
      try {
        const extracted = await extractPaletteFromImage(dataUrl);
        setExtractedPalette(extracted);
        setPalette(extracted);
      } catch (extractErr) {
        console.warn('Extraction couleur logo échouée:', extractErr);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoUrl(null);
    setExtractedPalette(null);
    const fallback = resolveCompanyBrandPalette({ name, category, slug });
    setPalette(fallback);
  };

  const handleResetColors = () => {
    const fallback = resolveCompanyBrandPalette({ name, category, slug });
    setPalette(fallback);
  };

  const handleRestoreExtracted = () => {
    if (extractedPalette) {
      setPalette(extractedPalette);
    }
  };

  const handlePrimaryColorChange = (newHex: string) => {
    const updated = deriveHarmoniousPalette(newHex);
    setPalette(updated);
  };

  // Canned responses helpers
  const handleSaveCannedResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResponse?.title || !editingResponse?.content) return;

    let updatedList = [...cannedResponses];
    if (editingResponse.id) {
      // Update existing
      updatedList = updatedList.map((item) =>
        item.id === editingResponse.id
          ? { ...editingResponse, updatedAt: new Date().toISOString() }
          : item
      );
    } else {
      // Create new
      const newItem = {
        ...editingResponse,
        id: `cr-${Date.now()}`,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      updatedList.unshift(newItem);
    }

    setCannedResponses(updatedList);
    setIsCannedModalOpen(false);
    setEditingResponse(null);
    // Autosave to workspace
    handleSave({ cannedResponses: updatedList });
  };

  const handleDeleteCannedResponse = (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette réponse enregistrée ?')) return;
    const updatedList = cannedResponses.filter((item) => item.id !== id);
    setCannedResponses(updatedList);
    handleSave({ cannedResponses: updatedList });
  };

  const handleToggleCannedResponse = (id: string) => {
    const updatedList = cannedResponses.map((item) =>
      item.id === id ? { ...item, isActive: !item.isActive } : item
    );
    setCannedResponses(updatedList);
    handleSave({ cannedResponses: updatedList });
  };

  // Business hours helpers
  const handleToggleDayOpen = (dayKey: string) => {
    const current = businessHours.schedule[dayKey as keyof typeof businessHours.schedule];
    const updatedSchedule = {
      ...businessHours.schedule,
      [dayKey]: {
        ...current,
        isOpen: !current.isOpen,
      },
    };
    const updated = { ...businessHours, schedule: updatedSchedule };
    setBusinessHours(updated);
  };

  const handleSlotChange = (dayKey: string, slotIdx: number, field: 'open' | 'close', value: string) => {
    const currentDay = businessHours.schedule[dayKey as keyof typeof businessHours.schedule];
    const updatedSlots = currentDay.slots.map((s, idx) =>
      idx === slotIdx ? { ...s, [field]: value } : s
    );
    const updatedSchedule = {
      ...businessHours.schedule,
      [dayKey]: {
        ...currentDay,
        slots: updatedSlots,
      },
    };
    setBusinessHours({ ...businessHours, schedule: updatedSchedule });
  };

  const handleAddSlot = (dayKey: string) => {
    const currentDay = businessHours.schedule[dayKey as keyof typeof businessHours.schedule];
    if (currentDay.slots.length >= 3) return;
    const updatedSlots = [...currentDay.slots, { open: '14:00', close: '18:00' }];
    const updatedSchedule = {
      ...businessHours.schedule,
      [dayKey]: {
        ...currentDay,
        slots: updatedSlots,
      },
    };
    setBusinessHours({ ...businessHours, schedule: updatedSchedule });
  };

  const handleRemoveSlot = (dayKey: string, slotIdx: number) => {
    const currentDay = businessHours.schedule[dayKey as keyof typeof businessHours.schedule];
    if (currentDay.slots.length <= 1) return;
    const updatedSlots = currentDay.slots.filter((_, idx) => idx !== slotIdx);
    const updatedSchedule = {
      ...businessHours.schedule,
      [dayKey]: {
        ...currentDay,
        slots: updatedSlots,
      },
    };
    setBusinessHours({ ...businessHours, schedule: updatedSchedule });
  };

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/entreprises/${slug}` : `/entreprises/${slug}`;

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 animate-fade-in text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/80 shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Paramètres de l&apos;entreprise</h1>
              <p className="text-xs text-slate-500">
                Gérez le profil de votre organisation, personnalisez votre page publique SAV et configurez vos disponibilités.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link
            href={`/entreprises/${slug}`}
            target="_blank"
            className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-100/70 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span className="hidden xs:inline">Voir ma page publique</span>
            <span className="xs:hidden">Page publique</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <Button
            onClick={() => handleSave()}
            disabled={saving}
            variant="gradient"
            leftIcon={saving ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            className="flex-1 sm:flex-initial justify-center active:scale-95"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer tout'}
          </Button>
        </div>
      </div>

      {/* Global Alerts */}
      {savedSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Segmented Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 overflow-x-auto overscroll-contain scrollbar-none text-xs">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Informations générales</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'branding'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Palette className="w-4 h-4 text-indigo-600" />
          <span>Page publique & Charte graphique</span>
        </button>

        <button
          onClick={() => setActiveTab('canned')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'canned'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-sky-600" />
          <span>Réponses enregistrées</span>
          <span className="px-1.5 py-0.2 rounded-md bg-slate-200 text-[10px] font-bold">
            {cannedResponses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hours')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'hours'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Disponibilité du SAV</span>
        </button>

        {userRole === 'OWNER' && (
          <button
            onClick={() => setActiveTab('danger')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'danger'
                ? 'bg-rose-50 text-rose-800 shadow-sm border border-rose-200'
                : 'text-slate-500 hover:text-rose-700 hover:bg-rose-100/40'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Zone de danger</span>
          </button>
        )}
      </div>

      {/* ================= TAB 1: INFORMATIONS GÉNÉRALES ================= */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Identité de l&apos;Entreprise
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ces informations définissent votre organisation et sont reprises sur vos guichets d&apos;assistance.
                </p>
              </div>

              {/* Public toggle switch */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <span className="text-xs font-semibold text-slate-700">Page publique active</span>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">Nom officiel de l&apos;entreprise *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Clinique Sainte-Marie"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">Secteur d&apos;activité</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-medium bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5 text-xs">
                <label className="font-bold text-slate-700">Description / Présentation publique</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Présentez brièvement vos activités, engagements de service et missions auprès de vos clients..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-normal leading-relaxed resize-y"
                />
              </div>

              {/* Public URL Permalink banner */}
              <div className="md:col-span-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Adresse de votre guichet SAV officiel
                  </span>
                  <p className="font-mono font-semibold text-emerald-800 mt-0.5 break-all">{publicUrl}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={copyPublicUrl}
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUrl ? 'Copié !' : 'Copier le lien'}</span>
                  </button>
                  <Link
                    href={`/entreprises/${slug}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-2xs"
                  >
                    <span>Ouvrir</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Coordonnées de Contact & Localisation */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-sky-600" />
                Coordonnées & Emplacement
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Téléphone assistance
                  </label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="Ex: +242 06 000 00 00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email d&apos;assistance client
                  </label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="Ex: sav@clinique-sainte-marie.cg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Numéro WhatsApp officiel
                  </label>
                  <input
                    type="text"
                    value={supportWhatsApp}
                    onChange={(e) => setSupportWhatsApp(e.target.value)}
                    placeholder="Ex: +242 06 942 09 72"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Site web officiel
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="Ex: https://www.clinique-sainte-marie.cg"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Adresse physique / Siège
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Ex: Boulevard Denis Sassou Nguesso, Centre-Ville"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-700">Ville</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Brazzaville, Pointe-Noire"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-slate-700">Pays</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Ex: Congo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button onClick={() => handleSave()} disabled={saving} variant="gradient">
                {saving ? 'Enregistrement...' : 'Enregistrer les informations'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: BRANDING & PAGE PUBLIQUE ================= */}
      {activeTab === 'branding' && (
        <div className="space-y-8">
          {/* Top Panel: Logo & Color Extraction Engine */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  Identité Visuelle & Extraction Automatique
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Importez le logo de votre entreprise. Zadesk extrait instantanément une palette de couleurs harmonieuse pour votre page publique.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {extractedPalette && (
                  <button
                    type="button"
                    onClick={handleRestoreExtracted}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Revenir à la palette déduite du logo"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Palette du logo</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetColors}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Réinitialiser</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Logo Manager */}
              <div className="md:col-span-5 space-y-4">
                <label className="text-xs font-bold text-slate-700 block">Logo officiel</label>

                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center p-2 relative overflow-hidden group shadow-2xs">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo entreprise" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <Building2 className="w-8 h-8 mx-auto mb-1 stroke-1" />
                        <span className="text-[10px] font-semibold block">Aucun logo</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoFileChange}
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                    >
                      {logoUrl ? 'Remplacer le logo' : 'Importer un logo'}
                    </Button>

                    {logoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer block"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Supprimer le logo</span>
                      </button>
                    )}

                    <p className="text-[10px] text-slate-400 leading-tight">
                      PNG, JPG ou SVG conseillés. Max 2 Mo. Format carré ou rectangulaire.
                    </p>
                  </div>
                </div>

                {/* Cover Image Input */}
                <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100">
                  <label className="font-semibold text-slate-700">Image de couverture (URL)</label>
                  <input
                    type="url"
                    value={coverUrl || ''}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://.../banniere.jpg"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                  <p className="text-[10px] text-slate-400">
                    Bannière d&apos;en-tête affichée en haut de votre page publique.
                  </p>
                </div>
              </div>

              {/* Color Palette Customizer */}
              <div className="md:col-span-7 bg-slate-50/70 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Charte graphique dérivée (WCAG AA)
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Primaire : {palette.primary}
                  </span>
                </div>

                {/* Swatches preview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div
                    className="p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1"
                    style={{ backgroundColor: palette.primary, color: palette.contrastText }}
                  >
                    <span className="text-[10px] opacity-80 uppercase font-bold tracking-wider block">Principale</span>
                    <span className="font-bold text-xs font-mono">{palette.primary}</span>
                  </div>

                  <div
                    className="p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1"
                    style={{ backgroundColor: palette.secondary, color: palette.text }}
                  >
                    <span className="text-[10px] opacity-80 uppercase font-bold tracking-wider block">Secondaire</span>
                    <span className="font-bold text-xs font-mono">{palette.secondary}</span>
                  </div>

                  <div
                    className="p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1"
                    style={{ backgroundColor: palette.accent, color: '#FFFFFF' }}
                  >
                    <span className="text-[10px] opacity-80 uppercase font-bold tracking-wider block">Accent</span>
                    <span className="font-bold text-xs font-mono">{palette.accent}</span>
                  </div>

                  <div
                    className="p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1"
                    style={{ backgroundColor: palette.surface, color: palette.text }}
                  >
                    <span className="text-[10px] opacity-80 uppercase font-bold tracking-wider block">Fond / Cartes</span>
                    <span className="font-bold text-xs font-mono">{palette.surface}</span>
                  </div>
                </div>

                {/* Manual Color Picker */}
                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <label className="text-xs font-bold text-slate-700 block">
                    Personnaliser la couleur dominante :
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={palette.primary}
                      onChange={(e) => handlePrimaryColorChange(e.target.value)}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={palette.primary}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9A-F]{6}$/i.test(val)) {
                          handlePrimaryColorChange(val);
                        }
                      }}
                      className="w-28 px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase font-bold"
                    />
                    <span className="text-[11px] text-slate-500">
                      Toutes les nuances s&apos;adaptent automatiquement pour préserver un contraste parfait.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Panel: Live Public Page Preview */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-600" />
                  Aperçu en Direct de la Page Publique
                </h3>
                <p className="text-xs text-slate-500">
                  Visualisez fidèlement le rendu de votre guichet SAV pour vos clients.
                </p>
              </div>

              {/* Viewport switch: Desktop / Mobile */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewMode('desktop')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    previewMode === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Grand écran</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('mobile')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    previewMode === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Preview Frame Wrapper */}
            <div className="bg-slate-900/5 p-4 sm:p-8 rounded-2xl flex justify-center items-center overflow-x-auto">
              <div
                style={getBrandCssVariables(palette)}
                className={`transition-all duration-300 bg-[#F7F8FA] border border-slate-200/90 shadow-xl rounded-3xl overflow-hidden text-slate-900 ${
                  previewMode === 'mobile' ? 'w-[375px] min-h-[600px]' : 'w-full max-w-4xl min-h-[500px]'
                }`}
              >
                {/* Header Mockup */}
                <div className="h-14 px-4 bg-white border-b border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                      {logoUrl ? (
                        <img src={logoUrl} alt={name} className="w-full h-full object-contain" />
                      ) : (
                        <Building2 className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{name || 'Nom de votre entreprise'}</h4>
                      <p className="text-[10px] text-slate-400">{category}</p>
                    </div>
                  </div>

                  <span
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: palette.secondary, color: palette.text }}
                  >
                    SAV Officiel
                  </span>
                </div>

                {/* Hero / Cover Mockup */}
                {coverUrl && (
                  <div className="h-28 w-full overflow-hidden relative">
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  </div>
                )}

                {/* Chat Container Mockup */}
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Automated welcome message with brand palette */}
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ backgroundColor: palette.primary, color: palette.contrastText }}
                    >
                      SAV
                    </div>
                    <div
                      className="p-3.5 rounded-2xl rounded-tl-sm text-xs leading-relaxed space-y-1.5 shadow-2xs"
                      style={{
                        backgroundColor: palette.surface,
                        borderColor: palette.surfaceBorder,
                        borderWidth: 1,
                        color: palette.text,
                      }}
                    >
                      <p className="font-bold text-[11px]">Support Officiel • {name || 'Entreprise'}</p>
                      <p className="text-[11px] text-slate-700">
                        Bonjour ! Bienvenue sur notre espace d&apos;assistance client. Comment pouvons-nous vous aider aujourd&apos;hui ?
                      </p>
                    </div>
                  </div>

                  {/* Customer question demo */}
                  <div className="flex justify-end">
                    <div className="bg-slate-900 text-white p-3 rounded-2xl rounded-tr-sm text-xs max-w-[80%] shadow-2xs">
                      Bonjour, j&apos;aimerais connaître vos délais de prise en charge pour une réclamation.
                    </div>
                  </div>

                  {/* Suggestions Chips Mockup */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {['Suivi de commande', 'Horaires & Agences', 'Parler à un conseiller'].map((chip) => (
                      <span
                        key={chip}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-semibold border cursor-default"
                        style={{
                          backgroundColor: palette.secondary,
                          borderColor: palette.surfaceBorder,
                          color: palette.text,
                        }}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Action Bar for Tab 2 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  L&apos;enregistrement applique immédiatement votre logo, couverture et charte graphique à votre guichet SAV public.
                </span>
              </div>
              <Button onClick={() => handleSave()} disabled={saving} variant="gradient" className="shrink-0">
                {saving ? 'Enregistrement...' : "Enregistrer l'identité visuelle"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: RÉPONSES ENREGISTRÉES ================= */}
      {activeTab === 'canned' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  Réponses Types & Réponses Enregistrées
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configurez les réponses réutilisables par vos agents dans leurs conversations pour un SAV plus rapide et homogène.
                </p>
              </div>

              <Button
                onClick={() => {
                  setEditingResponse({
                    title: '',
                    category: 'Accueil',
                    content: '',
                    isActive: true,
                  });
                  setIsCannedModalOpen(true);
                }}
                variant="gradient"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Nouvelle réponse
              </Button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={cannedSearch}
                  onChange={(e) => setCannedSearch(e.target.value)}
                  placeholder="Rechercher une réponse type..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-slate-500 font-semibold text-[11px] whitespace-nowrap">Catégorie :</span>
                <select
                  value={cannedCategoryFilter}
                  onChange={(e) => setCannedCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800"
                >
                  <option value="ALL">Toutes les catégories</option>
                  <option value="Accueil">Accueil</option>
                  <option value="Informations générales">Informations générales</option>
                  <option value="Suivi des demandes">Suivi des demandes</option>
                  <option value="Délais de traitement">Délais de traitement</option>
                  <option value="Réclamations">Réclamations</option>
                  <option value="Clôture de conversation">Clôture de conversation</option>
                </select>
              </div>
            </div>

            {/* List of Canned Responses */}
            <div className="divide-y divide-slate-100">
              {cannedResponses
                .filter((r) => {
                  if (cannedCategoryFilter !== 'ALL' && r.category !== cannedCategoryFilter) return false;
                  if (cannedSearch.trim()) {
                    const q = cannedSearch.toLowerCase();
                    return r.title.toLowerCase().includes(q) || r.content.toLowerCase().includes(q);
                  }
                  return true;
                })
                .map((response) => (
                  <div key={response.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{response.title}</h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {response.category}
                        </span>
                        {!response.isActive && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Désactivée
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5">{response.content}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleCannedResponse(response.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                          response.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                        title={response.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {response.isActive ? 'Active' : 'Inactive'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingResponse(response);
                          setIsCannedModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Modifier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCannedResponse(response.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

              {cannedResponses.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Aucune réponse type enregistrée. Cliquez sur &quot;Nouvelle réponse&quot; pour en ajouter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: DISPONIBILITÉ DU SAV (HORAIRES) ================= */}
      {activeTab === 'hours' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Horaires d&apos;Ouverture & Disponibilité SAV
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Définissez les plages de disponibilité de vos conseillers humains. Vos clients consultent ces horaires directement sur votre page officielle.
                </p>
              </div>

              {/* Timezone picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Fuseau :</span>
                <select
                  value={businessHours.timezone}
                  onChange={(e) => setBusinessHours({ ...businessHours, timezone: e.target.value })}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Temporary Closure Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-900">
                    Fermeture temporaire exceptionnelle
                  </span>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={businessHours.isTemporarilyClosed}
                    onChange={(e) =>
                      setBusinessHours({
                        ...businessHours,
                        isTemporarilyClosed: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600 relative"></div>
                </label>
              </div>

              {businessHours.isTemporarilyClosed && (
                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-amber-900">Motif affiché aux clients :</label>
                  <input
                    type="text"
                    value={businessHours.temporaryClosureMessage || ''}
                    onChange={(e) =>
                      setBusinessHours({
                        ...businessHours,
                        temporaryClosureMessage: e.target.value,
                      })
                    }
                    placeholder="Ex: Fermé pour inventaire annuel ce vendredi. Réouverture lundi à 8h."
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs bg-white text-slate-900 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>
              )}
            </div>

            {/* Daily Schedule Configuration */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Planning d&apos;ouverture hebdomadaire
              </h4>

              <div className="divide-y divide-slate-100">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const day = businessHours.schedule[key as keyof typeof businessHours.schedule];

                  return (
                    <div key={key} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="w-36 flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={day?.isOpen || false}
                            onChange={() => handleToggleDayOpen(key)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 relative"></div>
                        </label>
                        <span className={`text-xs font-bold ${day?.isOpen ? 'text-slate-900' : 'text-slate-400'}`}>
                          {label}
                        </span>
                      </div>

                      {/* Slots */}
                      <div className="flex-1 flex flex-wrap items-center gap-2">
                        {day?.isOpen ? (
                          <>
                            {day.slots.map((slot, sIdx) => (
                              <div key={sIdx} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
                                <input
                                  type="time"
                                  value={slot.open}
                                  onChange={(e) => handleSlotChange(key, sIdx, 'open', e.target.value)}
                                  className="bg-transparent font-semibold text-slate-800 focus:outline-none"
                                />
                                <span className="text-slate-400">à</span>
                                <input
                                  type="time"
                                  value={slot.close}
                                  onChange={(e) => handleSlotChange(key, sIdx, 'close', e.target.value)}
                                  className="bg-transparent font-semibold text-slate-800 focus:outline-none"
                                />
                                {day.slots.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSlot(key, sIdx)}
                                    className="text-slate-400 hover:text-rose-600 p-0.5 ml-1"
                                    title="Supprimer la plage"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}

                            {day.slots.length < 3 && (
                              <button
                                type="button"
                                onClick={() => handleAddSlot(key)}
                                className="px-2.5 py-1.5 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:text-slate-800 hover:border-slate-400 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Ajouter une plage</span>
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 italic">
                            Fermé toute la journée
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Generated Summary Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Synthèse affichée sur votre page publique :
              </span>
              <p className="font-semibold text-slate-800">
                {generateOpeningHoursSummary(
                  businessHours.schedule,
                  businessHours.isTemporarilyClosed,
                  businessHours.temporaryClosureMessage
                )}
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button onClick={() => handleSave()} disabled={saving} variant="gradient">
                {saving ? 'Enregistrement...' : 'Enregistrer les horaires'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: ZONE DE DANGER (OWNER ONLY) ================= */}
      {activeTab === 'danger' && userRole === 'OWNER' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/60 border border-rose-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Zone de Danger</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            La suppression de cet espace de travail est irréversible. Toutes les données associées (conversations, tickets de continuité, agences physiques et documents de connaissances) seront définitivement effacées.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                const conf = prompt(
                  `Pour confirmer la suppression définitive, veuillez taper le nom exact de l'entreprise : "${name}"`
                );
                if (conf === name) {
                  alert('Protection active : la suppression complète en environnement de production requiert la confirmation du support Zadesk.');
                } else if (conf !== null) {
                  alert('Le nom saisi ne correspond pas. Suppression annulée.');
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer définitivement ce Workspace</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal for Creating / Editing Canned Response */}
      {isCannedModalOpen && editingResponse && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingResponse.id ? 'Modifier la réponse type' : 'Nouvelle réponse type'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCannedModalOpen(false);
                  setEditingResponse(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCannedResponse} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Titre de la réponse *</label>
                <input
                  type="text"
                  required
                  value={editingResponse.title}
                  onChange={(e) => setEditingResponse({ ...editingResponse, title: e.target.value })}
                  placeholder="Ex: Confirmation de prise en charge"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Catégorie</label>
                <select
                  value={editingResponse.category}
                  onChange={(e) => setEditingResponse({ ...editingResponse, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 font-semibold bg-white"
                >
                  <option value="Accueil">Accueil</option>
                  <option value="Informations générales">Informations générales</option>
                  <option value="Suivi des demandes">Suivi des demandes</option>
                  <option value="Délais de traitement">Délais de traitement</option>
                  <option value="Réclamations">Réclamations</option>
                  <option value="Clôture de conversation">Clôture de conversation</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Contenu du message réutilisable *</label>
                <textarea
                  rows={4}
                  required
                  value={editingResponse.content}
                  onChange={(e) => setEditingResponse({ ...editingResponse, content: e.target.value })}
                  placeholder="Rédigez le texte exact qui sera inséré dans la conversation..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 leading-relaxed resize-y"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCannedModalOpen(false);
                    setEditingResponse(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Annuler
                </button>

                <Button type="submit" variant="gradient">
                  {editingResponse.id ? 'Mettre à jour' : 'Créer la réponse'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
