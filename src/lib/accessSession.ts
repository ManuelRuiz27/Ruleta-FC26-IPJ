import type { AccessProfile, Municipality } from '../types';
import { findAccessProfileByPin } from '../data/access';

const ACCESS_SESSION_KEY = 'mundial-fc26-access-session';

export const getAccessSession = (): AccessProfile | null => {
  try {
    const raw = localStorage.getItem(ACCESS_SESSION_KEY);
    return raw ? JSON.parse(raw) as AccessProfile : null;
  } catch {
    return null;
  }
};

export const setAccessSessionFromPin = (pin: string) => {
  const profile = findAccessProfileByPin(pin);
  if (!profile) return null;
  localStorage.setItem(ACCESS_SESSION_KEY, JSON.stringify(profile));
  return profile;
};

export const clearAccessSession = () => {
  localStorage.removeItem(ACCESS_SESSION_KEY);
};

export const canAccessState = (profile: AccessProfile | null) =>
  profile?.role === 'state_committee';

export const canAccessRegion = (profile: AccessProfile | null, regionId: string | null | undefined) => {
  if (!profile || !regionId) return false;
  if (profile.role === 'state_committee') return true;
  return profile.role === 'regional_operator' && profile.region_id === regionId;
};

export const canAccessMunicipality = (profile: AccessProfile | null, municipality: Municipality | null | undefined) => {
  if (!profile || !municipality) return false;
  if (profile.role === 'state_committee') return true;
  if (profile.role === 'regional_operator') return profile.region_id === municipality.region_id;
  return profile.role === 'municipal_operator' && profile.municipality_id === municipality.id;
};
