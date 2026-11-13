'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  Plus,
  MapPin,
  Clock,
  Phone,
  Mail,
  Search,
  Filter,
  Trash2,
  Edit3,
  Star,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Store,
  Compass,
  MessageCircle,
  Info,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Camera,
  Upload,
  Globe,
  Lock,
  Image as ImageIcon,
} from 'lucide-react';
import { useWorkspace } from '@/components/workspace/WorkspaceContext';
import { workspaceApi } from '@/lib/api';
import { Establishment, EstablishmentType } from '@/types/workspace';

const TYPE_CONFIG: Record<
  EstablishmentType,
  { label: string; badgeClass: string; icon: React.FC<{ className?: string }> }
> = {
  HEADQUARTERS: {
    label: 'Siège social',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    icon: Building2,
  },
  BRANCH: {
    label: 'Agence',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/80',
    icon: Building2,
  },
  STORE: {
    label: 'Boutique',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    icon: Store,
  },
  POINT_OF_SALE: {
    label: 'Point de vente',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80',
    icon: Store,
  },
  SERVICE_POINT: {
    label: 'Comptoir SAV',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
    icon: Compass,
  },
  PICKUP_POINT: {
    label: 'Point relais',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80',
    icon: MapPin,
  },
  TECH_CENTER: {
    label: 'Centre technique',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200/80',
    icon: Building2,
  },
  OTHER: {
    label: 'Autre site',
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200/80',
    icon: Building2,
  },
};

const COMMON_SERVICES = [
  'Accueil & Renseignement SAV',
  'Dépôt de matériel pour réparation',
  'Diagnostic technique express',
  'Échange standard sous garantie',
  'Retrait de colis & matériel',
  'Vente d’accessoires & pièces détachées',
  'Conseil technique personnalisé',
];

interface FormState {
  name: string;
  type: EstablishmentType;
  description: string;
  isMain: boolean;
  isActive: boolean;
  isPublic: boolean;
  address: string;
  addressDetails: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  whatsapp: string;
  openingHours: string;
  services: string[];
  practicalInfo: string;
  imageUrl: string;
  galleryImages: string[];
}

const DEFAULT_FORM: FormState = {
  name: '',
  type: 'BRANCH',
  description: '',
  isMain: false,
  isActive: true,
  isPublic: true,
  address: '',
  addressDetails: '',
  city: 'Brazzaville',
  country: 'Congo',
  phone: '',
  email: '',
  whatsapp: '',
  openingHours: 'Lun - Ven : 08h00 - 18h00 | Sam : 09h00 - 13h00',
  services: ['Accueil & Renseignement SAV', 'Dépôt de matériel pour réparation'],
  practicalInfo: '',
  imageUrl: '',
  galleryImages: [],
};

