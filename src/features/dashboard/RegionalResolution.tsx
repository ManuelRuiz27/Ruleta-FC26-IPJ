import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../../store';
import { initialRegions } from '../../data/regions';

type RegionalDuplicateOccurrence = ReturnType<ReturnType<typeof useTournamentStore.getState>['getDuplicateTeamsByRegion']>[number]['occurrences'][number];

const getErrorMessage = (err: unknown) => err instanceof Error ? err.message : 'Error al reasignar selección';

export default function RegionalResolution() {
  const { regionId } = useParams();
  const navigate = useNavigate();

  const getDuplicateTeamsByRegion = useTournamentStore(state => state.getDuplicateTeamsByRegion);
  const getAvailableTeamsForRegion = useTournamentStore(state => state.getAvailableTeamsForRegion);
  const resolveDuplicateTeam = useTournamentStore(state => state.resolveDuplicateTeam);
  
  // Suscripción reactiva para que el componente se actualice cuando se resuelva un conflicto
  useTournamentStore(state => state.qualifiedPlayers);

  // Local state to keep track of randomly selected keepers for same-rank conflicts
  const [keepers, setKeepers] = useState<Record<string, string>>({}); // team_id -> qualified_player_id

  if (!regionId) return null;

  const region = initialRegions.find(r => r.id === regionId);
  if (!region) return null;

  const duplicates = getDuplicateTeamsByRegion(region.id);
  const availableTeams = getAvailableTeamsForRegion(region.id);

  const handleDrawKeeper = (teamId: string, candidates: RegionalDuplicateOccurrence[]) => {
    // eslint-disable-next-line react-hooks/purity
    const randomIdx = Math.floor(Math.random() * candidates.length);
    const selectedKeeper = candidates[randomIdx].qualified_player_id;
    setKeepers(prev => ({ ...prev, [teamId]: selectedKeeper }));
  };

  const getKeeperCandidates = (occurrences: RegionalDuplicateOccurrence[]) => {
    const champions = occurrences.filter(o => o.rank === 'champion');
    if (champions.length > 0) return champions;
    return occurrences;
  };

  const handleResolveAffected = (affectedPlayerId: string, keptByPlayerId: string | null) => {
    if (availableTeams.length === 0) {
      alert("No hay equipos disponibles en esta región para reasignar.");
      return;
    }
    // eslint-disable-next-line react-hooks/purity
    const randomTeamIdx = Math.floor(Math.random() * availableTeams.length);
    const newTeam = availableTeams[randomTeamIdx];

    try {
      resolveDuplicateTeam({
        qualifiedPlayerId: affectedPlayerId,
        newTeamId: newTeam.id,
        keptByQualifiedPlayerId: keptByPlayerId,
        reason: "Resolución de duplicados por sistema"
      });
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
            <span>Resolución de Duplicados</span>
          </h2>
          <p className="text-[var(--color-muted)] mt-1">Región: {region.name}</p>
        </div>
        <button 
          onClick={() => navigate(`/regional/${region.id}`)}
          className="px-4 py-2 border border-[var(--color-border)] rounded text-sm hover:bg-[var(--color-surface)] transition-colors"
        >
          &larr; Volver al Dashboard
        </button>
      </div>

      {duplicates.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-bold mb-2">No hay duplicados pendientes</h3>
          <p className="text-[var(--color-muted)] mb-6">Todas las selecciones de la región son únicas.</p>
          <button 
            onClick={() => navigate(`/regional/${region.id}`)}
            className="px-6 py-2 bg-[var(--color-primary)] hover:bg-opacity-80 rounded font-bold transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {duplicates.map(dup => {
            const keeperCandidates = getKeeperCandidates(dup.occurrences);
            
            let keeperId: string | null = null;
            if (keeperCandidates.length === 1) {
              keeperId = keeperCandidates[0].qualified_player_id;
            } else {
              keeperId = keepers[dup.team_id] || null;
            }

            return (
              <div key={dup.team_id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
                <div className="flex items-center justify-between mb-6 border-b border-[var(--color-border)] pb-4">
                  <div>
                    <h3 className="text-xl font-heading font-bold text-red-400">Selección en conflicto: {dup.team_name}</h3>
                    <p className="text-sm text-[var(--color-muted)] mt-1">{dup.occurrences.length} ocurrencias detectadas</p>
                    {!keeperId && keeperCandidates.length > 1 && (
                      <p className="text-sm text-orange-400 mt-2 font-bold">Hay varios clasificados con la misma prioridad. Sortea quién conserva la selección.</p>
                    )}
                  </div>
                  {!keeperId && keeperCandidates.length > 1 && (
                    <button 
                      onClick={() => handleDrawKeeper(dup.team_id, keeperCandidates)}
                      className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white rounded text-sm transition-colors font-bold"
                    >
                      Sortear quién conserva
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dup.occurrences.map((occ) => {
                    const isKeeper = keeperId === occ.qualified_player_id;
                    const isAffected = keeperId !== null && !isKeeper;
                    
                    return (
                      <div key={occ.qualified_player_id} className={`p-4 rounded-lg border ${isKeeper ? 'border-green-500/30 bg-green-500/5' : isAffected ? 'border-orange-500/30 bg-orange-500/5' : 'border-[var(--color-border)] bg-black/20'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-bold">{occ.participant_name}</div>
                            <div className="text-sm text-[var(--color-muted)]">{occ.municipality_name}</div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${occ.rank === 'champion' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-300'}`}>
                            {occ.rank === 'champion' ? 'Campeón' : 'Subcampeón'}
                          </span>
                        </div>

                        {isKeeper && (
                          <div className="text-green-400 text-sm font-bold flex items-center gap-2">
                            <span>🛡️ Conserva selección</span>
                            {keeperCandidates.length === 1 && <span className="text-xs opacity-75 font-normal">(Conserva por prioridad competitiva)</span>}
                          </div>
                        )}

                        {isAffected && (
                          <div className="mt-4">
                            <p className="text-orange-400 text-sm font-bold mb-3">⚠️ Requiere nueva selección</p>
                            <button 
                              onClick={() => handleResolveAffected(occ.qualified_player_id, keeperId)}
                              className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-bold transition-colors"
                            >
                              Sortear nueva selección
                            </button>
                          </div>
                        )}

                        {!keeperId && (
                          <div className="text-[var(--color-muted)] text-sm italic">
                            Esperando resolución...
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
