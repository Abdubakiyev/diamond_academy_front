// src/features/types/advertisement.ts
export interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdvertisementDto {
  title: string;
  description: string;
  isActive?: boolean;
  file: File; // ✅ File majburiy
}

export interface UpdateAdvertisementDto {
  title?: string;
  description?: string;
  isActive?: boolean;
  file?: File; // ✅ File ixtiyoriy
}