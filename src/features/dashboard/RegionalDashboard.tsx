import { useParams, useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../../store';
import { initialRegions } from '../../data/regions';
import { initialMunicipalities } from '../../data/municipalities';
import { initialMunicipalEvents } from '../../data/municipalEvents';
import ExportPanel from '../exports/ExportPanel';
import { exportToCSV, exportToJSON } from '../../lib/utils/exportUtils';

export default function RegionalDashboard() {
  const { regionId } = useParams();
  const navigate = useNavigate();

  const getCompletedMunicipalResultsByRegion = useTournamentStore(state => state.getCompletedMunicipalResultsByRegion);
  const getRegionReadiness = useTournamentStore(state => state.getRegionReadiness);
  const completedRegionalResults = useTournamentStore(state => state.completedRegionalResults);

  if (!regionId) return null;

  const region = initialRegions.find(r => r.id === regionId);
  if (!region) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-red-500">Región no encontrada</h2>
        <button onClick={() => navigate('/estatal/dashboard')} className="mt-4 text-blue-400 underline">Volver al Dashboard</button>
      </div>
    );
  }

  const regionMunicipalities = initialMunicipalities.filter(m => m.region_id === region.id);
  const regionMunicipalityIds = regionMunicipalities.map(m => m.id);
  const regionEvents = initialMunicipalEvents.filter(event => regionMunicipalityIds.includes(event.municipality_id));
  const completedResults = getCompletedMunicipalResultsByRegion(region.id);

  const readiness = getRegionReadiness(region.id);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold">Región: {region.name}</h2>
        <button 
          onClick={() => navigate('/estatal/dashboard')}
          className="px-4 py-2 border border-[var(--color-border)] rounded text-sm hover:bg-[var(--color-surface)] transition-colors"
        >
          &larr; Volver a Estatal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
          <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Avance Municipal</div>
          <div className="text-3xl font-bold">{readiness.completedMunicipalities} / {readiness.totalMunicipalities}</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
          <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Municipios Pendientes</div>
          <div className="text-3xl font-bold text-orange-400">{readiness.pendingMunicipalities}</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
          <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Clasificados Regionales</div>
          <div className="text-3xl font-bold text-green-400">{readiness.actualQualifiedPlayers} / {readiness.expectedQualifiedPlayers}</div>
        </div>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
          <div className="text-sm text-[var(--color-muted)] font-mono mb-1">Duplicados Detectados</div>
          <div className={`text-3xl font-bold ${readiness.duplicateGroups > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {readiness.duplicateGroups}
          </div>
        </div>
      </div>

      {readiness.isReady && readiness.actualQualifiedPlayers === readiness.expectedQualifiedPlayers && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3 text-green-400 font-bold text-lg">
            <span>✅ Región lista para bracket</span>
          </div>
          <button 
            onClick={() => navigate(`/regional/${region.id}/bracket`)}
            className="px-6 py-3 bg-[var(--color-primary)] hover:bg-opacity-80 rounded text-sm font-bold transition-colors"
          >
            Ir a Bracket Regional
          </button>
        </div>
      )}

      {readiness.duplicateGroups > 0 && (
        <div className="bg-[var(--color-surface)] border border-red-500/50 rounded-xl p-6 mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-bold text-red-400 mb-1">⚠️ Alertas de Colisión de Selecciones</h3>
            <p className="text-[var(--color-muted)] text-sm">Existen clasificados con selecciones duplicadas. Deben resolverse antes del sorteo regional.</p>
          </div>
          <button 
            onClick={() => navigate(`/regional/${region.id}/resolucion`)}
            className="px-6 py-3 bg-[var(--color-primary)] hover:bg-opacity-80 rounded text-sm font-bold transition-colors"
          >
            Resolver duplicados
          </button>
        </div>
      )}

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border)] bg-black/20 flex justify-between items-center">
          <h3 className="font-heading font-bold">Municipios de la Región</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-black/40 text-[var(--color-muted)] text-sm">
                <th className="p-4 font-normal">Municipio</th>
                <th className="p-4 font-normal">Estado</th>
                <th className="p-4 font-normal">Campeón</th>
                <th className="p-4 font-normal">Subcampeón</th>
                <th className="p-4 font-normal">Fecha Cierre</th>
              </tr>
            </thead>
            <tbody>
              {regionEvents.map(event => {
                const mun = regionMunicipalities.find(m => m.id === event.municipality_id);
                const snapshot = completedResults.find(r => r.municipal_event_id === event.id || (!r.municipal_event_id && r.municipality_id === event.municipality_id));
                const isCompleted = !!snapshot;
                if (!mun) return null;

                return (
                  <tr key={event.id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-border)]/20 transition-colors">
                    <td className="p-4 font-medium">
                      {mun.name}
                      <div className="text-xs text-[var(--color-muted)]">{event.label}</div>
                    </td>
                    <td className="p-4">
                      {isCompleted ? (
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs uppercase font-bold tracking-wider">Completado</span>
                      ) : (
                        <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs uppercase font-bold tracking-wider">Pendiente</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isCompleted ? (
                        <div>
                          <div className="font-medium">{snapshot.champion_name}</div>
                          <div className="text-[var(--color-muted)] text-xs">{snapshot.champion_team_name}</div>
                        </div>
                      ) : (
                        <span className="text-[var(--color-muted)]">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isCompleted ? (
                        <div>
                          <div className="font-medium">{snapshot.runner_up_name}</div>
                          <div className="text-[var(--color-muted)] text-xs">{snapshot.runner_up_team_name}</div>
                        </div>
                      ) : (
                        <span className="text-[var(--color-muted)]">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-[var(--color-muted)] font-mono">
                      {isCompleted ? new Date(snapshot.completed_at).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-2xl font-heading font-bold mb-4">Exportaciones Regionales</h3>
        <ExportPanel 
          title={`Resultados de ${region.name}`} 
          description="Exporta el resultado oficial de esta región."
          onExportCSV={() => exportToCSV(`resultado_${region.id}`, completedRegionalResults.filter(r => r.region_id === region.id))}
          onExportJSON={() => exportToJSON(`resultado_${region.id}`, completedRegionalResults.filter(r => r.region_id === region.id))}
          disabled={!completedRegionalResults.some(r => r.region_id === region.id)}
        />
        <ExportPanel 
          title="Avance Municipal de la Región" 
          description="Exporta el detalle de los campeones y subcampeones de cada municipio de esta región."
          onExportCSV={() => exportToCSV(`municipios_${region.id}`, completedResults)}
          onExportJSON={() => exportToJSON(`municipios_${region.id}`, completedResults)}
          disabled={completedResults.length === 0}
        />
      </div>
    </div>
  );
}
