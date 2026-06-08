import type {
  CompletedMunicipalResult,
  CompletedRegionalResult,
  CompletedStateResult,
  QualifiedPlayer,
  TeamReassignment
} from '../types';
import { supabase } from './supabaseClient';

export type CloudRecordType =
  | 'completed_municipal_result'
  | 'completed_regional_result'
  | 'completed_state_result'
  | 'qualified_player'
  | 'team_reassignment';

export type CloudRecord = {
  record_type: CloudRecordType;
  record_id: string;
  data: Record<string, unknown>;
};

export const isSupabaseConfigured = Boolean(supabase);

export const recordsFromState = (state: {
  completedMunicipalResults: CompletedMunicipalResult[];
  completedRegionalResults: CompletedRegionalResult[];
  completedStateResults: CompletedStateResult[];
  qualifiedPlayers: QualifiedPlayer[];
  teamReassignments: TeamReassignment[];
}): CloudRecord[] => [
  ...state.completedMunicipalResults.map(result => ({
    record_type: 'completed_municipal_result' as const,
    record_id: result.id,
    data: result as unknown as Record<string, unknown>
  })),
  ...state.completedRegionalResults.map(result => ({
    record_type: 'completed_regional_result' as const,
    record_id: result.id,
    data: result as unknown as Record<string, unknown>
  })),
  ...state.completedStateResults.map(result => ({
    record_type: 'completed_state_result' as const,
    record_id: result.id,
    data: result as unknown as Record<string, unknown>
  })),
  ...state.qualifiedPlayers.map(player => ({
    record_type: 'qualified_player' as const,
    record_id: player.id,
    data: player as unknown as Record<string, unknown>
  })),
  ...state.teamReassignments.map(reassignment => ({
    record_type: 'team_reassignment' as const,
    record_id: reassignment.id,
    data: reassignment as unknown as Record<string, unknown>
  }))
];

export const fetchCloudRecords = async () => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('tournament_records')
    .select('record_type, record_id, data');

  if (error) throw error;
  return (data ?? []) as CloudRecord[];
};

export const upsertCloudRecords = async (records: CloudRecord[]) => {
  if (!supabase || records.length === 0) return;

  const { error } = await supabase
    .from('tournament_records')
    .upsert(records, { onConflict: 'record_type,record_id' });

  if (error) throw error;
};
