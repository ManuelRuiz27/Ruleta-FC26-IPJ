import { useEffect, useRef } from 'react';
import { useTournamentStore } from '../store';
import type {
  CompletedMunicipalResult,
  CompletedRegionalResult,
  CompletedStateResult,
  QualifiedPlayer,
  TeamReassignment
} from '../types';
import { fetchCloudRecords, isSupabaseConfigured, recordsFromState, upsertCloudRecords, type CloudRecord } from '../lib/supabaseSync';
import { supabase } from '../lib/supabaseClient';

const mergeById = <T extends { id: string }>(local: T[], remote: T[]) => {
  const map = new Map(local.map(item => [item.id, item]));
  remote.forEach(item => map.set(item.id, { ...map.get(item.id), ...item }));
  return Array.from(map.values());
};

const applyRecordsToStore = (records: CloudRecord[]) => {
  const completedMunicipalResults = records
    .filter(record => record.record_type === 'completed_municipal_result')
    .map(record => record.data as unknown as CompletedMunicipalResult);
  const completedRegionalResults = records
    .filter(record => record.record_type === 'completed_regional_result')
    .map(record => record.data as unknown as CompletedRegionalResult);
  const completedStateResults = records
    .filter(record => record.record_type === 'completed_state_result')
    .map(record => record.data as unknown as CompletedStateResult);
  const qualifiedPlayers = records
    .filter(record => record.record_type === 'qualified_player')
    .map(record => record.data as unknown as QualifiedPlayer);
  const teamReassignments = records
    .filter(record => record.record_type === 'team_reassignment')
    .map(record => record.data as unknown as TeamReassignment);

  useTournamentStore.setState(state => ({
    completedMunicipalResults: mergeById(state.completedMunicipalResults, completedMunicipalResults),
    completedRegionalResults: mergeById(state.completedRegionalResults, completedRegionalResults),
    completedStateResults: mergeById(state.completedStateResults, completedStateResults),
    qualifiedPlayers: mergeById(state.qualifiedPlayers, qualifiedPlayers),
    teamReassignments: mergeById(state.teamReassignments, teamReassignments)
  }));
};

export default function SupabaseCloudSync() {
  const lastUploadedPayload = useRef('');
  const uploadTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    let disposed = false;

    fetchCloudRecords()
      .then(records => {
        if (!disposed) applyRecordsToStore(records);
      })
      .catch(error => {
        console.error('No se pudieron cargar registros Supabase:', error);
      });

    const unsubscribeStore = useTournamentStore.subscribe(state => {
      const records = recordsFromState(state);
      const payload = JSON.stringify(records);
      if (payload === lastUploadedPayload.current) return;
      lastUploadedPayload.current = payload;

      if (uploadTimer.current) window.clearTimeout(uploadTimer.current);
      uploadTimer.current = window.setTimeout(() => {
        upsertCloudRecords(records).catch(error => {
          console.error('No se pudieron sincronizar registros Supabase:', error);
        });
      }, 750);
    });

    const channel = client
      .channel('tournament-records-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournament_records' },
        payload => {
          const nextRecord = payload.new as CloudRecord | null;
          if (nextRecord) applyRecordsToStore([nextRecord]);
        }
      )
      .subscribe();

    return () => {
      disposed = true;
      unsubscribeStore();
      if (uploadTimer.current) window.clearTimeout(uploadTimer.current);
      void client.removeChannel(channel);
    };
  }, []);

  return null;
}
