// src/features/api/advertisement.ts
import axios from 'axios';
import { Advertisement, CreateAdvertisementDto, UpdateAdvertisementDto } from '../types/advertisement';

const BASE_URL = 'https://diamond-academy-back.onrender.com/advertisements';

const getToken = (): string => {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('No access token found');
  return token;
};

// Get all advertisements (admin only)
export const getAdvertisements = async (): Promise<Advertisement[]> => {
  const token = getToken();
  const { data } = await axios.get(BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Get active advertisement (public)
export const getActiveAdvertisement = async (): Promise<Advertisement | null> => {
  const { data } = await axios.get(`${BASE_URL}/active`);
  return data;
};

// Get single advertisement
export const getAdvertisement = async (id: string): Promise<Advertisement> => {
  const token = getToken();
  const { data } = await axios.get(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Create advertisement with file upload
export const createAdvertisement = async (dto: CreateAdvertisementDto & { file: File }): Promise<Advertisement> => {
  const token = getToken();
  
  const formData = new FormData();
  formData.append('title', dto.title);
  formData.append('description', dto.description);
  formData.append('isActive', dto.isActive ? 'true' : 'false');
  formData.append('file', dto.file);

  const { data } = await axios.post(BASE_URL, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// Update advertisement with optional file upload
export const updateAdvertisement = async (
  id: string,
  dto: UpdateAdvertisementDto & { file?: File }
): Promise<Advertisement> => {
  const token = getToken();

  const formData = new FormData();
  if (dto.title) formData.append('title', dto.title);
  if (dto.description) formData.append('description', dto.description);
  if (dto.isActive !== undefined) formData.append('isActive', dto.isActive ? 'true' : 'false');
  if (dto.file) formData.append('file', dto.file);

  const { data } = await axios.patch(`${BASE_URL}/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// Delete advertisement
export const deleteAdvertisement = async (id: string): Promise<void> => {
  const token = getToken();
  await axios.delete(`${BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};