import type { AccessProfile } from '../types';
import { initialMunicipalities } from './municipalities';
import { initialRegions } from './regions';

export const accessProfiles: AccessProfile[] = [
  {
    id: 'access-state',
    role: 'state_committee',
    display_name: 'Comite estatal',
    pin: 'ESTADO-2026',
    municipality_id: null,
    region_id: null
  },
  ...initialRegions.map(region => ({
    id: `access-${region.id}`,
    role: 'regional_operator' as const,
    display_name: `Operador regional - ${region.name}`,
    pin: region.id.replace('reg-', 'REG-'),
    municipality_id: null,
    region_id: region.id
  })),
  ...initialMunicipalities.map(municipality => ({
    id: `access-${municipality.id}`,
    role: 'municipal_operator' as const,
    display_name: `Operador municipal - ${municipality.name}`,
    pin: municipality.id.replace('mun-', 'MUN-'),
    municipality_id: municipality.id,
    region_id: municipality.region_id
  }))
];

export const findAccessProfileByPin = (pin: string) => {
  const normalized = pin.trim().toUpperCase();
  return accessProfiles.find(profile => profile.pin.toUpperCase() === normalized);
};
