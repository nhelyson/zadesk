'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import {
  Building2,
  Plus,
  MapPin,
  Clock,
  Phone,
  Mail,
  Search,
  Trash2,
  Edit3,
  Star,
  CheckCircle2,
  AlertCircle,
  X,
  Store,
  Compass,
  MessageCircle,
  RefreshCw,
  Camera,
  Upload,
  Globe,
  Lock,
  ChevronLeft,
  ChevronRight,
  LayoutList,
  GalleryHorizontalEnd,
  Check,
} from 'lucide-react';
import { useWorkspace, notifyWorkspaceDataUpdated } from '@/components/workspace/WorkspaceContext';
import { workspaceApi } from '@/lib/api';
import { Establishment, EstablishmentType } from '@/types/workspace';

const TYPE_CONFIG: Record<
  EstablishmentType,
  { label: string; icon: React.FC<{ className?: string }> }
> = {
  HEADQUARTERS: { label: 'Siège social', icon: Building2 },
  BRANCH: { label: 'Agence', icon: Building2 },
  STORE: { label: 'Boutique', icon: Store },
  POINT_OF_SALE: { label: 'Point de vente', icon: Store },
  SERVICE_POINT: { label: 'Comptoir SAV', icon: Compass },
  PICKUP_POINT: { label: 'Point relais', icon: MapPin },
  TECH_CENTER: { label: 'Centre technique', icon: Building2 },
  OTHER: { label: 'Autre site', icon: Building2 },
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

type ViewMode = 'carousel' | 'list';
type ModalTab = 'identity' | 'location' | 'media';

export default function EstablishmentsPage() {
  const { currentWorkspace, userRole, workspaceUsage } = useWorkspace();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('carousel');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showAllServices, setShowAllServices] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Touch swipe & GSAP motion refs
  const touchStartXRef = useRef<number | null>(null);
  const railItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const slideDirectionRef = useRef<1 | -1>(1);
  const hasPlayedEntranceRef = useRef(false);
  const previousActiveEstIdRef = useRef<string | null>(null);
  const carouselScopeRef = useRef<HTMLDivElement | null>(null);
  const visualStageRef = useRef<HTMLDivElement | null>(null);
  const detailsStageRef = useRef<HTMLDivElement | null>(null);
  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const modalPanelRef = useRef<HTMLDivElement | null>(null);
  const modalTabContentRef = useRef<HTMLDivElement | null>(null);

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<ModalTab>('identity');
  const [modalError, setModalError] = useState<string | null>(null);
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

  const filteredEstablishments = useMemo(() => {
    return establishments.filter((est) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = est.name.toLowerCase().includes(q);
        const matchesCity = est.city.toLowerCase().includes(q);
        const matchesAddress = est.address.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesAddress) return false;
      }
      if (typeFilter !== 'ALL' && est.type !== typeFilter) return false;
      if (visibilityFilter === 'PUBLIC' && !est.isPublic) return false;
      if (visibilityFilter === 'PRIVATE' && est.isPublic) return false;
      return true;
    });
  }, [establishments, searchQuery, typeFilter, visibilityFilter]);

  // Synchronize active carousel slide with filtered results
  const activeIndex = useMemo(() => {
    if (filteredEstablishments.length === 0) return 0;
    if (activeId) {
      const idx = filteredEstablishments.findIndex((e) => e.id === activeId);
      if (idx !== -1) return idx;
    }
    return 0;
  }, [filteredEstablishments, activeId]);

  const activeEst = filteredEstablishments[activeIndex] || null;

  useEffect(() => {
    if (activeEst && activeEst.id !== activeId) {
      setActiveId(activeEst.id);
    } else if (!activeEst && activeId !== null) {
      setActiveId(null);
    }
  }, [activeEst, activeId]);

  // Reset per-slide transient state when switching active establishment
  useEffect(() => {
    setPhotoIndex(0);
    setShowAllServices(false);
    if (activeEst?.id && railItemRefs.current[activeEst.id]) {
      railItemRefs.current[activeEst.id]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'nearest',
      });
    }
  }, [activeEst?.id]);

  const goToSlide = useCallback(
    (index: number) => {
      if (filteredEstablishments.length === 0) return;
      slideDirectionRef.current = index >= activeIndex ? 1 : -1;
      const wrapped =
        (index + filteredEstablishments.length) % filteredEstablishments.length;
      setActiveId(filteredEstablishments[wrapped].id);
    },
    [filteredEstablishments, activeIndex]
  );

  const selectEstablishment = useCallback(
    (targetId: string) => {
      const targetIdx = filteredEstablishments.findIndex((e) => e.id === targetId);
      if (targetIdx !== -1 && targetIdx !== activeIndex) {
        slideDirectionRef.current = targetIdx > activeIndex ? 1 : -1;
      }
      setActiveId(targetId);
    },
    [filteredEstablishments, activeIndex]
  );

  // GSAP: Entrance choreography when carousel view mounts
  useEffect(() => {
    if (isLoading || viewMode !== 'carousel' || !activeEst || hasPlayedEntranceRef.current) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hasPlayedEntranceRef.current = true;
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-showcase-enter',
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.48,
          stagger: 0.06,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
        }
      );
    }, carouselScopeRef);

    hasPlayedEntranceRef.current = true;
    previousActiveEstIdRef.current = activeEst.id;
    return () => ctx.revert();
  }, [isLoading, viewMode, activeEst]);

  // GSAP: Directional slide choreography when changing active establishment
  useEffect(() => {
    if (!activeEst || viewMode !== 'carousel') return;
    if (previousActiveEstIdRef.current === null) {
      previousActiveEstIdRef.current = activeEst.id;
      return;
    }
    if (previousActiveEstIdRef.current === activeEst.id) return;
    previousActiveEstIdRef.current = activeEst.id;

    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dir = slideDirectionRef.current;
    const ctx = gsap.context(() => {
      if (visualStageRef.current) {
        gsap.fromTo(
          visualStageRef.current,
          { x: dir * 28, opacity: 0.15, scale: 0.98 },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.46,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
          }
        );
      }

      if (detailsStageRef.current) {
        const items = detailsStageRef.current.querySelectorAll('.gsap-detail-item');
        if (items.length > 0) {
          gsap.fromTo(
            items,
            { x: dir * 22, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.42,
              stagger: 0.035,
              delay: 0.04,
              ease: 'power3.out',
              clearProps: 'transform,opacity',
            }
          );
        }
      }
    }, carouselScopeRef);

    return () => ctx.revert();
  }, [activeEst, viewMode]);

  // GSAP: Smooth crossfade + subtle settle when cycling establishment gallery photos
  useEffect(() => {
    if (!photoImgRef.current || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tween = gsap.fromTo(
      photoImgRef.current,
      { opacity: 0.45, scale: 1.035 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.48,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      }
    );
    return () => {
      tween.kill();
    };
  }, [photoIndex, activeEst?.id]);

  // GSAP: Modal open & tab transition
  useEffect(() => {
    if (!isModalOpen || !modalPanelRef.current || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tween = gsap.fromTo(
      modalPanelRef.current,
      { y: 14, scale: 0.985, opacity: 0 },
      {
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.28,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      }
    );
    return () => {
      tween.kill();
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen || !modalTabContentRef.current || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const tween = gsap.fromTo(
      modalTabContentRef.current,
      { x: 10, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.22,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
      }
    );
    return () => {
      tween.kill();
    };
  }, [modalTab, isModalOpen]);

  // Keyboard navigation in carousel mode + Escape to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isDeleteModalOpen) {
          setIsDeleteModalOpen(false);
          setEstablishmentToDelete(null);
          return;
        }
        if (isModalOpen) {
          setIsModalOpen(false);
          return;
        }
      }
      if (viewMode !== 'carousel' || isModalOpen || isDeleteModalOpen) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToSlide(activeIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToSlide(activeIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, isModalOpen, isDeleteModalOpen, activeIndex, goToSlide]);

  const activePhotos = useMemo(() => {
    if (!activeEst) return [];
    const list = [activeEst.imageUrl, ...(activeEst.galleryImages || [])].filter(
      (u): u is string => Boolean(u && u.trim())
    );
    return Array.from(new Set(list));
  }, [activeEst]);

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setModalTab('identity');
    setModalError(null);
    setFormData({
      ...DEFAULT_FORM,
      city: currentWorkspace?.city || 'Brazzaville',
      country: currentWorkspace?.country || 'Congo',
      isMain: establishments.length === 0,
      imageUrl: '',
      galleryImages: [],
    });
    setCustomServiceInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (est: Establishment, initialTab: ModalTab = 'identity') => {
    setIsEditing(true);
    setEditingId(est.id);
    setModalTab(initialTab);
    setModalError(null);
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
      setFeedback({ type: 'error', text: 'Veuillez sélectionner une image valide (JPG, PNG, WebP).' });
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

  const handleGalleryImageAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 8 * 1024 * 1024) {
      setFeedback({ type: 'error', text: 'Image invalide ou supérieure à 8 Mo.' });
      return;
    }
    try {
      const compressed = await compressImageFile(file, 1200, 0.82);
      if (compressed) {
        setFormData((prev) => ({
          ...prev,
          galleryImages: [...prev.galleryImages.slice(0, 4), compressed],
        }));
      }
    } catch {}
    e.target.value = '';
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
    setModalError(null);

    if (!formData.name.trim()) {
      setModalTab('identity');
      setModalError('Veuillez renseigner le nom de l’établissement.');
      return;
    }
    if (!formData.address.trim() || !formData.city.trim()) {
      setModalTab('location');
      setModalError('Veuillez renseigner l’adresse et la ville.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing && editingId) {
        const updated = await workspaceApi.updateEstablishment(
          currentWorkspace.id,
          editingId,
          formData
        );
        if (updated?.id) setActiveId(updated.id);
        setFeedback({
          type: 'success',
          text: `Établissement « ${formData.name} » mis à jour.`,
        });
      } else {
        const created = await workspaceApi.createEstablishment(currentWorkspace.id, formData);
        if (created?.id) setActiveId(created.id);
        setFeedback({
          type: 'success',
          text: `Établissement « ${formData.name} » ajouté à votre annuaire.`,
        });
      }
      setIsModalOpen(false);
      await fetchEstablishments();
      notifyWorkspaceDataUpdated();
    } catch (err: any) {
      setModalError(err.message || 'Erreur lors de l’enregistrement de l’établissement.');
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
        text: `Établissement « ${establishmentToDelete.name} » supprimé.`,
      });
      setIsDeleteModalOpen(false);
      setEstablishmentToDelete(null);
      await fetchEstablishments();
      notifyWorkspaceDataUpdated();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Impossible de supprimer cet établissement.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleQuickTogglePublic = async (est: Establishment, targetPublic: boolean) => {
    if (!currentWorkspace?.id || est.isPublic === targetPublic) return;

    setEstablishments((prev) =>
      prev.map((item) => (item.id === est.id ? { ...item, isPublic: targetPublic } : item))
    );

    try {
      await workspaceApi.updateEstablishment(currentWorkspace.id, est.id, {
        isPublic: targetPublic,
      });
      setFeedback({
        type: 'success',
        text: targetPublic
          ? `« ${est.name} » est désormais visible sur votre page SAV.`
          : `« ${est.name} » est passé en usage interne uniquement.`,
      });
    } catch (err: any) {
      setEstablishments((prev) =>
        prev.map((item) => (item.id === est.id ? { ...item, isPublic: !targetPublic } : item))
      );
      setFeedback({
        type: 'error',
        text: err.message || 'Impossible de modifier la visibilité de cet établissement.',
      });
    }
  };

  const publicCount = establishments.filter((e) => e.isPublic).length;
  const internalCount = establishments.length - publicCount;

  const hasActiveFilters =
    Boolean(searchQuery.trim()) || typeFilter !== 'ALL' || visibilityFilter !== 'ALL';
  const estQuota = workspaceUsage?.metrics?.establishments;
  const isEstQuotaReached = estQuota?.status === 'REACHED';

  return (
    <div className="space-y-6 pb-12">
      {isEstQuotaReached && canManage && (
        <div className="px-4 py-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Quota d&apos;établissements atteint</strong> ({estQuota?.used}/{estQuota?.limit}{' '}
              sur la formule {workspaceUsage?.plan?.name}).
              {['OWNER', 'ADMIN'].includes(userRole)
                ? ' Passez à une formule supérieure pour ajouter d’autres agences.'
                : ' Contactez un administrateur pour étendre la limite.'}
            </span>
          </div>
          {['OWNER', 'ADMIN'].includes(userRole) && (
            <Link
              href="/app/billing"
              className="px-3 h-7 rounded-full bg-amber-900 hover:bg-amber-950 text-white text-[11px] font-semibold inline-flex items-center shrink-0"
            >
              Voir les offres
            </Link>
          )}
        </div>
      )}
      {/* Feedback banner */}
      {feedback && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-white border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Synthèse & actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>
            <strong className="text-[#0D1B3D] tabular-nums">{establishments.length}</strong>{' '}
            implantation{establishments.length > 1 ? 's' : ''}
          </span>
          {establishments.length > 0 && (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <strong className="text-[#0D1B3D] tabular-nums">{publicCount}</strong> visible
                {publicCount > 1 ? 's' : ''} page SAV
              </span>
              <span>·</span>
              <span>
                <strong className="text-[#0D1B3D] tabular-nums">{internalCount}</strong> interne
                {internalCount > 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {establishments.length > 0 && (
            <div className="flex items-center gap-0.5 bg-[#F4F3EF] p-1 rounded-full border border-[#E5E4DF] text-xs">
              <button
                type="button"
                onClick={() => setViewMode('carousel')}
                className={`px-3 h-7 rounded-full flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  viewMode === 'carousel'
                    ? 'bg-white text-[#0D1B3D] font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-[#0D1B3D]'
                }`}
              >
                <GalleryHorizontalEnd className="w-3.5 h-3.5" />
                <span>Carrousel</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 h-7 rounded-full flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  viewMode === 'list'
                    ? 'bg-white text-[#0D1B3D] font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-[#0D1B3D]'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span>Liste</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={fetchEstablishments}
            disabled={isLoading}
            title="Actualiser"
            className="w-9 h-9 rounded-full bg-white hover:bg-[#F4F3EF] text-slate-600 border border-[#E5E4DF] transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0D1B3D]' : ''}`} />
          </button>

          {canManage && (
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 h-9 rounded-full bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un établissement</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty state: 0 establishments */}
      {!isLoading && establishments.length === 0 && (
        <div className="p-8 sm:p-10 rounded-xl bg-white border border-[#E5E4DF] text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#F4F3EF] border border-[#E5E4DF] flex items-center justify-center mx-auto text-[#0D1B3D]">
            <Building2 className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-base font-bold text-[#0D1B3D]">
              Votre entreprise fonctionne exclusivement en ligne ?
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Zalisk fonctionne parfaitement sans point d’accueil physique. Vous pourrez ajouter une
              agence, un comptoir SAV ou un point relais ici dès que nécessaire.
            </p>
          </div>

          {canManage && (
            <div>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un premier établissement (facultatif)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search & Filters + Showcase */}
      {(isLoading || establishments.length > 0) && (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 border-b border-[#E5E4DF] pb-3.5">
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher nom, ville, adresse…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3.5 rounded-full bg-white border border-[#E5E4DF] text-xs text-[#0D1B3D] placeholder:text-slate-400 focus:outline-none focus:border-[#0D1B3D] transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-9 px-3.5 rounded-full bg-white border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D] cursor-pointer"
              >
                <option value="ALL">Tous les types ({establishments.length})</option>
                <option value="HEADQUARTERS">Sièges sociaux</option>
                <option value="BRANCH">Agences</option>
                <option value="STORE">Boutiques</option>
                <option value="SERVICE_POINT">Comptoirs SAV</option>
                <option value="PICKUP_POINT">Points relais</option>
                <option value="TECH_CENTER">Centres techniques</option>
                <option value="POINT_OF_SALE">Points de vente</option>
                <option value="OTHER">Autres sites</option>
              </select>

              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="h-9 px-3.5 rounded-full bg-white border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D] cursor-pointer"
              >
                <option value="ALL">Toutes visibilités</option>
                <option value="PUBLIC">Visible page SAV</option>
                <option value="PRIVATE">Usage interne uniquement</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('ALL');
                    setVisibilityFilter('ALL');
                  }}
                  className="h-9 px-3 rounded-full text-xs text-slate-600 hover:text-[#0D1B3D] hover:bg-[#F4F3EF] transition-colors cursor-pointer"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {isLoading && establishments.length === 0 ? (
            <div className="p-10 rounded-xl bg-white border border-[#E5E4DF] text-center text-xs text-slate-500">
              Chargement des établissements…
            </div>
          ) : filteredEstablishments.length === 0 ? (
            <div className="p-10 rounded-xl bg-white border border-[#E5E4DF] text-center space-y-3">
              <p className="text-xs font-semibold text-[#0D1B3D]">
                Aucun établissement ne correspond aux filtres sélectionnés.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('ALL');
                  setVisibilityFilter('ALL');
                }}
                className="px-3 h-8 rounded-lg border border-[#E5E4DF] bg-[#FAFAF8] hover:bg-[#F4F3EF] text-xs font-medium text-[#0D1B3D] cursor-pointer"
              >
                Effacer les filtres
              </button>
            </div>
          ) : viewMode === 'carousel' && activeEst ? (
            <div ref={carouselScopeRef} className="space-y-4">
              {/* CAROUSEL SHOWCASE STAGE */}
              <div className="gsap-showcase-enter relative">
                <div
                  onTouchStart={(e) => {
                    touchStartXRef.current = e.touches[0]?.clientX ?? null;
                  }}
                  onTouchEnd={(e) => {
                    if (touchStartXRef.current === null) return;
                    const endX = e.changedTouches[0]?.clientX ?? touchStartXRef.current;
                    const diff = touchStartXRef.current - endX;
                    touchStartXRef.current = null;
                    if (Math.abs(diff) > 45 && filteredEstablishments.length > 1) {
                      goToSlide(diff > 0 ? activeIndex + 1 : activeIndex - 1);
                    }
                  }}
                  className="rounded-[26px] bg-white border border-[#E5E4DF]/90 shadow-[0_14px_38px_rgba(13,27,61,0.04)] overflow-hidden"
                >
                  {/* Stage Top Navigation Bar */}
                  <div className="px-6 py-3.5 bg-[#FAFAF8]/80 border-b border-[#E5E4DF]/70 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E5E4DF] font-semibold text-[#0D1B3D] tabular-nums">
                        {String(activeIndex + 1).padStart(2, '0')} /{' '}
                        {String(filteredEstablishments.length).padStart(2, '0')}
                      </span>
                      <span className="text-slate-600 font-medium pl-1">
                        {(TYPE_CONFIG[activeEst.type] || TYPE_CONFIG.OTHER).label}
                      </span>
                      {activeEst.isMain && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center gap-1 font-medium text-[#0D1B3D]">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            Siège principal
                          </span>
                        </>
                      )}
                      {!activeEst.isActive && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[11px] font-medium">
                            Fermé / Inactif
                          </span>
                        </>
                      )}
                    </div>

                    {filteredEstablishments.length > 1 && (
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1 mr-1">
                          {filteredEstablishments.map((est, idx) => (
                            <button
                              key={est.id}
                              type="button"
                              onClick={() => selectEstablishment(est.id)}
                              aria-label={`Aller à ${est.name}`}
                              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                idx === activeIndex
                                  ? 'w-5 bg-[#0D1B3D]'
                                  : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                              }`}
                            />
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => goToSlide(activeIndex - 1)}
                          aria-label="Établissement précédent"
                          title="Précédent (←)"
                          className="w-8 h-8 rounded-full bg-white hover:bg-[#F4F3EF] border border-[#E5E4DF] text-[#0D1B3D] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => goToSlide(activeIndex + 1)}
                          aria-label="Établissement suivant"
                          title="Suivant (→)"
                          className="w-8 h-8 rounded-full bg-white hover:bg-[#F4F3EF] border border-[#E5E4DF] text-[#0D1B3D] flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Split Showcase Body (fluid without harsh vertical divider) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                    {/* Left: Floating Rounded Photo Stage */}
                    <div className="lg:col-span-5 p-4 sm:p-5 flex">
                      <div
                        ref={visualStageRef}
                        className="relative w-full min-h-[250px] lg:min-h-[340px] rounded-2xl overflow-hidden bg-[#F4F3EF] border border-[#E5E4DF]/80 shadow-[0_12px_30px_rgba(13,27,61,0.06)] flex flex-col justify-between"
                      >
                        {activePhotos.length > 0 ? (
                          <>
                            <img
                              ref={photoImgRef}
                              key={activePhotos[photoIndex] || activeEst.id}
                              src={activePhotos[photoIndex] || activePhotos[0]}
                              alt={activeEst.name}
                              className="w-full h-64 lg:h-full lg:max-h-[400px] object-cover"
                            />
                            {activePhotos.length > 1 && (
                              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md">
                                  {activePhotos.map((_, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => setPhotoIndex(idx)}
                                      aria-label={`Photo ${idx + 1}`}
                                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                        idx === photoIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPhotoIndex(
                                        (p) => (p - 1 + activePhotos.length) % activePhotos.length
                                      )
                                    }
                                    className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/75 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPhotoIndex((p) => (p + 1) % activePhotos.length)
                                    }
                                    className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/75 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3 bg-gradient-to-b from-[#FAFAF8] to-[#F4F3EF]">
                            {(() => {
                              const TypeIcon =
                                (TYPE_CONFIG[activeEst.type] || TYPE_CONFIG.OTHER).icon;
                              return (
                                <div className="w-14 h-14 rounded-full bg-white border border-[#E5E4DF] shadow-2xs flex items-center justify-center text-[#0D1B3D]">
                                  <TypeIcon className="w-5 h-5" />
                                </div>
                              );
                            })()}
                            <div className="space-y-1">
                              <p className="text-xs font-semibold text-[#0D1B3D]">
                                Aucune photo de façade
                              </p>
                              <p className="text-[11px] text-slate-500 max-w-[220px]">
                                Ajoutez une photo pour aider vos clients à identifier ce site sur place.
                              </p>
                            </div>
                            {canManage && (
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(activeEst, 'media')}
                                className="px-3.5 h-8 rounded-full bg-white hover:bg-[#FAFAF8] border border-[#E5E4DF] text-xs font-medium text-[#0D1B3D] inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                <span>Ajouter une photo</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Airy Typographic Details */}
                    <div
                      ref={detailsStageRef}
                      className="lg:col-span-7 px-5 pb-6 pt-1 lg:py-6 lg:pr-7 lg:pl-2 flex flex-col justify-between gap-5"
                    >
                      <div className="space-y-5">
                        {/* Title + Public/Internal Pill Switch */}
                        <div className="gsap-detail-item flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="text-lg font-bold text-[#0D1B3D] tracking-tight">
                              {activeEst.name}
                            </h2>
                            {activeEst.description && (
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {activeEst.description}
                              </p>
                            )}
                          </div>

                          {canManage ? (
                            <div
                              className="inline-flex items-center p-1 rounded-full bg-[#F4F3EF] border border-[#E5E4DF] shrink-0 text-[11px]"
                              role="group"
                              aria-label="Visibilité sur la page SAV"
                            >
                              <button
                                type="button"
                                onClick={() => handleQuickTogglePublic(activeEst, true)}
                                className={`px-3 h-7 rounded-full flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                                  activeEst.isPublic
                                    ? 'bg-white text-[#0D1B3D] font-semibold shadow-xs'
                                    : 'text-slate-500 hover:text-[#0D1B3D]'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    activeEst.isPublic ? 'bg-[#22C55E]' : 'bg-slate-300'
                                  }`}
                                />
                                <span>Public SAV</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickTogglePublic(activeEst, false)}
                                className={`px-3 h-7 rounded-full flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                                  !activeEst.isPublic
                                    ? 'bg-white text-[#0D1B3D] font-semibold shadow-xs'
                                    : 'text-slate-500 hover:text-[#0D1B3D]'
                                }`}
                              >
                                <Lock className="w-3 h-3" />
                                <span>Interne</span>
                              </button>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 h-7 rounded-full bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-slate-600 shrink-0">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  activeEst.isPublic ? 'bg-[#22C55E]' : 'bg-slate-300'
                                }`}
                              />
                              {activeEst.isPublic ? 'Visible page SAV' : 'Usage interne'}
                            </span>
                          )}
                        </div>

                        {/* Open, unboxed Location & Hours rows */}
                        <div className="gsap-detail-item grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#F4F3EF] flex items-center justify-center text-[#0D1B3D] shrink-0">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-medium text-slate-400">Localisation</p>
                              <p className="font-semibold text-[#0D1B3D] mt-0.5 leading-snug">
                                {activeEst.address}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {[activeEst.addressDetails, activeEst.city, activeEst.country]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#F4F3EF] flex items-center justify-center text-[#0D1B3D] shrink-0">
                              <Clock className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-medium text-slate-400">
                                Horaires d’ouverture
                              </p>
                              <p className="font-medium text-[#0D1B3D] mt-0.5 leading-relaxed">
                                {activeEst.openingHours || 'Horaires non renseignés'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Direct Contacts Pills */}
                        {(activeEst.phone || activeEst.whatsapp || activeEst.email) && (
                          <div className="gsap-detail-item flex flex-wrap items-center gap-2 text-xs">
                            {activeEst.phone && (
                              <a
                                href={`tel:${activeEst.phone}`}
                                className="h-8 px-3.5 rounded-full bg-[#FAFAF8] hover:bg-[#F4F3EF] border border-[#E5E4DF] text-[#0D1B3D] inline-flex items-center gap-1.5 font-mono text-[11px] transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                <span>{activeEst.phone}</span>
                              </a>
                            )}
                            {activeEst.whatsapp && (
                              <a
                                href={`https://wa.me/${activeEst.whatsapp.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 px-3.5 rounded-full bg-[#FAFAF8] hover:bg-[#F4F3EF] border border-[#E5E4DF] text-[#0D1B3D] inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-slate-500" />
                                <span>WhatsApp : {activeEst.whatsapp}</span>
                              </a>
                            )}
                            {activeEst.email && (
                              <a
                                href={`mailto:${activeEst.email}`}
                                className="h-8 px-3.5 rounded-full bg-[#FAFAF8] hover:bg-[#F4F3EF] border border-[#E5E4DF] text-[#0D1B3D] inline-flex items-center gap-1.5 text-[11px] transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>{activeEst.email}</span>
                              </a>
                            )}
                          </div>
                        )}

                        {/* Soft Services Pills */}
                        {activeEst.services && activeEst.services.length > 0 && (
                          <div className="gsap-detail-item space-y-2">
                            <p className="text-[11px] font-medium text-slate-400">
                              Services sur place
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5">
                              {(showAllServices
                                ? activeEst.services
                                : activeEst.services.slice(0, 4)
                              ).map((srv, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 rounded-full bg-[#F4F3EF] text-slate-700 text-[11px] font-medium"
                                >
                                  {srv}
                                </span>
                              ))}
                              {!showAllServices && activeEst.services.length > 4 && (
                                <button
                                  type="button"
                                  onClick={() => setShowAllServices(true)}
                                  className="px-2.5 py-1 rounded-full text-[11px] font-medium text-[#0D1B3D] hover:bg-[#F4F3EF] transition-colors cursor-pointer"
                                >
                                  +{activeEst.services.length - 4} autres
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Practical note */}
                        {activeEst.practicalInfo && (
                          <p className="gsap-detail-item text-[11px] text-slate-600 border-l-2 border-[#0D1B3D]/20 pl-3 py-0.5 leading-relaxed">
                            {activeEst.practicalInfo}
                          </p>
                        )}
                      </div>

                      {/* Footer actions */}
                      <div className="gsap-detail-item pt-4 border-t border-[#E5E4DF]/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] text-slate-400">
                          Mis à jour le {new Date(activeEst.updatedAt).toLocaleDateString('fr-FR')}
                        </span>

                        {canManage && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(activeEst)}
                              className="h-8 px-3.5 rounded-full bg-white hover:bg-[#F4F3EF] border border-[#E5E4DF] text-[#0D1B3D] text-xs font-semibold inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Modifier</span>
                            </button>

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEstablishmentToDelete(activeEst);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="h-8 w-8 rounded-full text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-all active:scale-95 cursor-pointer inline-flex items-center justify-center"
                                title="Supprimer cet établissement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtle layered card-stack peek below active showcase */}
                {filteredEstablishments.length > 1 && (
                  <div
                    aria-hidden="true"
                    className="h-2 mx-6 rounded-b-2xl bg-[#F4F3EF]/90 border-x border-b border-[#E5E4DF]/80"
                  />
                )}
              </div>

              {/* SYNCHRONIZED FLOATING RAIL */}
              {filteredEstablishments.length > 1 && (
                <div className="gsap-showcase-enter space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>Accès rapide ({filteredEstablishments.length})</span>
                    <span className="hidden sm:inline">Utilisez ← → pour naviguer</span>
                  </div>

                  <div className="flex items-stretch gap-3 overflow-x-auto py-1 px-0.5 snap-x">
                    {filteredEstablishments.map((est) => {
                      const isSelected = est.id === activeEst.id;
                      const typeLabel = (TYPE_CONFIG[est.type] || TYPE_CONFIG.OTHER).label;
                      const TypeIcon = (TYPE_CONFIG[est.type] || TYPE_CONFIG.OTHER).icon;

                      return (
                        <button
                          key={est.id}
                          ref={(el) => {
                            railItemRefs.current[est.id] = el;
                          }}
                          type="button"
                          onClick={() => selectEstablishment(est.id)}
                          className={`min-w-[215px] max-w-[245px] snap-start p-2.5 pr-3.5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center gap-3 shrink-0 ${
                            isSelected
                              ? 'bg-white border-[#0D1B3D] -translate-y-0.5 shadow-[0_10px_22px_rgba(13,27,61,0.08)]'
                              : 'bg-[#FAFAF8] border-[#E5E4DF] hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#F4F3EF] border border-[#E5E4DF] shrink-0 flex items-center justify-center text-slate-500">
                            {est.imageUrl ? (
                              <img
                                src={est.imageUrl}
                                alt={est.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <TypeIcon className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  est.isPublic && est.isActive ? 'bg-[#22C55E]' : 'bg-slate-300'
                                }`}
                              />
                              <p className="text-xs font-semibold text-[#0D1B3D] truncate">
                                {est.name}
                              </p>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                              {est.city} · {typeLabel}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* COMPACT LIST VIEW */
            <div className="rounded-2xl bg-white border border-[#E5E4DF] divide-y divide-[#E5E4DF] overflow-hidden">
              {filteredEstablishments.map((est) => {
                const typeCfg = TYPE_CONFIG[est.type] || TYPE_CONFIG.OTHER;
                const TypeIcon = typeCfg.icon;

                return (
                  <div
                    key={est.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAFAF8] transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F4F3EF] border border-[#E5E4DF] shrink-0 flex items-center justify-center text-slate-500">
                        {est.imageUrl ? (
                          <img
                            src={est.imageUrl}
                            alt={est.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <TypeIcon className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-[#0D1B3D] truncate">
                            {est.name}
                          </h3>
                          {est.isMain && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#0D1B3D] font-medium">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              Siège
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">· {typeCfg.label}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {est.address}, {est.city}
                          {est.phone ? ` · ${est.phone}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 px-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            est.isPublic ? 'bg-[#22C55E]' : 'bg-slate-300'
                          }`}
                        />
                        {est.isPublic ? 'Public SAV' : 'Interne'}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          selectEstablishment(est.id);
                          setViewMode('carousel');
                        }}
                        className="h-8 px-3 rounded-full bg-[#FAFAF8] hover:bg-[#F4F3EF] border border-[#E5E4DF] text-xs font-medium text-[#0D1B3D] cursor-pointer transition-all active:scale-95"
                      >
                        Vitrine
                      </button>

                      {canManage && (
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(est)}
                          className="h-8 px-3 rounded-full bg-white hover:bg-[#F4F3EF] border border-[#E5E4DF] text-xs font-medium text-[#0D1B3D] inline-flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modifier</span>
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            setEstablishmentToDelete(est);
                            setIsDeleteModalOpen(true);
                          }}
                          className="h-8 w-8 rounded-full text-slate-400 hover:text-rose-700 hover:bg-rose-50 inline-flex items-center justify-center cursor-pointer transition-all active:scale-95"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* MODAL: CREATE / EDIT ESTABLISHMENT (3-TAB CLEAN LAYOUT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div
            ref={modalPanelRef}
            className="w-full max-w-2xl bg-white rounded-[22px] shadow-2xl border border-[#E5E4DF] overflow-hidden my-8"
          >
            <div className="px-6 py-4 border-b border-[#E5E4DF] bg-[#FAFAF8] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#0D1B3D]">
                  {isEditing ? 'Modifier l’établissement' : 'Ajouter un établissement'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configurez l’identité, la visibilité et les coordonnées pratiques.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-[#F4F3EF] rounded-full text-slate-400 hover:text-[#0D1B3D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Step Tabs */}
            <div className="px-6 pt-3 border-b border-[#E5E4DF] flex items-center gap-5 text-xs">
              {(
                [
                  { id: 'identity', label: '1. Identité & Visibilité' },
                  { id: 'location', label: '2. Adresse & Contacts' },
                  { id: 'media', label: '3. Photo, Horaires & Services' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setModalTab(t.id)}
                  className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
                    modalTab === t.id
                      ? 'border-[#0D1B3D] text-[#0D1B3D] font-semibold'
                      : 'border-transparent text-slate-500 hover:text-[#0D1B3D] font-medium'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSaveEstablishment}>
              <div ref={modalTabContentRef} className="p-6 space-y-5 max-h-[62vh] overflow-y-auto">
                {modalError && (
                  <div className="px-3.5 py-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}
                {modalTab === 'identity' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#0D1B3D] mb-1.5">
                          Type d’établissement *
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) =>
                            setFormData({ ...formData, type: e.target.value as EstablishmentType })
                          }
                          className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                        >
                          <option value="HEADQUARTERS">Siège social</option>
                          <option value="BRANCH">Agence locale</option>
                          <option value="STORE">Boutique commerciale</option>
                          <option value="SERVICE_POINT">Comptoir SAV & Dépose</option>
                          <option value="PICKUP_POINT">Point relais & Retrait</option>
                          <option value="TECH_CENTER">Centre technique & Atelier</option>
                          <option value="POINT_OF_SALE">Point de vente</option>
                          <option value="OTHER">Autre implantation</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#0D1B3D] mb-1.5">
                          Nom de l’établissement *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex : Agence Centre-Ville"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#0D1B3D] mb-1.5">
                        Description courte (facultatif)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex : Accueil clients, dépôt et reprise matériel"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                      />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#E5E4DF]">
                      <label className="block text-xs font-semibold text-[#0D1B3D]">
                        Visibilité sur la page publique SAV
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isPublic: true })}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            formData.isPublic
                              ? 'bg-white border-[#0D1B3D] ring-1 ring-[#0D1B3D]'
                              : 'bg-[#FAFAF8] border-[#E5E4DF] hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D1B3D]">
                              <Globe className="w-3.5 h-3.5" />
                              Visible sur la page SAV
                            </span>
                            {formData.isPublic && <Check className="w-3.5 h-3.5 text-[#0D1B3D]" />}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Affiché aux clients avec adresse, horaires et contacts directs.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isPublic: false })}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            !formData.isPublic
                              ? 'bg-white border-[#0D1B3D] ring-1 ring-[#0D1B3D]'
                              : 'bg-[#FAFAF8] border-[#E5E4DF] hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D1B3D]">
                              <Lock className="w-3.5 h-3.5" />
                              Usage interne uniquement
                            </span>
                            {!formData.isPublic && <Check className="w-3.5 h-3.5 text-[#0D1B3D]" />}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Masqué aux clients (atelier privé, entrepôt ou siège administratif).
                          </p>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E4DF] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isMain}
                          onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                          className="w-4 h-4 rounded accent-[#0D1B3D]"
                        />
                        <div className="text-xs">
                          <span className="font-semibold text-[#0D1B3D] block">Siège principal</span>
                          <span className="text-[11px] text-slate-500">
                            Implantation n°1 de l’entreprise
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAF8] border border-[#E5E4DF] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4 rounded accent-[#0D1B3D]"
                        />
                        <div className="text-xs">
                          <span className="font-semibold text-[#0D1B3D] block">
                            Établissement actif
                          </span>
                          <span className="text-[11px] text-slate-500">Ouvert et opérationnel</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {modalTab === 'location' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-[#0D1B3D] mb-1.5">
                        Adresse complète *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex : 45 Avenue Amilcar Cabral"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#0D1B3D] mb-1.5">
                          Ville *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Brazzaville, Pointe-Noire…"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#0D1B3D] mb-1.5">
                          Pays
                        </label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#0D1B3D] mb-1.5">
                        Complément d’adresse / repères (facultatif)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex : 1er étage, en face de l’Hôtel de Ville"
                        value={formData.addressDetails}
                        onChange={(e) =>
                          setFormData({ ...formData, addressDetails: e.target.value })
                        }
                        className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E5E4DF]">
                      <div>
                        <label className="block text-xs font-medium text-[#0D1B3D] mb-1.5">
                          Téléphone direct
                        </label>
                        <input
                          type="tel"
                          placeholder="+242 06 000 00 00"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#0D1B3D] mb-1.5">
                          WhatsApp
                        </label>
                        <input
                          type="tel"
                          placeholder="+242 06 111 22 33"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-[#0D1B3D] mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="agence@entreprise.cg"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {modalTab === 'media' && (
                  <div className="space-y-5">
                    {/* Main facade image */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#0D1B3D]">
                          Photo principale / Façade
                        </label>
                        {formData.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
                            className="text-[11px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                          >
                            Supprimer la photo
                          </button>
                        )}
                      </div>

                      {formData.imageUrl ? (
                        <div className="relative h-44 w-full rounded-xl overflow-hidden border border-[#E5E4DF] group bg-[#F4F3EF]">
                          <img
                            src={formData.imageUrl}
                            alt="Aperçu façade"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="px-3 h-8 rounded-lg bg-white text-[#0D1B3D] text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Remplacer</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="border border-dashed border-[#D5D3CC] hover:border-[#0D1B3D] rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors bg-[#FAFAF8]">
                            <Upload className="w-5 h-5 text-slate-500" />
                            <p className="text-xs font-medium text-[#0D1B3D]">
                              Choisir une image (JPG, PNG, WebP)
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Compression automatique (max 8 Mo)
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                          </label>
                          <input
                            type="url"
                            placeholder="Ou coller une URL d’image (https://...)"
                            value={formData.imageUrl}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
                            }
                            className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                          />
                        </div>
                      )}

                      {/* Optional multi-photo gallery */}
                      <div className="pt-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-500">
                            Galerie complémentaire ({formData.galleryImages.length}/5)
                          </span>
                          {formData.galleryImages.length < 5 && (
                            <label className="text-[11px] font-semibold text-[#0D1B3D] hover:underline cursor-pointer">
                              + Ajouter une vue
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleGalleryImageAdd}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                        {formData.galleryImages.length > 0 && (
                          <div className="flex items-center gap-2 overflow-x-auto pb-1">
                            {formData.galleryImages.map((imgSrc, idx) => (
                              <div
                                key={idx}
                                className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#E5E4DF] shrink-0"
                              >
                                <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      galleryImages: prev.galleryImages.filter((_, i) => i !== idx),
                                    }))
                                  }
                                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center cursor-pointer"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hours */}
                    <div>
                      <label className="block text-xs font-medium text-[#0D1B3D] mb-1.5">
                        Horaires d’ouverture
                      </label>
                      <input
                        type="text"
                        placeholder="Ex : Lun - Ven : 08h00 - 18h00 | Sam : 09h00 - 13h00"
                        value={formData.openingHours}
                        onChange={(e) =>
                          setFormData({ ...formData, openingHours: e.target.value })
                        }
                        className="w-full h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                      />
                    </div>

                    {/* Services */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#0D1B3D]">
                        Services disponibles sur place
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {COMMON_SERVICES.map((srv) => {
                          const isSelected = formData.services.includes(srv);
                          return (
                            <button
                              key={srv}
                              type="button"
                              onClick={() => handleToggleService(srv)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0D1B3D] text-white border-[#0D1B3D] font-medium'
                                  : 'bg-[#FAFAF8] text-slate-600 border-[#E5E4DF] hover:border-slate-300'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {srv}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Ajouter un service spécifique…"
                          value={customServiceInput}
                          onChange={(e) => setCustomServiceInput(e.target.value)}
                          onKeyDown={handleAddCustomService}
                          className="flex-1 h-9 px-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D]"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomService}
                          className="px-3 h-9 rounded-lg bg-[#F4F3EF] hover:bg-[#E5E4DF] text-[#0D1B3D] text-xs font-medium cursor-pointer"
                        >
                          Ajouter
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#0D1B3D] mb-1.5">
                        Consignes pratiques d’accès (facultatif)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex : Parking gratuit pour les clients. Accès PMR disponible."
                        value={formData.practicalInfo}
                        onChange={(e) =>
                          setFormData({ ...formData, practicalInfo: e.target.value })
                        }
                        className="w-full p-3 rounded-lg bg-[#FAFAF8] border border-[#E5E4DF] text-xs text-[#0D1B3D] focus:outline-none focus:border-[#0D1B3D] resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-[#E5E4DF] bg-[#FAFAF8] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {modalTab !== 'identity' && (
                    <button
                      type="button"
                      onClick={() =>
                        setModalTab(modalTab === 'media' ? 'location' : 'identity')
                      }
                      className="px-3 h-9 rounded-lg border border-[#E5E4DF] bg-white hover:bg-[#F4F3EF] text-xs font-medium text-[#0D1B3D] cursor-pointer"
                    >
                      Précédent
                    </button>
                  )}
                  {modalTab !== 'media' && (
                    <button
                      type="button"
                      onClick={() =>
                        setModalTab(modalTab === 'identity' ? 'location' : 'media')
                      }
                      className="px-3 h-9 rounded-lg border border-[#E5E4DF] bg-white hover:bg-[#F4F3EF] text-xs font-medium text-[#0D1B3D] cursor-pointer"
                    >
                      Suivant
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="px-4 h-9 rounded-lg border border-[#E5E4DF] bg-white hover:bg-[#F4F3EF] text-slate-600 text-xs font-medium cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 h-9 rounded-lg bg-[#0D1B3D] hover:bg-[#152C61] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isEditing ? 'Enregistrer' : 'Créer l’établissement'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRMATION */}
      {isDeleteModalOpen && establishmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-[#E5E4DF] p-6 space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-[#0D1B3D]">
                Supprimer « {establishmentToDelete.name} » ?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cet établissement sera retiré de votre annuaire et de votre page publique SAV. Aucun
                ticket, dossier client ou conseiller ne sera affecté.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E4DF]">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setEstablishmentToDelete(null);
                }}
                disabled={isDeleting}
                className="px-4 h-9 rounded-lg border border-[#E5E4DF] bg-white hover:bg-[#F4F3EF] text-slate-700 text-xs font-medium cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 h-9 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
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
