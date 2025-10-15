/**
 * Fathom AI API Client
 * Provides typed functions for interacting with the Fathom API
 */

declare const process: {
  env: Record<string, string | undefined>;
};

const FATHOM_API_BASE = 'https://api.fathom.ai/external/v1';

// Type definitions based on Fathom API documentation
export interface FathomMeeting {
  title: string;
  meeting_title: string;
  recording_id: number;
  url: string;
  share_url: string;
  created_at: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  recording_start_time: string;
  recording_end_time: string;
  calendar_invitees_domains_type: 'all' | 'only_internal' | 'one_or_more_external';
  transcript_language: string;
  transcript?: FathomTranscriptEntry[];
  default_summary?: FathomSummary;
  action_items?: FathomActionItem[];
  calendar_invitees: FathomCalendarInvitee[];
  recorded_by: FathomUser;
  crm_matches?: FathomCrmMatches;
}

export interface FathomTranscriptEntry {
  speaker: {
    display_name: string;
    matched_calendar_invitee_email?: string;
  };
  text: string;
  timestamp: string;
}

export interface FathomSummary {
  template_name: string;
  markdown_formatted: string;
}

export interface FathomActionItem {
  description: string;
  user_generated: boolean;
  completed: boolean;
  recording_timestamp: string;
  recording_playback_url: string;
  assignee: FathomUser;
}

export interface FathomCalendarInvitee {
  name: string;
  matched_speaker_display_name: string;
  email: string;
  email_domain: string;
  is_external: boolean;
}

export interface FathomUser {
  name: string;
  email: string;
  email_domain: string;
  team?: string;
}

export interface FathomCrmMatches {
  contacts: Array<{
    name: string;
    email: string;
    record_url: string;
  }>;
  companies: Array<{
    name: string;
    record_url: string;
  }>;
  deals: Array<{
    name: string;
    amount: number;
    record_url: string;
  }>;
  error?: string;
}

export interface FathomTeam {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface FathomTeamMember {
  id: string;
  name: string;
  email: string;
  team_id: string;
  created_at: string;
  updated_at: string;
}

export interface FathomPaginatedResponse<T> {
  limit: number | null;
  next_cursor: string | null;
  items: T[];
}

export interface FathomListMeetingsParams {
  calendar_invitees?: string[];
  calendar_invitees_domains?: string[];
  calendar_invitees_domains_type?: 'all' | 'only_internal' | 'one_or_more_external';
  created_after?: string;
  created_before?: string;
  cursor?: string;
  include_action_items?: boolean;
  include_crm_matches?: boolean;
  include_summary?: boolean;
  include_transcript?: boolean;
  meeting_type?: 'all' | 'internal' | 'external';
  recorded_by?: string[];
  teams?: string[];
}

export interface FathomApiErrorResponse {
  error: {
    code: number;
    message: string;
  };
}

export class FathomApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: number
  ) {
    super(message);
    this.name = 'FathomApiError';
  }
}

export class FathomClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Fathom API key is required');
    }
    this.apiKey = apiKey;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${FATHOM_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-Api-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorCode: number | undefined;

      try {
        const errorData = await response.json() as FathomApiErrorResponse;
        errorMessage = errorData.error?.message || errorMessage;
        errorCode = errorData.error?.code;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new FathomApiError(errorMessage, response.status, errorCode);
    }

    return response.json();
  }

  private buildQueryString(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          // Handle array parameters (e.g., calendar_invitees[])
          value.forEach(item => {
            searchParams.append(`${key}[]`, item.toString());
          });
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * List meetings with optional filters
   */
  async listMeetings(params: FathomListMeetingsParams = {}): Promise<FathomPaginatedResponse<FathomMeeting>> {
    const queryString = this.buildQueryString(params as Record<string, unknown>);
    return this.makeRequest<FathomPaginatedResponse<FathomMeeting>>(`/meetings${queryString}`);
  }

  /**
   * Get meeting summary by recording ID
   */
  async getSummary(recordingId: number): Promise<FathomSummary> {
    return this.makeRequest<FathomSummary>(`/recordings/${recordingId}/summary`);
  }

  /**
   * Get meeting transcript by recording ID
   */
  async getTranscript(recordingId: number): Promise<FathomTranscriptEntry[]> {
    return this.makeRequest<FathomTranscriptEntry[]>(`/recordings/${recordingId}/transcript`);
  }

  /**
   * List all teams
   */
  async listTeams(cursor?: string): Promise<FathomPaginatedResponse<FathomTeam>> {
    const params = cursor ? { cursor } : {};
    const queryString = this.buildQueryString(params);
    return this.makeRequest<FathomPaginatedResponse<FathomTeam>>(`/teams${queryString}`);
  }

  /**
   * List team members for a specific team
   */
  async listTeamMembers(teamId: string, cursor?: string): Promise<FathomPaginatedResponse<FathomTeamMember>> {
    const params = cursor ? { cursor } : {};
    const queryString = this.buildQueryString(params);
    return this.makeRequest<FathomPaginatedResponse<FathomTeamMember>>(`/teams/${teamId}/members${queryString}`);
  }
}

/**
 * Create a Fathom client instance using environment variable
 */
export function createFathomClient(): FathomClient {
  const apiKey = process.env.FATHOM_API_KEY;
  if (!apiKey) {
    throw new Error('FATHOM_API_KEY environment variable is required');
  }
  return new FathomClient(apiKey);
}
