import { useState, useCallback } from "react";
import { api } from "@/api/client";
import type { Package, PackageSearchParams } from "@/types/services";
import { useToastStore } from "@/store/toastStore";

export function usePackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToastStore();

  const searchPackages = useCallback(
    async (_params?: PackageSearchParams) => {
      try {
        setLoading(true);
        setError(null);
        // Get available packages from registry
        const response = await api.packages.list();
        const packagesData: Package[] = response.data.map((pkg) => ({
          name: pkg.name,
          version: pkg.version,
          description: `Package ${pkg.name}`,
          category: "available",
        }));
        setPackages(packagesData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search packages";
        setError(errorMessage);
        showToast({ message: errorMessage, severity: "error" });
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  const installPackage = useCallback(
    async (packageName: string, version: version) => {
      try {
        await api.packages.install({ name: packageName, version });
        showToast({
          message: `Package ${packageName} installed successfully`,
          severity: "success",
        });
        return null; // Real API doesn't return service data immediately
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : `Failed to install package ${packageName}`;
        showToast({ message: errorMessage, severity: "error" });
        throw err;
      }
    },
    [showToast]
  );

  return {
    packages,
    loading,
    error,
    searchPackages,
    installPackage,
  };
}
