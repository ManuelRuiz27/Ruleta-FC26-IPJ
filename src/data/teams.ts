import type { Team } from '../types';

const countryNames = [
  'Argentina', 'Brasil', 'Francia', 'Alemania', 'España', 'Portugal', 'Inglaterra', 'Italia',
  'Holanda', 'Bélgica', 'Uruguay', 'Colombia', 'Croacia', 'Marruecos', 'México', 'Estados Unidos',
  'Japón', 'Senegal', 'Suiza', 'Dinamarca', 'Ecuador', 'Corea del Sur', 'Australia', 'Gales',
  'Polonia', 'Serbia', 'Canadá', 'Camerún', 'Ghana', 'Arabia Saudita', 'Costa Rica', 'Túnez'
];

export const initialTeams: Team[] = countryNames.map((name, index) => ({
  id: `team-${index + 1}`,
  name,
  flag_code: name.substring(0, 3).toUpperCase(),
  flag_asset_url: null,
  sort_order: index + 1,
  is_active: true,
  created_at: new Date().toISOString()
}));