export default function EstablishmentsPage() {
  const { currentWorkspace, userRole } = useWorkspace();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM);
  const [customServiceInput, setCustomServiceInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [establishmentToDelete, setEstablishmentToDelete] = useState<Establishment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // RBAC checks
  const canManage = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'MANAGER';
  const canDelete = userRole === 'OWNER' || userRole === 'ADMIN';

  const fetchEstablishments = useCallback(async () => {
    if (!currentWorkspace?.id) return;
    try {
      setIsLoading(true);
      const res = await workspaceApi.getEstablishments(currentWorkspace.id);
      setEstablishments(res.establishments || []);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Impossible de charger vos établissements.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id]);

  useEffect(() => {
    fetchEstablishments();
  }, [fetchEstablishments]);

  // Filter establishments
  const filteredEstablishments = useMemo(() => {
    return establishments.filter((est) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = est.name.toLowerCase().includes(q);
        const matchesCity = est.city.toLowerCase().includes(q);
        const matchesAddress = est.address.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesAddress) return false;
      }
      if (typeFilter !== 'ALL' && est.type !== typeFilter) {
        return false;
      }
      if (visibilityFilter === 'PUBLIC' && !est.isPublic) {
        return false;
      }
      if (visibilityFilter === 'PRIVATE' && est.isPublic) {
        return false;
      }
      return true;
    });
  }, [establishments, searchQuery, typeFilter, visibilityFilter]);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      ...DEFAULT_FORM,
      city: currentWorkspace?.city || 'Brazzaville',
      country: currentWorkspace?.country || 'Congo',
      isMain: establishments.length === 0, // First establishment is default main
      imageUrl: '',
      galleryImages: [],
    });
    setCustomServiceInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (est: Establishment) => {
    setIsEditing(true);
    setEditingId(est.id);
    setFormData({
      name: est.name || '',
      type: est.type || 'BRANCH',
      description: est.description || '',
      isMain: Boolean(est.isMain),
      isActive: est.isActive !== undefined ? est.isActive : true,
      isPublic: est.isPublic !== undefined ? est.isPublic : true,
      address: est.address || '',
      addressDetails: est.addressDetails || '',
      city: est.city || 'Brazzaville',
      country: est.country || 'Congo',
      phone: est.phone || '',
      email: est.email || '',
      whatsapp: est.whatsapp || '',
      openingHours: est.openingHours || '',
      services: est.services || [],
      practicalInfo: est.practicalInfo || '',
      imageUrl: est.imageUrl || '',
      galleryImages: est.galleryImages || [],
    });
    setCustomServiceInput('');
    setIsModalOpen(true);
  };

  const compressImageFile = (file: File, maxWidth = 1200, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawData = event.target?.result as string;
        if (!rawData) {
          resolve('');
          return;
        }
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawData);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(rawData);
        img.src = rawData;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).' });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setFeedback({ type: 'error', text: 'L’image est trop volumineuse (maximum 8 Mo).' });
      return;
    }
    try {
      const compressedBase64 = await compressImageFile(file, 1200, 0.85);
      if (compressedBase64) {
        setFormData((prev) => ({ ...prev, imageUrl: compressedBase64 }));
      }
    } catch {
      setFeedback({ type: 'error', text: 'Impossible de traiter cette image.' });
    }
  };

  const handleToggleService = (service: string) => {
    setFormData((prev) => {
      const exists = prev.services.includes(service);
      return {
        ...prev,
        services: exists
          ? prev.services.filter((s) => s !== service)
          : [...prev.services, service],
      };
    });
  };

  const handleAddCustomService = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customServiceInput.trim();
    if (!trimmed) return;
    if (!formData.services.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        services: [...prev.services, trimmed],
      }));
    }
    setCustomServiceInput('');
  };

  const handleSaveEstablishment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace?.id) return;

    if (!formData.name.trim() || !formData.address.trim() || !formData.city.trim()) {
      setFeedback({
        type: 'error',
        text: 'Veuillez renseigner le nom, l’adresse et la ville de l’établissement.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing && editingId) {
        await workspaceApi.updateEstablishment(currentWorkspace.id, editingId, formData);
        setFeedback({
          type: 'success',
          text: `Établissement « ${formData.name} » mis à jour avec succès.`,
        });
      } else {
        await workspaceApi.createEstablishment(currentWorkspace.id, formData);
        setFeedback({
          type: 'success',
          text: `Établissement « ${formData.name} » ajouté à votre annuaire.`,
        });
      }
      setIsModalOpen(false);
      await fetchEstablishments();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Erreur lors de l’enregistrement de l’établissement.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentWorkspace?.id || !establishmentToDelete) return;
    try {
      setIsDeleting(true);
      await workspaceApi.deleteEstablishment(currentWorkspace.id, establishmentToDelete.id);
      setFeedback({
        type: 'success',
        text: `Établissement « ${establishmentToDelete.name} » retiré avec succès.`,
      });
      setIsDeleteModalOpen(false);
      setEstablishmentToDelete(null);
      await fetchEstablishments();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Impossible de supprimer cet établissement.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickTogglePublic = async (est: Establishment) => {
    if (!currentWorkspace?.id) return;
    const newStatus = !est.isPublic;

    // Optimistic local update (Apple response: instantaneous feedback)
    setEstablishments((prev) =>
      prev.map((item) => (item.id === est.id ? { ...item, isPublic: newStatus } : item))
    );

    try {
      await workspaceApi.updateEstablishment(currentWorkspace.id, est.id, {
        isPublic: newStatus,
      });
      setFeedback({
        type: 'success',
        text: newStatus
          ? `L'établissement « ${est.name} » est désormais visible par vos clients sur votre page SAV.`
          : `L'établissement « ${est.name} » est maintenant en usage interne (masqué aux clients).`,
      });
    } catch (err: any) {
      // Revert if error
      setEstablishments((prev) =>
        prev.map((item) => (item.id === est.id ? { ...item, isPublic: !newStatus } : item))
      );
      setFeedback({
        type: 'error',
        text: err.message || 'Impossible de modifier la visibilité de cet établissement.',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-sm transition-all ${
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
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            Nos établissements
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Annuaire de vos boutiques, agences, comptoirs SAV et points de contact physiques. Ces
            adresses permettent à vos clients de trouver vos locaux officiels depuis votre espace public SAV.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un établissement</span>
            </button>
          )}
        </div>
      </div>

      {/* Case A: Empty State when 0 establishments */}
      {!isLoading && establishments.length === 0 && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mx-auto text-sky-600">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-base font-bold text-slate-900">
              Votre entreprise fonctionne exclusivement en ligne ?
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Zadesk est parfaitement adapté aux commerces 100% digitaux, boutiques Instagram ou
              services WhatsApp. Aucun établissement physique n’est requis pour piloter votre SAV et
              vos dossiers clients.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left max-w-lg mx-auto text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>À quoi sert ce module ?</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Si vous disposez d’une boutique, d’un atelier, d’un point relais ou d’un siège où vos
              clients peuvent déposer du matériel ou retirer un colis, ajoutez-le ici pour l’afficher sur
              votre fiche SAV officielle.
            </p>
          </div>

          {canManage && (
            <div>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un premier établissement (facultatif)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Case B & C: Establishments List */}
      {(isLoading || establishments.length > 0) && (
        <>
          {/* Search & Filters Bar */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, ville, adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
              >
                <option value="ALL">Tous les types ({establishments.length})</option>
                <option value="HEADQUARTERS">Sièges sociaux</option>
                <option value="STORE">Boutiques</option>
                <option value="BRANCH">Agences</option>
                <option value="SERVICE_POINT">Comptoirs SAV</option>
                <option value="PICKUP_POINT">Points relais</option>
                <option value="TECH_CENTER">Centres techniques</option>
                <option value="POINT_OF_SALE">Points de vente</option>
                <option value="OTHER">Autres sites</option>
              </select>

              {/* Visibility Filter */}
              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer"
              >
                <option value="ALL">Toutes visibilités</option>
                <option value="PUBLIC">Visible SAV public</option>
                <option value="PRIVATE">Usage interne uniquement</option>
              </select>

              <button
                onClick={fetchEstablishments}
                title="Actualiser"
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 transition-colors shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEstablishments.map((est) => {
              const typeCfg = TYPE_CONFIG[est.type] || TYPE_CONFIG.OTHER;
              const TypeIcon = typeCfg.icon;

              return (
                <div
                  key={est.id}
                  className={`p-6 rounded-3xl bg-white border shadow-sm transition-all relative flex flex-col justify-between gap-5 group hover:shadow-md ${
                    est.isMain ? 'border-indigo-200 bg-gradient-to-b from-indigo-50/10 to-white' : 'border-slate-200/90'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Photo Banner if available */}
                    {est.imageUrl && (
                      <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-100 group/img border border-slate-100 shadow-inner">
                        <img
                          src={est.imageUrl}
                          alt={est.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 flex-wrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md bg-white/90 shadow-sm border ${typeCfg.badgeClass}`}
                          >
                            <TypeIcon className="w-3 h-3 inline mr-1" />
                            {typeCfg.label}
                          </span>
                          {est.isMain && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white backdrop-blur-md shadow-sm flex items-center gap-1">
                              <Star className="w-3 h-3 fill-white text-white" />
                              Siège Principal
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Top status badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {!est.imageUrl && (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${typeCfg.badgeClass}`}
                          >
                            <TypeIcon className="w-3 h-3" />
                            <span>{typeCfg.label}</span>
                          </span>
                        )}

                        {!est.imageUrl && est.isMain && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>Siège Principal</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {est.isPublic ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              title="Cet établissement est visible par vos clients sur votre page publique SAV"
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center gap-1 shadow-2xs"
                            >
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Visible sur la page SAV</span>
                            </span>
                            {canManage && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickTogglePublic(est);
                                }}
                                className="px-2 py-0.5 rounded-full text-[9px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Passer en usage interne (masquer aux clients)"
                              >
                                Masquer
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span
                              title="Établissement à usage interne (masqué aux clients)"
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center gap-1 shadow-2xs"
                            >
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span>Masqué aux clients</span>
                            </span>
                            {canManage && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickTogglePublic(est);
                                }}
                                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                                title="Rendre cet établissement visible aux clients sur la page SAV"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Publier sur la page SAV</span>
                              </button>
                            )}
                          </div>
                        )}

                        {!est.isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Fermé / Inactif
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Establishment Name & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-950 transition-colors">
                        {est.name}
                      </h3>
                      {est.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {est.description}
                        </p>
                      )}
                    </div>

                    {/* Address details */}
                    <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                      <div className="flex items-start gap-2 text-xs text-slate-700">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">{est.address}</p>
                          <p className="text-[11px] text-slate-500">
                            {[est.addressDetails, est.city, est.country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contact chips */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {est.phone && (
                        <a
                          href={`tel:${est.phone}`}
                          className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200 flex items-center gap-1.5 transition-colors"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{est.phone}</span>
                        </a>
                      )}
                      {est.whatsapp && (
                        <a
                          href={`https://wa.me/${est.whatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium border border-emerald-200 flex items-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {est.email && (
                        <a
                          href={`mailto:${est.email}`}
                          className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] border border-slate-200 flex items-center gap-1.5 transition-colors"
                        >
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{est.email}</span>
                        </a>
                      )}
                    </div>

                    {/* Opening Hours */}
                    {est.openingHours && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium text-[11px]">{est.openingHours}</span>
                      </div>
                    )}

                    {/* Services on site */}
                    {est.services && est.services.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Services disponibles sur place
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {est.services.map((srv, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium"
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Practical info / Access notes */}
                    {est.practicalInfo && (
                      <div className="flex items-start gap-1.5 text-[11px] text-slate-500 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                        <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{est.practicalInfo}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions for Manager / Admin */}
                  {canManage && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                      <span className="text-[10px] text-slate-400">
                        Modifié le {new Date(est.updatedAt).toLocaleDateString('fr-FR')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(est)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modifier</span>
                        </button>

                        {canDelete && (
                          <button
                            onClick={() => {
                              setEstablishmentToDelete(est);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Supprimer cet établissement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredEstablishments.length === 0 && (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 text-slate-500 text-xs space-y-2">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">Aucun établissement ne correspond aux filtres.</p>
              <p className="text-[11px]">Essayez de modifier votre mot-clé ou le filtre de type.</p>
            </div>
          )}
        </>
      )}

      {/* MODAL: CREATE / EDIT ESTABLISHMENT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isEditing ? 'Modifier l’établissement' : 'Ajouter un établissement'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Renseignez les détails pratiques de votre implantation physique.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEstablishment} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Identité & Type */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  1. Identification de l’implantation
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Type d’établissement *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value as EstablishmentType })
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    >
                      <option value="HEADQUARTERS">Siège social</option>
                      <option value="STORE">Boutique commerciale</option>
                      <option value="BRANCH">Agence locale</option>
                      <option value="SERVICE_POINT">Comptoir SAV & Dépose</option>
                      <option value="PICKUP_POINT">Point relais & Retrait</option>
                      <option value="TECH_CENTER">Centre technique & Atelier</option>
                      <option value="POINT_OF_SALE">Point de vente</option>
                      <option value="OTHER">Autre implantation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nom de l’établissement *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Boutique Centre-Ville, Agence Bacongo..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description ou rôle (facultatif)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Showroom et dépose rapide des appareils en panne"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                {/* Visibilité & Publication (Apple / Antigravity Segmented Cards) */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      Visibilité client & Publication SAV *
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Choisissez où cet établissement apparaît
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option 1 : Public SAV (Recommandé) */}
                    <div
                      onClick={() => setFormData({ ...formData, isPublic: true })}
                      className={`relative p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer active:scale-[0.98] flex flex-col justify-between ${
                        formData.isPublic
                          ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-500/10'
                          : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            formData.isPublic ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                          }`}>
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block leading-tight">
                              Visible sur la page SAV
                            </span>
                            <span className="text-[9.5px] font-semibold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                              Recommandé pour recevoir les clients
                            </span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          formData.isPublic ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                        }`}>
                          {formData.isPublic && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                        L’agence sera affichée sur votre page publique avec ses photos, ses horaires et ses contacts directs.
                      </p>
                    </div>

                    {/* Option 2 : Interne uniquement */}
                    <div
                      onClick={() => setFormData({ ...formData, isPublic: false })}
                      className={`relative p-3.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer active:scale-[0.98] flex flex-col justify-between ${
                        !formData.isPublic
                          ? 'bg-amber-50/70 border-amber-500 shadow-sm ring-2 ring-amber-500/10'
                          : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            !formData.isPublic ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                          }`}>
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 block leading-tight">
                              Usage interne uniquement
                            </span>
                            <span className="text-[9.5px] font-semibold text-amber-900 bg-amber-100/90 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                              Masqué aux clients
                            </span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          !formData.isPublic ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                        }`}>
                          {!formData.isPublic && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                        Réservé à votre équipe (entrepôt, atelier privé, siège administratif non ouvert au public).
                      </p>
                    </div>
                  </div>

                  {/* Warning if internal is chosen */}
                  {!formData.isPublic && (
                    <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Attention :</strong> Cet établissement ne sera <strong>pas affiché</strong> sur votre page publique SAV.
                      </span>
                    </div>
                  )}
                </div>

                {/* Statuts complémentaires (Siège & Actif) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 cursor-pointer hover:bg-slate-100/80 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isMain}
                      onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block flex items-center gap-1">
                        <span>★</span> Siège principal
                      </span>
                      <span className="text-[10px] text-slate-500">Adresse officielle n°1 de l'entreprise</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 cursor-pointer hover:bg-slate-100/80 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900 block">Établissement actif</span>
                      <span className="text-[10px] text-slate-500">Ouvert et opérationnel</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Visuel & Photo de l’établissement */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-sky-600" />
                    <span>2. Photo & Façade de l’établissement</span>
                  </h3>
                  {formData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Supprimer la photo</span>
                    </button>
                  )}
                </div>

                {formData.imageUrl ? (
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-200 group bg-slate-100">
                    <img
                      src={formData.imageUrl}
                      alt="Aperçu devanture"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label className="px-3.5 py-2 rounded-xl bg-white text-slate-800 text-xs font-semibold cursor-pointer shadow-md hover:bg-slate-50 transition-colors flex items-center gap-1.5 active:scale-95">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Changer la photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold cursor-pointer shadow-md hover:bg-rose-700 transition-colors flex items-center gap-1.5 active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Retirer</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-slate-50/50 hover:bg-sky-50/20 group">
                      <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-700">
                          Cliquez pour choisir une photo ou glissez-déposez ici
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          PNG, JPG ou WebP (max 4 Mo). Devanture, vitrine, enseigne ou guichet d’accueil.
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 shrink-0">Ou collez une URL :</span>
                      <input
                        type="url"
                        placeholder="https://domaine.com/photo-boutique.jpg"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Localisation */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  3. Localisation géographique
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Adresse complète *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 45 Avenue Amilcar Cabral, en face de l’Hôtel de Ville"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Brazzaville, Pointe-Noire, Abidjan..."
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pays
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Complément d’adresse / Repères (facultatif)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 1er étage droite, Bâtiment B, Porte 12"
                      value={formData.addressDetails}
                      onChange={(e) => setFormData({ ...formData, addressDetails: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Coordonnées */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  4. Coordonnées directes de l’établissement
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Téléphone direct
                    </label>
                    <input
                      type="tel"
                      placeholder="+242 06 000 00 00"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp direct
                    </label>
                    <input
                      type="tel"
                      placeholder="+242 06 111 22 33"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email direct
                    </label>
                    <input
                      type="email"
                      placeholder="agence.centre@entreprise.cg"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Horaires & Services */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  5. Horaires & Services sur place
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Horaires d’ouverture
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Lun - Ven : 08h00 - 18h00 | Sam : 09h00 - 13h00"
                    value={formData.openingHours}
                    onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Services proposés aux clients sur place
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {COMMON_SERVICES.map((srv) => {
                      const isSelected = formData.services.includes(srv);
                      return (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => handleToggleService(srv)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-50 text-sky-800 border-sky-300 font-semibold'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}
                          {srv}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ajouter un autre service spécifique..."
                      value={customServiceInput}
                      onChange={(e) => setCustomServiceInput(e.target.value)}
                      onKeyDown={handleAddCustomService}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomService}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Consignes pratiques / Accès client
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Parking gratuit pour les clients. Accès PMR disponible."
                    value={formData.practicalInfo}
                    onChange={(e) => setFormData({ ...formData, practicalInfo: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none"
                  />
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isEditing ? 'Enregistrer les modifications' : 'Créer l’établissement'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {isDeleteModalOpen && establishmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                Supprimer « {establishmentToDelete.name} » ?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cet établissement sera définitivement retiré de votre annuaire et de votre fiche
                publique SAV.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Garantie d’intégrité Zadesk :</p>
              <p className="leading-relaxed">
                Aucun ticket, dossier client ou compte conseiller ne sera modifié ni supprimé.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setEstablishmentToDelete(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-2"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirmer la suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
