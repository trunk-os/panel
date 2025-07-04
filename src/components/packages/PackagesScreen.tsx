import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
} from "@mui/material";
import { PackageSearch } from "./PackageSearch";
import { PackagesList } from "./PackagesList";
import { ConfigurationDialog } from "./ConfigurationDialog";
import { usePackages } from "@/hooks/usePackages";
import type { Package } from "@/types/services";
import { useNavigate } from "react-router-dom";

export default function PackagesScreen() {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const { packages, loading, searchPackages } = usePackages();
  const navigate = useNavigate();

  useEffect(() => {
    searchPackages();
  }, [searchPackages]);

  const handleSearch = (query: string) => {
    searchPackages({ query });
  };

  const handleInstallPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    setConfigDialogOpen(true);
  };

  const handleCloseConfigDialog = () => {
    setConfigDialogOpen(false);
    setSelectedPackage(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link 
          component="button" 
          variant="body2" 
          onClick={() => navigate("/services")}
          sx={{ textDecoration: "none" }}
        >
          Services
        </Link>
        <Typography variant="body2" color="text.primary">
          Add Service
        </Typography>
      </Breadcrumbs>
      
      <Typography variant="h4" component="h1" gutterBottom>
        Install Package
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <PackageSearch onSearch={handleSearch} />
        </CardContent>
      </Card>

      <PackagesList
        packages={packages}
        loading={loading}
        onInstall={handleInstallPackage}
      />

      <ConfigurationDialog
        open={configDialogOpen}
        package={selectedPackage}
        onClose={handleCloseConfigDialog}
      />
    </Box>
  );
}