import type { MunicipalEvent } from '../types';
import { initialMunicipalities } from './municipalities';

const sanLuisCapitalId = 'mun-25';

export const initialMunicipalEvents: MunicipalEvent[] = initialMunicipalities.flatMap((municipality) => {
  if (municipality.id !== sanLuisCapitalId) {
    return [{
      id: `${municipality.id}-day-1`,
      municipality_id: municipality.id,
      label: 'Jornada unica',
      event_date: municipality.municipal_date,
      sort_order: 1,
      is_active: true
    }];
  }

  return [
    {
      id: `${municipality.id}-day-1`,
      municipality_id: municipality.id,
      label: 'Dia 1',
      event_date: municipality.municipal_date,
      sort_order: 1,
      is_active: true
    },
    {
      id: `${municipality.id}-day-2`,
      municipality_id: municipality.id,
      label: 'Dia 2',
      event_date: municipality.municipal_date,
      sort_order: 2,
      is_active: true
    }
  ];
});

export const getMunicipalEventsByMunicipality = (municipalityId: string) =>
  initialMunicipalEvents.filter(event => event.municipality_id === municipalityId && event.is_active);

export const getDefaultMunicipalEvent = (municipalityId: string) =>
  getMunicipalEventsByMunicipality(municipalityId)[0];

export const getMunicipalEventById = (eventId: string | null | undefined) =>
  eventId ? initialMunicipalEvents.find(event => event.id === eventId) : undefined;
