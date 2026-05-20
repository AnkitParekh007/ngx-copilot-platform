/**
 * Channel Service
 * RetailOps PXM - Channel Syndication
 */
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { 
  Channel, 
  ChannelStatus, 
  SyndicationJob, 
  AttributeMapping 
} from '../models/channel.model';

@Injectable({ providedIn: 'root' })
export class ChannelService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/channels';

  // Signals for reactive state
  private readonly _channels = signal<Channel[]>([]);
  private readonly _loading = signal(false);
  private readonly _selectedChannel = signal<Channel | null>(null);
  private readonly _syndicationJobs = signal<SyndicationJob[]>([]);

  // Public computed signals
  readonly channels = this._channels.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly selectedChannel = this._selectedChannel.asReadonly();
  readonly syndicationJobs = this._syndicationJobs.asReadonly();

  readonly activeChannels = computed(() =>
    this._channels().filter(c => c.status === 'active')
  );
  readonly channelCount = computed(() => this._channels().length);

  /**
   * Fetch all channels
   */
  getChannels(): Observable<Channel[]> {
    this._loading.set(true);
    return this.http.get<Channel[]>(this.baseUrl).pipe(
      tap(channels => {
        this._channels.set(channels);
        this._loading.set(false);
      }),
      catchError(error => {
        this._loading.set(false);
        console.error('[ChannelService] Error fetching channels:', error);
        throw error;
      })
    );
  }

  /**
   * Get single channel by ID
   */
  getChannel(id: string): Observable<Channel> {
    return this.http.get<Channel>(`${this.baseUrl}/${id}`).pipe(
      tap(channel => this._selectedChannel.set(channel))
    );
  }

  /**
   * Create new channel
   */
  createChannel(channel: Partial<Channel>): Observable<Channel> {
    return this.http.post<Channel>(this.baseUrl, channel).pipe(
      tap(created => {
        this._channels.update(channels => [...channels, created]);
      })
    );
  }

  /**
   * Update channel configuration
   */
  updateChannel(id: string, updates: Partial<Channel>): Observable<Channel> {
    return this.http.patch<Channel>(`${this.baseUrl}/${id}`, updates).pipe(
      tap(updated => {
        this._channels.update(channels =>
          channels.map(c => c.id === id ? updated : c)
        );
        if (this._selectedChannel()?.id === id) {
          this._selectedChannel.set(updated);
        }
      })
    );
  }

  /**
   * Update channel status
   */
  updateChannelStatus(id: string, status: ChannelStatus): Observable<Channel> {
    return this.http.post<Channel>(`${this.baseUrl}/${id}/status`, { status }).pipe(
      tap(updated => {
        this._channels.update(channels =>
          channels.map(c => c.id === id ? updated : c)
        );
      })
    );
  }

  /**
   * Update attribute mappings
   */
  updateMappings(id: string, mappings: AttributeMapping[]): Observable<Channel> {
    return this.http.put<Channel>(`${this.baseUrl}/${id}/mappings`, { mappings }).pipe(
      tap(updated => {
        this._channels.update(channels =>
          channels.map(c => c.id === id ? updated : c)
        );
      })
    );
  }

  /**
   * Start syndication job for channel
   */
  startSyndication(
    channelId: string,
    type: 'full' | 'incremental' | 'single',
    skuIds?: string[]
  ): Observable<SyndicationJob> {
    return this.http.post<SyndicationJob>(
      `${this.baseUrl}/${channelId}/syndicate`,
      { type, skuIds }
    ).pipe(
      tap(job => {
        this._syndicationJobs.update(jobs => [...jobs, job]);
      })
    );
  }

  /**
   * Get syndication jobs for channel
   */
  getSyndicationJobs(channelId: string): Observable<SyndicationJob[]> {
    return this.http.get<SyndicationJob[]>(`${this.baseUrl}/${channelId}/jobs`).pipe(
      tap(jobs => this._syndicationJobs.set(jobs))
    );
  }

  /**
   * Get syndication job status
   */
  getJobStatus(jobId: string): Observable<SyndicationJob> {
    return this.http.get<SyndicationJob>(`/api/syndication-jobs/${jobId}`);
  }

  /**
   * Cancel syndication job
   */
  cancelJob(jobId: string): Observable<SyndicationJob> {
    return this.http.post<SyndicationJob>(`/api/syndication-jobs/${jobId}/cancel`, {}).pipe(
      tap(updated => {
        this._syndicationJobs.update(jobs =>
          jobs.map(j => j.id === jobId ? updated : j)
        );
      })
    );
  }

  /**
   * Test channel connection
   */
  testConnection(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.baseUrl}/${id}/test-connection`,
      {}
    );
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this._selectedChannel.set(null);
  }
}
