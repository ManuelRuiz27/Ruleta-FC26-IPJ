import { getDefaultMunicipalEvent, getMunicipalEventById } from '../data/municipalEvents';

export const resolveMunicipalEventId = (municipalityId: string | undefined, eventId: string | undefined) => {
  if (eventId && getMunicipalEventById(eventId)) return eventId;
  return municipalityId ? getDefaultMunicipalEvent(municipalityId)?.id : undefined;
};

export const municipalRoute = (municipalityId: string, eventId: string | null | undefined, section?: string) => {
  const suffix = section ? `/${section}` : '';
  return eventId
    ? `/municipal/${municipalityId}/evento/${eventId}${suffix}`
    : `/municipal/${municipalityId}${suffix}`;
};
