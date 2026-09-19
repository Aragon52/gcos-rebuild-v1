import { create } from "zustand";
import {
  Database,
  Store,
  Package,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Lock,
  Loader2,
} from "lucide-react";
import React from "react";

export type AuthFlowType = "signup" | "login" | "reset" | "sync" | "custom";

export interface LoadingTransitionStage {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  progress: number;
}

export const SIGNUP_TRANSITION_STAGES: LoadingTransitionStage[] = [
  {
    id: "connecting-database",
    title: "Connecting to database...",
    subtitle: "Establishing secure SSL database connection",
    icon: Database,
    progress: 18,
  },
  {
    id: "creating-shop",
    title: "Creating your reseller shop...",
    subtitle: "Configuring store profile & shop identifier",
    icon: Store,
    progress: 38,
  },
  {
    id: "loading-products-catalog",
    title: "Loading products catalog...",
    subtitle: "Syncing wholesale inventory and categories",
    icon: Package,
    progress: 60,
  },
  {
    id: "preparing-dashboard",
    title: "Preparing your dashboard...",
    subtitle: "Setting up analytics, wallet & order tracker",
    icon: LayoutDashboard,
    progress: 82,
  },
  {
    id: "confirming-registration",
    title: "Confirming registration...",
    subtitle: "Finalizing your merchant credentials",
    icon: ShieldCheck,
    progress: 95,
  },
  {
    id: "ready",
    title: "Ready to launch!",
    subtitle: "Opening your reseller dashboard",
    icon: CheckCircle2,
    progress: 100,
  },
];

export const LOGIN_TRANSITION_STAGES: LoadingTransitionStage[] = [
  {
    id: "validating-credentials",
    title: "Verifying credentials...",
    subtitle: "Authenticating account access",
    icon: Lock,
    progress: 22,
  },
  {
    id: "connecting-database",
    title: "Connecting to store database...",
    subtitle: "Retrieving encrypted merchant session",
    icon: Database,
    progress: 46,
  },
  {
    id: "syncing-store-data",
    title: "Synchronizing shop data...",
    subtitle: "Loading products, active orders & wallet",
    icon: RefreshCw,
    progress: 72,
  },
  {
    id: "preparing-dashboard",
    title: "Preparing your dashboard...",
    subtitle: "Initializing real-time workspace",
    icon: LayoutDashboard,
    progress: 90,
  },
  {
    id: "ready",
    title: "Welcome back!",
    subtitle: "Opening your reseller dashboard",
    icon: Sparkles,
    progress: 100,
  },
];

export interface GlobalLoadingState {
  isLoading: boolean;
  flow: AuthFlowType | null;
  currentStatus: string;
  statusTitle: string;
  statusSubtitle: string;
  progress: number;
  step: number;
  totalSteps: number;
  stages: LoadingTransitionStage[];
  error: string | null;

  // Actions
  startLoading: (flow: AuthFlowType, customStages?: LoadingTransitionStage[]) => void;
  setStatus: (
    statusId: string,
    meta?: { title?: string; subtitle?: string; progress?: number; step?: number }
  ) => void;
  nextStage: () => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  stopLoading: () => void;
  reset: () => void;
  runWithTransitions: <T>(
    flow: AuthFlowType,
    task: () => Promise<T>,
    options?: { minDurationMs?: number; customStages?: LoadingTransitionStage[] }
  ) => Promise<T>;
}

