import { InspectionFinding } from '../types/inspection';
import { MOCK_FINDINGS } from './mockData';

export interface AIJobStatusResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0 to 100
  currentImage?: string;
  processedCount: number;
  totalCount: number;
  findings?: InspectionFinding[];
  completedAt?: string;
  [key: string]: unknown;
}

// In-memory job state tracking for polling
const jobStateStore: Record<
  string,
  {
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    total: number;
    startedAt: number;
  }
> = {};

export const aiService = {
  /**
   * Triggers a new AI comparison job for move-out photos against move-in baselines
   */
  async triggerComparisonJob(inspectionId: string, totalPairs = 6): Promise<{ jobId: string }> {
    await new Promise((res) => setTimeout(res, 400));
    const jobId = `job_ai_${Date.now()}`;
    jobStateStore[jobId] = {
      status: 'processing',
      progress: 10,
      total: totalPairs,
      startedAt: Date.now(),
    };
    return { jobId };
  },

  /**
   * Status endpoint polled by `usePolling` hook every 3-5s
   */
  async getJobStatus(jobId: string): Promise<AIJobStatusResponse> {
    await new Promise((res) => setTimeout(res, 200));

    let job = jobStateStore[jobId];
    if (!job) {
      // Return completed default job for mock review screens
      return {
        jobId,
        status: 'completed',
        progress: 100,
        processedCount: 6,
        totalCount: 6,
        findings: MOCK_FINDINGS,
        completedAt: new Date().toISOString(),
      };
    }

    // Advance simulated progress each poll
    const timeElapsed = Date.now() - job.startedAt;
    let nextProgress = Math.min(100, Math.floor(job.progress + 25 + Math.random() * 15));

    if (timeElapsed > 12000 || nextProgress >= 100) {
      job.status = 'completed';
      job.progress = 100;
      return {
        jobId,
        status: 'completed',
        progress: 100,
        processedCount: job.total,
        totalCount: job.total,
        findings: MOCK_FINDINGS,
        completedAt: new Date().toISOString(),
      };
    }

    job.progress = nextProgress;
    const processed = Math.floor((nextProgress / 100) * job.total);

    return {
      jobId,
      status: 'processing',
      progress: nextProgress,
      processedCount: processed,
      totalCount: job.total,
      currentImage: `Object ${processed + 1} of ${job.total}: Comparing surface gradients & edge damage...`,
    };
  },
};

export default aiService;
