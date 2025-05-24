import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface SetupGuardProps {
  children: React.ReactNode;
}

export function SetupGuard({ children }: SetupGuardProps) {
  const { needsSetup } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!needsSetup) {
      navigate("/dashboard", { replace: true });
    }
  }, [needsSetup, navigate]);

  if (!needsSetup) {
    return null;
  }

  return <>{children}</>;
}