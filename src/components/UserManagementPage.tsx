import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { api } from "@/api/client";
import type { UserData, UserCreateRequest, UserList, UserUpdateRequest } from "@/api/types";
import { CreateUserDialog } from "./dialogs/user/CreateUserDialog";
import { EditUserDialog } from "./dialogs/user/EditUserDialog";
import { DeleteUserConfirmationDialog } from "./dialogs/user/DeleteUserConfirmationDialog";
import { UserDetailsModal } from "./UserDetailsModal";
import PaginationControls from "./PaginationControls";
import { useAuthStore } from "@/store/authStore";

export default function UserManagementPage() {
  const [filter, setFilter] = useState("");
  const [users, setUsers] = useState<UserList>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(50);
  const [hasNextPage, setHasNextPage] = useState(false);
  const { currentUser, logout } = useAuthStore();

  const fetchUsers = async (pageNum: number = page, pageSize: number = perPage) => {
    setIsLoading(true);
    try {
      const response = await api.users.list({ page: pageNum, per_page: pageSize });
      const userData = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data].flat()
          : [];
      setUsers(userData);
      setHasNextPage(userData.length === pageSize);
    } catch (_error) {
      setUsers([]);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchUsers(page, perPage);
  };

  const refetchFromFirstPage = () => {
    setPage(0);
    fetchUsers(0, perPage);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchUsers is defined in the component and doesn't change
  useEffect(() => {
    fetchUsers(page, perPage);
  }, [page, perPage]);

  const handleCreateUser = async (_user: UserCreateRequest) => {
    refetchFromFirstPage();
    setCreateUserOpen(false);
  };

  const handleEditUser = async (user: UserUpdateRequest) => {
    setIsEditingUser(true);
    try {
      await api.users.update(user);
      refetch();
      setEditDialogOpen(false);
      setSelectedUser(null);
    } finally {
      setIsEditingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (selectedUser) {
      setIsDeletingUser(true);
      try {
        console.log("[handleDeleteUser] ", selectedUser, currentUser);
        if (selectedUser.deleted_at) {
          await api.users.restore(Number(selectedUser.id));
        } else {
          await api.users.destroy(Number(selectedUser.id));
          if (selectedUser.id === currentUser()?.id) {
            logout();
            return;
          }
        }
        refetchFromFirstPage();
        setDeleteDialogOpen(false);
        setSelectedUser(null);
      } finally {
        setIsDeletingUser(false);
      }
    }
  };

  const openEditDialog = (user: UserData) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserData) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const viewUserDetails = (userId: number) => {
    console.log(`[viewUserDetails] got ${userId}`);
    setSelectedUserForDetails(userId);
    setUserDetailsOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
  };
  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(filter.toLowerCase()) ||
      user.realname?.toLowerCase().includes(filter.toLowerCase()) ||
      user.email?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h2">User Management</Typography>
        <Typography variant="body1" color="text.secondary">
          Manage system users
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}
          >
            <TextField
              label="Filter"
              variant="outlined"
              size="small"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by username, name, or email"
              sx={{ width: 300 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={() => setCreateUserOpen(true)}>
                Create User
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Real Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.realname || "-"}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell>
                        {user.deleted_at ? (
                          <Typography variant="body2" color="warning.main">
                            Suspended
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="success.main">
                            Active
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => viewUserDetails(user.id)}
                            >
                              <span className="material-symbols-outlined">visibility</span>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openEditDialog(user)}
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </IconButton>
                          </Tooltip>
                          {user.deleted_at ? (
                            <Tooltip title="Restore User">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => openDeleteDialog(user)}
                              >
                                <span className="material-symbols-outlined">restore</span>
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Suspend User">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => openDeleteDialog(user)}
                              >
                                <span className="material-symbols-outlined">block</span>
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredUsers.length === 0 && (
            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
              {filter ? "No matching users found" : "No users found"}
            </Typography>
          )}

          <PaginationControls
            page={page}
            perPage={perPage}
            hasNextPage={hasNextPage}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateUserDialog
        open={createUserOpen}
        onClose={() => setCreateUserOpen(false)}
        onUserCreated={handleCreateUser}
      />

      <EditUserDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSubmit={handleEditUser}
        user={selectedUser}
        isLoading={isEditingUser}
      />

      <DeleteUserConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        user={selectedUser}
        isLoading={isDeletingUser}
      />

      <UserDetailsModal
        open={userDetailsOpen}
        onClose={() => setUserDetailsOpen(false)}
        userId={selectedUserForDetails}
        onUserUpdated={() => {
          refetch();
        }}
        onUserDeleted={() => {
          refetchFromFirstPage();
        }}
      />
    </Box>
  );
}
