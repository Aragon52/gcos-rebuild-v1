import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Database,
  Store,
  Package,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Zap,
  Lock,
} from "lucide-react";
import {
  useGlobalLoading,
  SIGNUP_TRANSITION_STAGES,
  LOGIN_TRANSITION_STAGES,
} from "@/lib/global-loading-store";

export interface AuthStage {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const SIGNUP_STAGES: AuthStage[] = SIGNUP_TRANSITION_STAGES;
export const LOGIN_STAGES: AuthStage[] = LOGIN_TRANSITION_STAGES;

interface AuthProgressBannerProps {
  isLoading?: boolean;
  stages?: AuthStage[];
  onComplete?: () => void;
  variant?: "signup" | "login" | "custom";
}

export default function AuthProgressBanner({
  isLoading: propIsLoading,
  stages: propStages,
  variant = "signup",
}: AuthProgressBannerProps) {
  const globalLoading = useGlobalLoading();

  // Use props if explicitly passed, otherwise fallback to global Zustand store
  const activeIsLoading =
    propIsLoading !== undefined ? propIsLoading : globalLoading.isLoading;

  const activeStages =
    propStages ||
    (globalLoading.stages.length > 0
      ? globalLoading.stages
      : variant === "signup"
      ? SIGNUP_TRANSITION_STAGES
      : LOGIN_TRANSITION_STAGES);

  const activeProgress =
    propIsLoading !== undefined
      ? globalLoading.progress || 50
      : globalLoading.progress;

  const activeStep = globalLoading.step || 1;
  const totalSteps = activeStages.length;

  const currentStageIndex = Math.max(
    0,
    Math.min(activeStep - 1, activeStages.length - 1)
  );
  const activeStage = activeStages[currentStageIndex] || activeStages[0];
  const StageIcon = activeStage.icon || (variant === "signup" ? Store : Lock);

  const displayTitle = globalLoading.statusTitle || activeStage.title;
  const displaySubtitle = globalLoading.statusSubtitle || activeStage.subtitle;

  if (!activeIsLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="w-full rounded-xl border border-primary/40 bg-gradient-to-br from-primary/20 via-primary/10 to-black/60 backdrop-blur-md p-4 shadow-xl overflow-hidden relative"
    >
      {/* Background Animated Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/25 rounded-full blur-2xl animate-pulse pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between mb-2.5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-primary/30 border border-primary/50 flex items-center justify-center text-primary shadow-xs">
            <StageIcon className="h-4 w-4 animate-bounce" />
          </div>
          <span className="text-xs font-semibold text-white/90 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary fill-primary" />
            {variant === "signup" || globalLoading.flow === "signup"
              ? "Account Setup"
              : "Session Sync"}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-primary bg-primary/20 px-2 py-0.5 rounded-full border border-primary/30">
          {Math.round(activeProgress)}%
        </span>
      </div>

      {/* Animated Text Display */}
      <div className="relative min-h-[44px] flex flex-col justify-center my-1 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayTitle}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-0.5"
          >
            <p className="text-sm font-bold text-white flex items-center gap-2">
              <span>{displayTitle}</span>
            </p>
            {displaySubtitle && (
              <p className="text-xs text-white/70 truncate">{displaySubtitle}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sleek Glowing Progress Bar */}
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/10 mt-2 relative z-10">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary rounded-full shadow-[0_0_12px_rgba(34,197,94,0.6)]"
          initial={{ width: "15%" }}
          animate={{ width: `${Math.max(15, activeProgress)}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between mt-2.5 px-0.5 text-[10px] text-white/50 z-10 relative">
        <span>
          Step {Math.min(activeStep, totalSteps)} of {totalSteps}
        </span>
        <span className="animate-pulse text-white/80">Please wait a moment...</span>
      </div>
    </motion.div>
  );
}
