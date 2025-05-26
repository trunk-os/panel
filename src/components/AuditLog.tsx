import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Stack,
  Chip,
  Alert,
  Collapse,
  IconButton,
  Button,
  Link,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import { UserDetailsModal } from "./UserDetailsModal";
import type { AuditLog as AuditLogType, Pagination as PaginationType, UserList } from "@/api/types";

interface AuditLogState {
  logs: AuditLogType[];
  loading: boolean;
  error: string | null;
  page: number;
  perPage: number;
  hasNextPage: boolean;
  expandedRows: Set<number>;
  users: UserList;
  usersLoading: boolean;
  userDetailsOpen: boolean;
  selectedUserForDetails: number | null;
}

export default function AuditLog() {
  const [state, setState] = useState<AuditLogState>({
    logs: [],
    loading: true,
    error: null,
    page: 1,
    perPage: 50,
    hasNextPage: false,
    expandedRows: new Set(),
    users: [],
    usersLoading: true,
    userDetailsOpen: false,
    selectedUserForDetails: null,
  });

  const fetchUsers = async () => {
    setState((prev) => ({ ...prev, usersLoading: true }));

    try {
      const response = await api.users.list();
      setState((prev) => ({
        ...prev,
        users: response.data,
        usersLoading: false,
      }));
    } catch (_error) {
      setState((prev) => ({
        ...prev,
        usersLoading: false,
        users: [],
      }));
    }
  };

  const fetchLogs = async (page: number, perPage: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const pagination: PaginationType = {
        page,
        perPage,
      };

      const response = await api.status.log(pagination);
      const logs = response.data.reverse();

      setState((prev) => ({
        ...prev,
        logs,
        loading: false,
        hasNextPage: logs.length === perPage,
      }));
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : "Failed to fetch audit logs";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: do not need to depend on fetchLogs
  useEffect(() => {
    fetchLogs(state.page, state.perPage);
  }, [state.page, state.perPage]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: do not need to depend on fetchUsers
  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePrevPage = () => {
    if (state.page > 1) {
      setState((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleNextPage = () => {
    if (state.hasNextPage) {
      setState((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusColor = (error: string | null) => {
    return error ? "error" : "success";
  };

  const toggleRowExpansion = (logId: number) => {
    setState((prev) => {
      const newExpandedRows = new Set(prev.expandedRows);
      if (newExpandedRows.has(logId)) {
        newExpandedRows.delete(logId);
      } else {
        newExpandedRows.add(logId);
      }
      return { ...prev, expandedRows: newExpandedRows };
    });
  };

  const formatJsonData = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return data;
    }
  };

  const hasValidJsonData = (data: string) => {
    if (!data || data.trim() === "") return false;
    try {
      const parsed = JSON.parse(data);
      return typeof parsed === "object" && parsed !== null && Object.keys(parsed).length > 0;
    } catch {
      return false;
    }
  };

  const removeAboutBlank = (text: string) => {
    return text.replace(/\[about:blank\] /g, "").trim();
  };

  const findUser = (userId: number) => {
    return state.users.find((user) => user.id === userId);
  };

  const getUserDisplayName = (userId: number | null) => {
    if (!userId) return "none";
    const user = findUser(userId);
    return user ? user.username : "deleted";
  };

  const handleUserClick = (userId: number | null, event: React.MouseEvent) => {
    event.stopPropagation();
    if (userId) {
      setState((prev) => ({
        ...prev,
        selectedUserForDetails: userId,
        userDetailsOpen: true,
      }));
    }
  };

  if (state.loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {state.error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Audit Log
        </Typography>

        <TableContainer component={Paper} sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Time</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Endpoint</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Entry</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.logs.map((log) => {
                const isExpanded = state.expandedRows.has(log.id);
                const hasJsonData = hasValidJsonData(log.data);
                return (
                  <>
                    <TableRow
                      key={log.id}
                      hover
                      sx={{ cursor: hasJsonData ? "pointer" : "default" }}
                      onClick={hasJsonData ? () => toggleRowExpansion(log.id) : undefined}
                    >
                      <TableCell>
                        {hasJsonData ? (
                          <IconButton size="small">
                            {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                          </IconButton>
                        ) : null}
                      </TableCell>
                      <TableCell>{formatTimestamp(log.time)}</TableCell>
                      <TableCell>
                        {log.user_id && findUser(log.user_id) ? (
                          <Link
                            component="button"
                            variant="body2"
                            onClick={(event) => handleUserClick(log.user_id, event)}
                            sx={{ cursor: "pointer", textDecoration: "underline" }}
                          >
                            {getUserDisplayName(log.user_id)}
                          </Link>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            {getUserDisplayName(log.user_id)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {log.endpoint}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {log.ip}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.error ? "Error" : "Success"}
                          color={getStatusColor(log.error)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          {log.entry}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {hasJsonData ? (
                          <Typography variant="body2" color="primary" sx={{ fontStyle: "italic" }}>
                            more...
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            color="text.disabled"
                            sx={{ fontStyle: "italic" }}
                          >
                            —
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                    {hasJsonData && (
                      <TableRow key={`${log.id}-expanded`}>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              <Typography variant="h6" gutterBottom component="div">
                                Additional Details
                              </Typography>
                              {(() => {
                                try {
                                  const parsedData = JSON.parse(log.data);
                                  if (typeof parsedData === "object" && parsedData !== null) {
                                    const entries = Object.entries(parsedData);
                                    if (entries.length > 0) {
                                      return (
                                        <TableContainer
                                          component={Paper}
                                          sx={{ border: 1, borderColor: "divider" }}
                                        >
                                          <Table size="small">
                                            <TableHead>
                                              <TableRow>
                                                {entries.map(([key]) => (
                                                  <TableCell key={key} sx={{ fontWeight: "bold" }}>
                                                    {key}
                                                  </TableCell>
                                                ))}
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              <TableRow>
                                                {entries.map(([key, value]) => (
                                                  <TableCell
                                                    key={key}
                                                    sx={{
                                                      fontFamily: "monospace",
                                                      fontSize: "0.75rem",
                                                    }}
                                                  >
                                                    {typeof value === "object" && value !== null
                                                      ? JSON.stringify(value, null, 2)
                                                      : String(value)}
                                                  </TableCell>
                                                ))}
                                              </TableRow>
                                            </TableBody>
                                          </Table>
                                        </TableContainer>
                                      );
                                    }
                                  }
                                } catch {
                                  // Fall back to formatted JSON display
                                }
                                return (
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
                                        color: "text.primary",
                                      }}
                                    >
                                      {formatJsonData(log.data)}
                                    </Typography>
                                  </Paper>
                                );
                              })()}
                              {log.error && (
                                <>
                                  <Typography
                                    variant="h6"
                                    gutterBottom
                                    component="div"
                                    sx={{ mt: 2 }}
                                  >
                                    Error Details
                                  </Typography>
                                  <Paper
                                    sx={{
                                      p: 2,
                                      bgcolor: "error.light",
                                      border: 1,
                                      borderColor: "error.main",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontFamily="monospace"
                                      sx={{
                                        whiteSpace: "pre-wrap",
                                        wordBreak: "break-word",
                                        fontSize: "0.75rem",
                                        color: "error.contrastText",
                                      }}
                                    >
                                      {removeAboutBlank(log.error)}
                                    </Typography>
                                  </Paper>
                                </>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {state.logs.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No audit logs found
          </Typography>
        )}

        {(state.page > 1 || state.hasNextPage) && (
          <Stack direction="row" justifyContent="center" spacing={2}>
            <Button variant="outlined" onClick={handlePrevPage} disabled={state.page <= 1}>
              Previous
            </Button>
            <Button variant="outlined" onClick={handleNextPage} disabled={!state.hasNextPage}>
              Next
            </Button>
          </Stack>
        )}

        <UserDetailsModal
          open={state.userDetailsOpen}
          onClose={() =>
            setState((prev) => ({ ...prev, userDetailsOpen: false, selectedUserForDetails: null }))
          }
          userId={state.selectedUserForDetails}
          onUserUpdated={() => fetchUsers()}
          onUserDeleted={() => fetchUsers()}
        />
      </CardContent>
    </Card>
  );
}
