import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../../store';

export default function ParticipantsRegistry() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  
  const validateParticipantNames = useTournamentStore(state => state.validateParticipantNames);
  const createMunicipalSession = useTournamentStore(state => state.createMunicipalSession);
  const setParticipantsFromNames = useTournamentStore(state => state.setParticipantsFromNames);
  const getMunicipalityById = useTournamentStore(state => state.getMunicipalityById);

  const municipality = id ? getMunicipalityById(id) : undefined;

  const names = useMemo(() => {
    return text.split('\n').map(n => n.trim()).filter(n => n !== '');
  }, [text]);

  const handleValidate = () => {
    const { valid, errors: validationErrors } = validateParticipantNames(names);
    setErrors(validationErrors);
    
    if (valid && municipality && id) {
      const session = createMunicipalSession(id, municipality.region_id);
      setParticipantsFromNames(names, session.id);
      navigate(`/municipal/${id}/ruleta`);
    }
  };

  if (!municipality) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-danger)] rounded-xl p-6">
        <h2 className="text-xl font-heading font-bold text-[var(--color-danger)] mb-2">Error</h2>
        <p className="text-[var(--color-muted)]">El municipio seleccionado no existe.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-heading font-bold mb-4">Registro de Participantes</h2>
      <p className="text-[var(--color-muted)] mb-6">Municipio: <span className="font-bold text-[var(--color-text)]">{municipality.name}</span></p>
      
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex justify-between items-end mb-4">
          <p className="text-[var(--color-muted)] text-sm">Pega los nombres de los jugadores (uno por línea).</p>
          <div className="text-sm font-mono font-bold text-[var(--color-primary)] bg-[#142e1d] px-3 py-1 rounded-[6px]">
            {names.length} / 32 participantes
          </div>
        </div>
        
        <textarea 
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setErrors([]);
          }}
          className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[2px] p-3 text-[var(--color-text)] mb-4 focus:outline-none focus:border-[var(--color-primary)] transition-colors" 
          rows={10} 
          placeholder="Ejemplo:&#10;Juan Pérez&#10;Luis Torres&#10;Ana García"
        ></textarea>
        
        {errors.length > 0 && (
          <div className="mb-4 p-4 bg-[rgba(240,68,56,0.1)] border border-[var(--color-danger)] rounded-[2px]">
            <ul className="list-disc pl-5 text-[var(--color-danger)] text-sm">
              {errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          </div>
        )}

        <button 
          onClick={handleValidate}
          className="bg-[var(--color-primary)] text-[var(--color-primary-content)] px-6 py-2 rounded-[2px] font-medium hover:bg-opacity-90 transition-opacity"
        >
          Validar y Continuar
        </button>
      </div>
    </div>
  );
}
