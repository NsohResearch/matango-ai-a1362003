import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const IDLE_TIMEOUT_MS = 5 * 60 * 60 * 1000; // 5 hours
const WARNING_BEFORE_MS = 60 * 1000; // Show warning 1 minute before logout
const EVENTS = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

export const useIdleTimeout = (enabled: boolean) => {
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const logout = useCallback(async () => {
    setShowWarning(false);
    await supabase.auth.signOut();
    toast.info("You've been signed out due to inactivity.");
    navigate("/", { replace: true });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (showWarning) return; // Don't reset while warning is visible
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

    timerRef.current = setTimeout(logout, IDLE_TIMEOUT_MS);
  }, [logout, showWarning]);

  const handleContinue = useCallback(() => {
    setShowWarning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    // Restart timers
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);
    timerRef.current = setTimeout(logout, IDLE_TIMEOUT_MS);
  }, [logout]);

  useEffect(() => {
    if (!enabled) return;

    resetTimer();
    EVENTS.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      EVENTS.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, [enabled, resetTimer]);

  return { showWarning, handleContinue, handleLogout: logout };
};
