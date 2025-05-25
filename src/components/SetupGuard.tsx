import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useSetupStore } from "@/store/setupStore";

interface SetupGuardProps {
  children: React.ReactNode;
}

export function SetupGuard({ children }: SetupGuardProps) {
  const navigate = useNavigate();
  const { firstUser } = useAuthStore();
  const { setupComplete } = useSetupStore();

  const needsSetup = (): boolean => {
    return !setupComplete;
  };
  const allowedSetup = (): boolean => {
    return !!firstUser;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: the functions don't change.
  useEffect(() => {
    if (!allowedSetup() || (allowedSetup() && !needsSetup())) {
      navigate("/dashboard", { replace: true });
    }
  }, []);

  if (!allowedSetup() || !needsSetup()) {
    return null;
  }

  return <>{children}</>;
}
