import { type FormEvent, type ReactNode, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTournamentStore } from '../store';
import {
  canAccessMunicipality,
  canAccessRegion,
  canAccessState,
  getAccessSession,
  setAccessSessionFromPin
} from '../lib/accessSession';

type AccessGateProps = {
  scope: 'state' | 'regional' | 'municipal';
  children: ReactNode;
};

const getScopeLabel = (scope: AccessGateProps['scope']) => {
  if (scope === 'state') return 'Comite estatal';
  if (scope === 'regional') return 'Operacion regional';
  return 'Operacion municipal';
};

export default function AccessGate({ scope, children }: AccessGateProps) {
  const { id, regionId } = useParams<{ id?: string; regionId?: string }>();
  const [profile, setProfile] = useState(() => getAccessSession());
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getMunicipalityById = useTournamentStore(state => state.getMunicipalityById);
  const municipality = id ? getMunicipalityById(id) : undefined;

  const allowed = scope === 'state'
    ? canAccessState(profile)
    : scope === 'regional'
      ? canAccessRegion(profile, regionId)
      : canAccessMunicipality(profile, municipality);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextProfile = setAccessSessionFromPin(pin);
    if (!nextProfile) {
      setError('PIN invalido.');
      return;
    }
    setProfile(nextProfile);
    setPin('');
    setError(null);
  };

  if (allowed) return <>{children}</>;

  return (
    <div className="max-w-md mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
      <h2 className="text-2xl font-heading font-bold mb-2">Acceso controlado</h2>
      <p className="text-[var(--color-muted)] text-sm mb-6">
        Ingresa el PIN asignado para {getScopeLabel(scope)}.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={pin}
          onChange={event => {
            setPin(event.target.value);
            setError(null);
          }}
          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[2px] p-3 text-[var(--color-text)] uppercase"
          placeholder="PIN"
          autoFocus
        />
        {profile && !allowed && (
          <p className="text-orange-400 text-sm">
            La sesion actual ({profile.display_name}) no tiene permiso para esta ruta.
          </p>
        )}
        {error && <p className="text-[var(--color-danger)] text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-[var(--color-primary)] text-[var(--color-primary-content)] px-4 py-2 rounded-[2px] font-bold"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
