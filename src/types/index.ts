export type UserRole = 'municipal_operator' | 'regional_operator' | 'state_committee' | 'viewer';
export type StageType = 'municipal' | 'regional' | 'state';
export type SessionStatus = 'draft' | 'ready_for_draw' | 'drawing' | 'draw_completed' | 'bracket_ready' | 'bracket_active' | 'completed' | 'locked';
export type ParticipantStatus = 'registered' | 'assigned' | 'playing' | 'eliminated' | 'champion' | 'runner_up' | 'qualified';
export type AssignmentSource = 'municipal_draw' | 'regional_reassignment' | 'state_reassignment';
export type MatchStatus = 'pending' | 'ready' | 'completed' | 'locked' | 'correction_required';
export type RoundType = 'round_64' | 'round_32' | 'round_16' | 'quarterfinal' | 'semifinal' | 'final';
export type QualificationRank = 'champion' | 'runner_up';
export type SyncStatus = 'synced' | 'pending_sync' | 'sync_error';

export interface Region {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Municipality {
  id: string;
  region_id: string;
  name: string;
  municipal_date: string | null;
  regional_date: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  flag_code: string;
  flag_asset_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  municipality_id: string | null;
  region_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DrawSession {
  id: string;
  stage: StageType;
  status: SessionStatus;
  municipality_id: string | null;
  region_id: string | null;
  name: string;
  participant_min: number;
  participant_max: number;
  allow_duplicate_teams: boolean;
  created_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  locked_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface Participant {
  id: string;
  session_id: string;
  source_qualified_player_id: string | null;
  display_name: string;
  turn_order: number | null;
  status: ParticipantStatus;
  sync_status: SyncStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Assignment {
  id: string;
  session_id: string;
  participant_id: string;
  team_id: string;
  source: AssignmentSource;
  assigned_at: string;
  created_by: string | null;
  sync_status: SyncStatus;
}

export interface Bracket {
  id: string;
  session_id: string;
  bracket_size: number;
  participant_count: number;
  bye_count: number;
  status: string; // text in DB but default 'draft'
  generated_by: string | null;
  generated_at: string;
  locked_at: string | null;
}

export interface Match {
  id: string;
  bracket_id: string;
  session_id: string;
  round: RoundType;
  match_number: number;
  next_match_id: string | null;
  player_a_id: string | null;
  player_b_id: string | null;
  team_a_id: string | null;
  team_b_id: string | null;
  regular_score_a: number | null;
  regular_score_b: number | null;
  extra_time_played: boolean;
  penalties_played: boolean;
  penalties_score_a: number | null;
  penalties_score_b: number | null;
  winner_id: string | null;
  loser_id: string | null;
  status: MatchStatus;
  completed_by: string | null;
  completed_at: string | null;
  locked_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface QualifiedPlayer {
  id: string;
  source_session_id: string;
  target_stage: StageType;
  participant_id: string;
  municipality_id: string | null;
  region_id: string | null;
  team_id: string;
  rank: QualificationRank;
  is_active: boolean;
  created_at: string;
}

export interface TeamReassignment {
  id: string;
  stage: StageType;
  session_id: string | null;
  qualified_player_id: string;
  previous_team_id: string;
  new_team_id: string;
  kept_by_qualified_player_id: string | null;
  reason: string;
  resolved_by: string | null;
  resolved_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  previous_value: Record<string, any> | null;
  new_value: Record<string, any> | null;
  reason: string | null;
  created_at: string;
}

export interface CompletedMunicipalResult {
  id: string;
  source_session_id: string;

  municipality_id: string;
  municipality_name: string;
  region_id: string;
  region_name: string;

  completed_at: string;

  participant_count: number;
  bracket_size: number;
  bye_count: number;

  champion_participant_id: string;
  champion_name: string;
  champion_team_id: string;
  champion_team_name: string;

  runner_up_participant_id: string;
  runner_up_name: string;
  runner_up_team_id: string;
  runner_up_team_name: string;

  final_match_id: string | null;
  final_regular_score_champion: number | null;
  final_regular_score_runner_up: number | null;
  final_extra_time_played: boolean;
  final_penalties_played: boolean;
  final_penalties_score_champion: number | null;
  final_penalties_score_runner_up: number | null;
  final_decision_method: "regular" | "extra_time" | "penalties" | "bye" | "unknown";
}

export interface CompletedRegionalResult {
  id: string;
  source_session_id: string;

  region_id: string;
  region_name: string;

  completed_at: string;

  participant_count: number;
  bracket_size: number;
  bye_count: number;

  champion_participant_id: string;
  champion_name: string;
  champion_team_id: string;
  champion_team_name: string;

  runner_up_participant_id: string;
  runner_up_name: string;
  runner_up_team_id: string;
  runner_up_team_name: string;

  final_match_id: string | null;
  final_regular_score_champion: number | null;
  final_regular_score_runner_up: number | null;
  final_extra_time_played: boolean;
  final_penalties_played: boolean;
  final_penalties_score_champion: number | null;
  final_penalties_score_runner_up: number | null;
  final_decision_method: "regular" | "extra_time" | "penalties" | "bye" | "unknown";
}

export interface CompletedStateResult {
  id: string;
  source_session_id: string;
  completed_at: string;
  
  participant_count: number;
  bracket_size: number;
  bye_count: number;

  champion_participant_id: string;
  champion_name: string;
  champion_team_id: string;
  champion_team_name: string;
  champion_region_name: string;

  runner_up_participant_id: string;
  runner_up_name: string;
  runner_up_team_id: string;
  runner_up_team_name: string;
  runner_up_region_name: string;

  final_match_id: string | null;
  final_regular_score_champion: number | null;
  final_regular_score_runner_up: number | null;
  final_extra_time_played: boolean;
  final_penalties_played: boolean;
  final_penalties_score_champion: number | null;
  final_penalties_score_runner_up: number | null;
  final_decision_method: "regular" | "extra_time" | "penalties" | "bye" | "unknown";
}
