import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../../store';
import { initialRegions } from '../../data/regions';
import { initialMunicipalities } from '../../data/municipalities';
import { initialMunicipalEvents } from '../../data/municipalEvents';
import ExportPanel from '../exports/ExportPanel';
import { exportToCSV, exportToJSON } from '../../lib/utils/exportUtils';
import { seedAllMunicipalities } from '../../lib/utils/seed';

const getErrorMessage = (err: unknown) => err instanceof Error ? err.message : 'Ocurrió un error inesperado.';

export default function EstatalDashboard() {
  const navigate = useNavigate();
  const allCompleted = useTournamentStore(state => state.getAllCompletedMunicipalResults());
  const getDuplicateTeamsByRegion = useTournamentStore(state => state.getDuplicateTeamsByRegion);
  const getStateReadiness = useTournamentStore(state => state.getStateReadiness);
  const createStateQualifiedPlayers = useTournamentStore(state => state.createStateQualifiedPlayers);

  // For exports
  const completedMunicipalResults = useTournamentStore(state => state.completedMunicipalResults);
  const completedRegionalResults = useTournamentStore(state => state.completedRegionalResults);
  const completedStateResults = useTournamentStore(state => state.completedStateResults);
  const qualifiedPlayers = useTournamentStore(state => state.qualifiedPlayers);

  const totalMunicipalities = initialMunicipalEvents.length;
  const completedCount = allCompleted.length;
  const regionsWithActivity = new Set(allCompleted.map(r => r.region_id)).size;
  const qualifiedGenerated = completedCount * 2; // municipal champion and runner up

  const stateReadiness = getStateReadiness();

  let regionsWithDuplicates = 0;
  
  const regionsData = initialRegions.map(region => {
    const regionMunicipalities = initialMunicipalities.filter(m => m.region_id === region.id);
    const regionMunicipalityIds = regionMunicipalities.map(m => m.id);
    const regionEvents = initialMunicipalEvents.filter(event => regionMunicipalityIds.includes(event.municipality_id));
    const completedInRegion = allCompleted.filter(r => r.region_id === region.id);
    const duplicates = getDuplicateTeamsByRegion(region.id);
    
    if (duplicates.length > 0) regionsWithDuplicates++;

    return {
      ...region,
      totalCount: regionEvents.length,
      completedCount: completedInRegion.length,
      qualifiedGenerated: completedInRegion.length * 2,
      duplicatesCount: duplicates.length
    };
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-heading font-bold">Dashboard Estatal</h2>
        <div className="flex gap-3">
          <button 
            onClick={async () => {
              if (confirm('¿Simular sorteo y bracket para los 25 municipios operativos? (Dev Mode)')) {
                await seedAllMunicipalities();
              }
            }}
            className="text-xs font-mono bg-[#1a1d24] text-[var(--color-primary)] border border-[var(--color-primary)] px-3 py-1 rounded hover:bg-opacity-80"
          >
            🛠 Sembrar 25 Muns
          </button>
          <button 
            onClick={() => {
              if (confirm('¿Borrar TODOS los datos locales del torneo?')) {
                useTournamentStore.getState().clearLocalTournamentState();
                window.location.reload();
              }
            }}
            className="text-xs font-mono bg-[#1a1d24] text-red-400 border border-red-400 px-3 py-1 rounded hover:bg-opacity-80"
          >
            🗑 Reset BD
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
          <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Municipios</div>
          <div className="text-3xl font-bold">{completedCount} / {totalMunicipalities}</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
          <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Regiones Activas</div>
          <div className="text-3xl font-bold">{regionsWithActivity} / {initialRegions.length}</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
          <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Clasificados</div>
          <div className="text-3xl font-bold text-green-400">{qualifiedGenerated}</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
          <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Regiones c/ Duplicados</div>
          <div className={`text-3xl font-bold ${regionsWithDuplicates > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {regionsWithDuplicates}
          </div>
        </div>
      </div>

      {stateReadiness.completedRegions === stateReadiness.totalRegions && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-primary)] rounded-xl p-6 mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Fase Regional Completada</h3>
            <p className="text-[var(--color-muted)]">
              Todos los torneos regionales han finalizado. 
              {stateReadiness.actualQualifiedPlayers === 0 
                ? " Genera a los clasificados estatales para iniciar la resolución de la Gran Final."
                : stateReadiness.duplicateGroups > 0
                  ? ` Hay ${stateReadiness.duplicateGroups} colisión(es) de selección a nivel estatal.`
                  : " El estado está listo para generar el Bracket Estatal."}
            </p>
          </div>
          <div>
            {stateReadiness.actualQualifiedPlayers === 0 ? (
              <button
                onClick={() => {
                  try {
                    createStateQualifiedPlayers();
                  } catch (e: unknown) {
                    alert(getErrorMessage(e));
                  }
                }}
                className="px-6 py-3 bg-[var(--color-primary)] hover:bg-opacity-80 text-white rounded-lg font-bold shadow-lg transition-all"
              >
                Generar Clasificados Estatales
              </button>
            ) : stateReadiness.duplicateGroups > 0 ? (
              <button
                onClick={() => navigate('/estatal/resolucion')}
                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow-lg transition-all"
              >
                Resolver Colisiones
              </button>
            ) : (
              <button
                onClick={() => navigate('/estatal/bracket')}
                className="px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow-lg transition-all"
              >
                Ir a Bracket Estatal
              </button>
            )}
          </div>
        </div>
      )}

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] bg-black/20">
          <h3 className="font-heading font-bold">Avance por Región</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-black/40 text-[var(--color-muted)] text-sm">
                <th className="p-4 font-normal">Región</th>
                <th className="p-4 font-normal">Avance</th>
                <th className="p-4 font-normal">Clasificados</th>
                <th className="p-4 font-normal">Duplicados</th>
                <th className="p-4 font-normal text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {regionsData.map(region => (
                <tr key={region.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-border)]/20 transition-colors">
                  <td className="p-4 font-medium">{region.name}</td>
                  <td className="p-4">
                    <span className="font-mono bg-black/30 px-2 py-1 rounded text-sm">
                      {region.completedCount} / {region.totalCount}
                    </span>
                  </td>
                  <td className="p-4">{region.qualifiedGenerated}</td>
                  <td className="p-4">
                    {region.duplicatesCount > 0 ? (
                      <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm">
                        {region.duplicatesCount} alerta(s)
                      </span>
                    ) : (
                      <span className="text-[var(--color-muted)]">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => navigate(`/regional/${region.id}`)}
                      className="px-4 py-1.5 bg-[var(--color-primary)] hover:bg-opacity-80 rounded text-sm transition-colors"
                    >
                      Ver región
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-2xl font-heading font-bold mb-4">Exportaciones Globales</h3>
        <ExportPanel 
          title="Resultados Municipales" 
          description="Exporta el historial de campeones y subcampeones de todos los municipios jugados."
          onExportCSV={() => exportToCSV('resultados_municipales', completedMunicipalResults)}
          onExportJSON={() => exportToJSON('resultados_municipales', completedMunicipalResults)}
          disabled={completedMunicipalResults.length === 0}
        />
        <ExportPanel 
          title="Resultados Regionales" 
          description="Exporta el historial de campeones y subcampeones de todas las regiones."
          onExportCSV={() => exportToCSV('resultados_regionales', completedRegionalResults)}
          onExportJSON={() => exportToJSON('resultados_regionales', completedRegionalResults)}
          disabled={completedRegionalResults.length === 0}
        />
        <ExportPanel 
          title="La Gran Final Estatal" 
          description="Exporta el resultado definitivo del torneo estatal."
          onExportCSV={() => exportToCSV('resultado_estatal', completedStateResults)}
          onExportJSON={() => exportToJSON('resultado_estatal', completedStateResults)}
          disabled={completedStateResults.length === 0}
        />
        <ExportPanel 
          title="Todos los Clasificados (Raw)" 
          description="Exporta la base de datos cruda de todos los jugadores clasificados en cualquier nivel."
          onExportCSV={() => exportToCSV('clasificados_raw', qualifiedPlayers)}
          onExportJSON={() => exportToJSON('clasificados_raw', qualifiedPlayers)}
          disabled={qualifiedPlayers.length === 0}
        />
      </div>
    </div>
  );
}