export const useGlobalLoadingStore = create<GlobalLoadingState>((set, get) => ({
  isLoading: false,
  flow: null,
  currentStatus: "idle",
  statusTitle: "",
  statusSubtitle: "",
  progress: 0,
  step: 0,
  totalSteps: 0,
  stages: [],
  error: null,

  startLoading: (flow, customStages) => {
    let stages: LoadingTransitionStage[] = [];
    if (customStages && customStages.length > 0) {
      stages = customStages;
    } else if (flow === "signup") {
      stages = SIGNUP_TRANSITION_STAGES;
    } else if (flow === "login") {
      stages = LOGIN_TRANSITION_STAGES;
    } else {
      stages = [
        {
          id: "processing",
          title: "Processing request...",
          subtitle: "Please wait a moment",
          icon: Loader2,
          progress: 50,
        },
      ];
    }

    const first = stages[0] || {
      id: "loading",
      title: "Loading...",
      subtitle: "",
      progress: 20,
    };

    set({
      isLoading: true,
      flow,
      stages,
      currentStatus: first.id,
      statusTitle: first.title,
      statusSubtitle: first.subtitle || "",
      progress: first.progress,
      step: 1,
      totalSteps: stages.length,
      error: null,
    });
  },

  setStatus: (statusId, meta) => {
    const { stages } = get();
    const stageIndex = stages.findIndex((s) => s.id === statusId);
    const matchedStage = stageIndex !== -1 ? stages[stageIndex] : null;

    set((state) => ({
      currentStatus: statusId,
      statusTitle: meta?.title ?? matchedStage?.title ?? state.statusTitle,
      statusSubtitle:
        meta?.subtitle ?? matchedStage?.subtitle ?? state.statusSubtitle,
      progress: meta?.progress ?? matchedStage?.progress ?? state.progress,
      step: meta?.step ?? (stageIndex !== -1 ? stageIndex + 1 : state.step),
    }));
  },

  nextStage: () => {
    const { step, totalSteps, stages } = get();
    if (step < totalSteps) {
      const nextIndex = step; // 0-based next
      const nextStage = stages[nextIndex];
      if (nextStage) {
        set({
          step: nextIndex + 1,
          currentStatus: nextStage.id,
          statusTitle: nextStage.title,
          statusSubtitle: nextStage.subtitle || "",
          progress: nextStage.progress,
        });
      }
    }
  },

  setProgress: (progress) => {
    set({ progress: Math.min(100, Math.max(0, progress)) });
  },

  setError: (error) => {
    set({ error, isLoading: false });
  },

  stopLoading: () => {
    set({
      isLoading: false,
      flow: null,
      currentStatus: "idle",
      progress: 100,
    });
  },

  reset: () => {
    set({
      isLoading: false,
      flow: null,
      currentStatus: "idle",
      statusTitle: "",
      statusSubtitle: "",
      progress: 0,
      step: 0,
      totalSteps: 0,
      stages: [],
      error: null,
    });
  },

  runWithTransitions: async <T>(
    flow: AuthFlowType,
    task: () => Promise<T>,
    options?: { minDurationMs?: number; customStages?: LoadingTransitionStage[] }
  ): Promise<T> => {
    const { startLoading, setStatus, stopLoading, setError } = get();
    const minDuration = options?.minDurationMs ?? 2000;
    const stages =
      options?.customStages ||
      (flow === "signup" ? SIGNUP_TRANSITION_STAGES : LOGIN_TRANSITION_STAGES);

    startLoading(flow, stages);
    const startTime = Date.now();

    // Timer interval for progressing through stages smoothly
    let currentStageIdx = 0;
    const intervalTime = Math.max(300, Math.floor((minDuration * 0.8) / Math.max(1, stages.length - 1)));
    
    const interval = setInterval(() => {
      currentStageIdx++;
      if (currentStageIdx < stages.length - 1) {
        const stage = stages[currentStageIdx];
        setStatus(stage.id);
      }
    }, intervalTime);

    try {
      const result = await task();

      // Clear interval and ensure final stages are reached
      clearInterval(interval);

      const elapsed = Date.now() - startTime;
      if (elapsed < minDuration) {
        // Step to penultimate / ready stage
        if (stages.length >= 2) {
          const readyStage = stages[stages.length - 1];
          setStatus(readyStage.id, { progress: 95 });
        }
        await new Promise((r) => setTimeout(r, minDuration - elapsed));
      }

      // Finish at 100%
      const finalStage = stages[stages.length - 1];
      setStatus(finalStage.id, { progress: 100 });
      await new Promise((r) => setTimeout(r, 200));

      stopLoading();
      return result;
    } catch (err: any) {
      clearInterval(interval);
      setError(err?.message || "An unexpected error occurred");
      throw err;
    }
  },
}));

/**
 * Hook to easily access global loading state and transition statuses in any UI component
 */
export function useGlobalLoading() {
  const isLoading = useGlobalLoadingStore((s) => s.isLoading);
  const flow = useGlobalLoadingStore((s) => s.flow);
  const currentStatus = useGlobalLoadingStore((s) => s.currentStatus);
  const statusTitle = useGlobalLoadingStore((s) => s.statusTitle);
  const statusSubtitle = useGlobalLoadingStore((s) => s.statusSubtitle);
  const progress = useGlobalLoadingStore((s) => s.progress);
  const step = useGlobalLoadingStore((s) => s.step);
  const totalSteps = useGlobalLoadingStore((s) => s.totalSteps);
  const stages = useGlobalLoadingStore((s) => s.stages);
  const error = useGlobalLoadingStore((s) => s.error);

  const startLoading = useGlobalLoadingStore((s) => s.startLoading);
  const setStatus = useGlobalLoadingStore((s) => s.setStatus);
  const nextStage = useGlobalLoadingStore((s) => s.nextStage);
  const setProgress = useGlobalLoadingStore((s) => s.setProgress);
  const setError = useGlobalLoadingStore((s) => s.setError);
  const stopLoading = useGlobalLoadingStore((s) => s.stopLoading);
  const reset = useGlobalLoadingStore((s) => s.reset);
  const runWithTransitions = useGlobalLoadingStore((s) => s.runWithTransitions);

  return {
    isLoading,
    flow,
    currentStatus,
    statusTitle,
    statusSubtitle,
    progress,
    step,
    totalSteps,
    stages,
    error,
    startLoading,
    setStatus,
    nextStage,
    setProgress,
    setError,
    stopLoading,
    reset,
    runWithTransitions,
  };
}

/**
 * Convenient selector hook to retrieve just the current active status and title
 */
export function useGlobalLoadingStatus() {
  const isLoading = useGlobalLoadingStore((s) => s.isLoading);
  const currentStatus = useGlobalLoadingStore((s) => s.currentStatus);
  const statusTitle = useGlobalLoadingStore((s) => s.statusTitle);
  const statusSubtitle = useGlobalLoadingStore((s) => s.statusSubtitle);
  const progress = useGlobalLoadingStore((s) => s.progress);

  return {
    isLoading,
    currentStatus,
    statusTitle,
    statusSubtitle,
    progress,
  };
}
