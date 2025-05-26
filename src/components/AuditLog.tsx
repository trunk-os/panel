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
  Pagination,
  Stack,
  Chip,
  Alert,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Link,
  Grid,
  Divider,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowRight, Close as CloseIcon } from "@mui/icons-material";
import { api } from "@/api/client";
import { ApiError } from "@/api/errors";
import type { AuditLog as AuditLogType, Pagination as PaginationType, UserData } from "@/api/types";

interface AuditLogState {
  logs: AuditLogType[];
  loading: boolean;
  error: string | null;
  page: number;
  perPage: number;
  totalPages: number;
  expandedRows: Set<number>;
  userDialogOpen: boolean;
  selectedUser: UserData | null;
  userLoading: boolean;
}

export default function AuditLog() {
  const [state, setState] = useState<AuditLogState>({
    logs: [],
    loading: true,
    error: null,
    page: 1,
    perPage: 50,
    totalPages: 1,
    expandedRows: new Set(),
    userDialogOpen: false,
    selectedUser: null,
    userLoading: false,
  });

  const fetchLogs = async (page: number, perPage: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const pagination: PaginationType = {
        page,
        perPage,
      };

      const response = await api.status.log(pagination);
      const logs = response.data;

      setState((prev) => ({
        ...prev,
        logs,
        loading: false,
        totalPages: Math.max(1, Math.ceil(logs.length / perPage)),
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

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setState((prev) => ({ ...prev, page }));
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

  const handleUserClick = async (userId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setState(prev => ({ ...prev, userLoading: true, userDialogOpen: true }));

    try {
      const response = await api.users.get(userId);
      setState(prev => ({
        ...prev,
        selectedUser: response.data,
        userLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        userLoading: false,
        selectedUser: null,
      }));
    }
  };

  const handleCloseUserDialog = () => {
    setState(prev => ({
      ...prev,
      userDialogOpen: false,
      selectedUser: null,
    }));
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
                <TableCell>User ID</TableCell>
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
                        {log.user_id ? (
                          <Link
                            component="button"
                            variant="body2"
                            onClick={(event) => handleUserClick(log.user_id!, event)}
                            sx={{ cursor: "pointer", textDecoration: "underline" }}
                          >
                            {log.user_id}
                          </Link>
                        ) : (
                          "none"
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
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                          {log.data}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {hasJsonData && (
                      <TableRow key={`${log.id}-expanded`}>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                              JSON Data
                            </Typography>
                            <Paper sx={{ 
                              p: 2, 
                              bgcolor: "background.default",
                              border: 1,
                              borderColor: "divider"
                            }}>
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
                                <Paper sx={{ 
                                  p: 2, 
                                  bgcolor: "error.light",
                                  border: 1,
                                  borderColor: "error.main"
                                }}>
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
                                    {log.error}
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

        {state.totalPages > 1 && (
          <Stack direction="row" justifyContent="center" spacing={2}>
            <Pagination
              count={state.totalPages}
              page={state.page}
              onChange={handlePageChange}
              color="primary"
            />
          </Stack>
        )}

        <Dialog open={state.userDialogOpen} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              User Details
              <IconButton onClick={handleCloseUserDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            {state.userLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : state.selectedUser ? (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User ID
                    </Typography>
                    <Typography variant="body1">{state.selectedUser.id}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body1">{state.selectedUser.username}</Typography>
                  </Grid>
                  {state.selectedUser.realname && (
                    <>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Real Name
                        </Typography>
                        <Typography variant="body1">{state.selectedUser.realname}</Typography>
                      </Grid>
                    </>
                  )}
                  {state.selectedUser.email && (
                    <>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">{state.selectedUser.email}</Typography>
                      </Grid>
                    </>
                  )}
                  {state.selectedUser.phone && (
                    <>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1">{state.selectedUser.phone}</Typography>
                      </Grid>
                    </>
                  )}
                </Grid>
              </Box>
            ) : (
              <Alert severity="error">Failed to load user details</Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUserDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
