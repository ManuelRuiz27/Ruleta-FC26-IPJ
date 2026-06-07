import type { Region } from '../types';

export const initialRegions: Region[] = [
  { id: 'reg-1', name: 'Altiplano Norte', sort_order: 1, created_at: new Date().toISOString() },
  { id: 'reg-2', name: 'Altiplano Sur', sort_order: 2, created_at: new Date().toISOString() },
  { id: 'reg-3', name: 'Centro', sort_order: 3, created_at: new Date().toISOString() },
  { id: 'reg-4', name: 'Huasteca Centro', sort_order: 4, created_at: new Date().toISOString() },
  { id: 'reg-5', name: 'Huasteca Norte', sort_order: 5, created_at: new Date().toISOString() },
  { id: 'reg-6', name: 'Huasteca Sur', sort_order: 6, created_at: new Date().toISOString() },
  { id: 'reg-7', name: 'Zona Media', sort_order: 7, created_at: new Date().toISOString() },
];
