import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Paper,
  Chip,
  Stack,
  Divider,
  IconButton,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import { Close, Error as ErrorIcon } from "@mui/icons-material";
import { useToastStore } from "@/store/toastStore";
import { TextWithLinks } from "./TextWithLinks";
import { isProblemDetails } from "@/api/errorUtils";
import type { ProblemDetails } from "@/api/errors";

interface ErrorDetailModalProps {
  open: boolean;
  onClose: () => void;
  errorId: string | null;
}

interface ProblemDetailsTableProps {
  data: unknown;
  title: string;
}

function ProblemDetailsTable({ data, title }: ProblemDetailsTableProps) {
  if (!isProblemDetails(data)) {
    // Fallback for non-ProblemDetails data
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Paper sx={{ border: 1, borderColor: "divider" }}>
          <Typography
            component="pre"
            variant="body2"
            fontFamily="monospace"
            sx={{
              p: 2,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: "0.875rem",
              maxHeight: "300px",
              overflow: "auto",
            }}
          >
            {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
          </Typography>
        </Paper>
      </Box>
    );
  }

  const problemDetails = data as ProblemDetails;
  const standardFields = [
    { key: "type", label: "Type", value: problemDetails.type },
    { key: "title", label: "Title", value: problemDetails.title },
    { key: "status", label: "Status", value: problemDetails.status },
    { key: "detail", label: "Detail", value: problemDetails.detail },
    { key: "instance", label: "Instance", value: problemDetails.instance },
  ].filter((field) => field.value !== undefined);

  const additionalFields = Object.entries(problemDetails)
    .filter(([key]) => !["type", "title", "status", "detail", "instance"].includes(key))
    .map(([key, value]) => ({ key, label: key, value }));

  const allFields = [...standardFields, ...additionalFields];

  if (allFields.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <TableContainer component={Paper} sx={{ border: 1, borderColor: "divider" }}>
        <Table size="small">
          <TableBody>
            {allFields.map(({ key, label, value }) => (
              <TableRow key={key}>
                <TableCell sx={{ fontWeight: "bold", width: "20%", verticalAlign: "top" }}>
                  {label}
                </TableCell>
                <TableCell sx={{ verticalAlign: "top" }}>
                  {key === "status" && typeof value === "number" ? (
                    <Chip label={`${value}`} color="error" size="small" />
                  ) : key === "detail" && typeof value === "string" ? (
                    <TextWithLinks
                      text={value}
                      variant="body2"
                      fontFamily="monospace"
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        fontSize: "0.875rem",
                        lineHeight: 1.5,
                      }}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      fontFamily={
                        typeof value === "string" && value.includes("\n") ? "monospace" : undefined
                      }
                      sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        fontSize: "0.875rem",
                      }}
                    >
                      {typeof value === "object" && value !== null
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export function ErrorDetailModal({ open, onClose, errorId }: ErrorDetailModalProps) {
  const { getError } = useToastStore();

  const error = errorId ? getError(errorId) : undefined;

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={2} alignItems="center">
          <ErrorIcon color="error" />
          <Typography variant="h6">Error Details</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {!error ? (
          <Typography color="text.secondary">
            The requested error details could not be found. The error may have been cleared or the
            ID is invalid.
          </Typography>
        ) : (
          <Stack spacing={3}>
            {/* Error Metadata */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Error Metadata
              </Typography>
              <TableContainer component={Paper} sx={{ border: 1, borderColor: "divider" }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", width: "20%" }}>Timestamp</TableCell>
                      <TableCell>{formatTimestamp(error.timestamp)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Error ID</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {error.id}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* ProblemDetails */}
            <ProblemDetailsTable data={error.fullData} title="Problem Details" />

            <Divider />

            {/* Raw JSON for debugging */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Raw JSON Data
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "background.default",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Typography
                  component="pre"
                  variant="body2"
                  fontFamily="monospace"
                  sx={{
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    maxHeight: "300px",
                    overflow: "auto",
                  }}
                >
                  {JSON.stringify(error.fullData, null, 2)}
                </Typography>
              </Paper>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
