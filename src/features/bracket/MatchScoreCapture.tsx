import { useParams, useNavigate } from 'react-router-dom';

export default function MatchScoreCapture() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="px-3 py-1 text-sm border border-[var(--color-border)] rounded-[2px] hover:bg-[var(--color-surface)] transition-colors">
          &larr; Volver
        </button>
        <h2 className="text-2xl font-heading font-bold">Captura de Marcador</h2>
      </div>
      
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 max-w-2xl">
        <p className="text-[var(--color-muted)] text-sm mb-6">Partido ID: {matchId}</p>
        
        <div className="grid grid-cols-3 gap-4 items-center mb-8">
          <div className="text-right">
            <div className="font-bold">Jugador A</div>
            <div className="text-sm text-[var(--color-muted)]">Selección A</div>
          </div>
          <div className="flex justify-center gap-2">
            <input type="number" className="w-16 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[2px] p-2 text-center text-xl" defaultValue={0} />
            <span className="text-xl font-bold py-2">-</span>
            <input type="number" className="w-16 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[2px] p-2 text-center text-xl" defaultValue={0} />
          </div>
          <div className="text-left">
            <div className="font-bold">Jugador B</div>
            <div className="text-sm text-[var(--color-muted)]">Selección B</div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-[2px] font-medium hover:bg-opacity-90 transition-opacity">
            Guardar Resultado
          </button>
        </div>
      </div>
    </div>
  );
}
