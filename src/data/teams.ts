import type { Team } from '../types';

const countryData: { name: string, code: string }[] = [
  { name: 'Argentina', code: 'ar' }, { name: 'Brasil', code: 'br' }, { name: 'Francia', code: 'fr' }, { name: 'Alemania', code: 'de' },
  { name: 'España', code: 'es' }, { name: 'Portugal', code: 'pt' }, { name: 'Inglaterra', code: 'gb-eng' }, { name: 'Italia', code: 'it' },
  { name: 'Holanda', code: 'nl' }, { name: 'Bélgica', code: 'be' }, { name: 'Uruguay', code: 'uy' }, { name: 'Colombia', code: 'co' },
  { name: 'Croacia', code: 'hr' }, { name: 'Marruecos', code: 'ma' }, { name: 'México', code: 'mx' }, { name: 'Estados Unidos', code: 'us' },
  { name: 'Japón', code: 'jp' }, { name: 'Senegal', code: 'sn' }, { name: 'Suiza', code: 'ch' }, { name: 'Dinamarca', code: 'dk' },
  { name: 'Ecuador', code: 'ec' }, { name: 'Corea del Sur', code: 'kr' }, { name: 'Australia', code: 'au' }, { name: 'Gales', code: 'gb-wls' },
  { name: 'Polonia', code: 'pl' }, { name: 'Serbia', code: 'rs' }, { name: 'Canadá', code: 'ca' }, { name: 'Camerún', code: 'cm' },
  { name: 'Ghana', code: 'gh' }, { name: 'Arabia Saudita', code: 'sa' }, { name: 'Costa Rica', code: 'cr' }, { name: 'Túnez', code: 'tn' }
];

export const initialTeams: Team[] = countryData.map((data, index) => ({
  id: `team-${index + 1}`,
  name: data.name,
  flag_code: data.code.toUpperCase(),
  flag_asset_url: `https://flagcdn.com/w320/${data.code}.png`,
  sort_order: index + 1,
  is_active: true,
  created_at: new Date().toISOString()
}));
