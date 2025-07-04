import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Slider,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useServiceLogsSSE } from "@/hooks/useServiceLogsSSE";

interface LogViewerProps {
  open: boolean;
  serviceId: string | null;
  onClose: () => void;
}

export function LogViewer({ open, serviceId, onClose }: LogViewerProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [logCount, setLogCount] = useState(10);
  const { logs, loading, fetchLogs, clearLogs } = useServiceLogsSSE();

  useEffect(() => {
    if (open && serviceId) {
      fetchLogs(serviceId, logCount);
    }
  }, [open, serviceId, logCount, fetchLogs]);

  useEffect(() => {
    if (!open) {
      clearLogs();
    }
  }, [open, clearLogs]);

  const handleRefresh = () => {
    if (serviceId) {
      fetchLogs(serviceId, logCount);
    }
  };

  const handleLogCountChange = (_: Event, newValue: number | number[]) => {
    setLogCount(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  const handleDownload = () => {
    const content = logs.map(log => 
      `[${new Date(log.timestamp).toISOString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-${serviceId}-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log =>
    searchTerm === "" || 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (level: string): string => {
    switch (level) {
      case "error":
        return "#ef4444"; // red-500
      case "warn":
        return "#f59e0b"; // amber-500
      case "info":
        return "#3b82f6"; // blue-500
      case "debug":
        return "#6b7280"; // gray-500
      default:
        return "#9ca3af"; // gray-400
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2, pb: 1 }}>
        Service Logs
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Refresh logs">
          <span>
            <IconButton 
              onClick={handleRefresh} 
              disabled={loading}
              size="small"
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
              aria-label="Refresh logs"
            >
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Download logs">
          <span>
            <IconButton 
              onClick={handleDownload} 
              disabled={logs.length === 0}
              size="small"
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
              aria-label="Download logs"
            >
              <DownloadIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Close">
          <IconButton 
            onClick={onClose}
            size="small"
            sx={{
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
            aria-label="Close"
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
            <TextField
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ flexGrow: 1 }}
            />
          </Box>
          
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ minWidth: 80 }}>
              Log count: {logCount}
            </Typography>
            <Slider
              value={logCount}
              onChange={handleLogCountChange}
              min={5}
              max={100}
              step={5}
              sx={{ flexGrow: 1, maxWidth: 200 }}
              size="small"
            />
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            height: 500, 
            overflow: "auto",
            bgcolor: "#1a1a1a",
            color: "#ffffff",
            fontFamily: "monospace",
            fontSize: "0.875rem",
            lineHeight: 1.4,
            p: 2,
          }}
        >
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <CircularProgress size={24} sx={{ color: "#ffffff" }} />
            </Box>
          ) : filteredLogs.length === 0 ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
              <Typography sx={{ color: "#6b7280" }}>
                {searchTerm ? "No logs match your search" : "No logs available"}
              </Typography>
            </Box>
          ) : (
            filteredLogs.map((log, index) => (
              <Box
                key={`log-${log.timestamp}-${index}`}
                sx={{
                  display: "flex",
                  mb: 0.5,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    color: "#6b7280",
                    mr: 2,
                    minWidth: 80,
                    flexShrink: 0,
                  }}
                >
                  {formatTimestamp(log.timestamp)}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    color: getLevelColor(log.level),
                    mr: 2,
                    minWidth: 50,
                    flexShrink: 0,
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {log.level}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    color: "#ffffff",
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {log.message}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={onClose}
          sx={{
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}