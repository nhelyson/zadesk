import { Establishment } from "./workspace";

export interface PublicCompany {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  verified: boolean;
  isPublic: boolean;
  website: string | null;
  supportPhone: string | null;
  supportEmail: string | null;
  supportWhatsApp: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  openingHours: string | null;
  supportCategories: string[] | null;
  brandColor?: string | null;
  brandPalette?: any | null;
  businessHours?: any | null;
  establishments?: Establishment[];
  createdAt: string;
}

export interface PublicCategory {
  name: string;
  count: number;
}

export interface PublicCompanyListResponse {
  companies: PublicCompany[];
  total: number;
  limit: number;
  offset: number;
}
