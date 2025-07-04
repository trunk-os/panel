import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  InputAdornment,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import { Search as SearchIcon, Refresh as RefreshIcon, FilterList as FilterIcon } from "@mui/icons-material";
import { ServicesList } from "./ServicesList";
import { LogViewer } from "./LogViewer";
import { useServices } from "@/hooks/useServices";

export default function ServicesScreen() {
  const [filter, setFilter] = useState("");
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [logViewerOpen, setLogViewerOpen] = useState(false);
  const { services, loading, refetch } = useServices();

  console.log(`[DEBUG UI] ServicesScreen: received ${services.length} services total`);
  const containerServices = services.filter(s => 
    s.name.includes('libpod-') || 
    s.name.includes('gild') || 
    s.name.includes('charond') || 
    s.name.includes('buckled') ||
    s.name.includes('caddy')
  );
  console.log(`[DEBUG UI] ServicesScreen: found ${containerServices.length} container services:`, containerServices.map(s => s.name));

  const availableStatuses = ["running", "stopped", "error", "installing", "configuring"];

  const filteredServices = services.filter(service => {
    const matchesText = service.name.toLowerCase().includes(filter.toLowerCase()) ||
      (service.packageName?.toLowerCase().includes(filter.toLowerCase()));
    
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(service.status);
    
    return matchesText && matchesStatus;
  });

  console.log(`[DEBUG UI] ServicesScreen: after filtering, ${filteredServices.length} services will be displayed`);

  const handleViewLogs = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setLogViewerOpen(true);
  };

  const handleCloseLogViewer = () => {
    setLogViewerOpen(false);
    setSelectedServiceId(null);
  };


  const handleStatusFilterChange = (event: { target: { value: string | string[] } }) => {
    const value = event.target.value;
    setStatusFilters(typeof value === 'string' ? value.split(',') : value);
  };

  const handleStatusFilterDelete = (statusToDelete: string) => {
    setStatusFilters(statusFilters.filter(status => status !== statusToDelete));
  };

  const getStatusColor = (status: string): "success" | "default" | "error" | "warning" => {
    switch (status) {
      case "running":
        return "success";
      case "stopped":
        return "default";
      case "error":
        return "error";
      case "installing":
      case "configuring":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Services
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", flexWrap: "wrap" }}>
            <TextField
              placeholder="Search services..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, minWidth: 250 }}
            />
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="status-filter-label">Filter by Status</InputLabel>
              <Select
                labelId="status-filter-label"
                multiple
                value={statusFilters}
                onChange={handleStatusFilterChange}
                label="Filter by Status"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon />
                  </InputAdornment>
                }
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        color={getStatusColor(value)}
                        onDelete={() => handleStatusFilterDelete(value)}
                        onMouseDown={(event) => {
                          event.stopPropagation();
                        }}
                      />
                    ))}
                  </Box>
                )}
              >
                {availableStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Chip 
                      label={status} 
                      size="small" 
                      color={getStatusColor(status)}
                      sx={{ mr: 1 }}
                    />
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Refresh the services list">
                <span>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={refetch}
                    disabled={loading}
                    sx={{
                      "&:hover": {
                        backgroundColor: "action.hover",
                        borderColor: "primary.main",
                      },
                    }}
                    aria-label="Refresh services list"
                  >
                    Refresh
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Box>

          {statusFilters.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active filters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {statusFilters.map((status) => (
                  <Chip
                    key={status}
                    label={`Status: ${status}`}
                    size="small"
                    color={getStatusColor(status)}
                    onDelete={() => handleStatusFilterDelete(status)}
                  />
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <ServicesList
        services={filteredServices}
        loading={loading}
        onViewLogs={handleViewLogs}
      />

      <LogViewer
        open={logViewerOpen}
        serviceId={selectedServiceId}
        onClose={handleCloseLogViewer}
      />
    </Box>
  );
}