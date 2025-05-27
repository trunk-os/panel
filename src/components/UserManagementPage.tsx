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
  const { user: currentUser, logout } = useAuthStore();

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.users.list();
      console.log("[fetchUsers] ", response);
      setUsers(
        Array.isArray(response.data) ? response.data : response.data ? [response.data].flat() : []
      );
    } catch (_error) {
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchUsers();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: fetchUsers is defined in the component and doesn't change
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (_user: UserCreateRequest) => {
    refetch();
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
        await api.users.destroy(Number(selectedUser.id));
        if (selectedUser.id === currentUser?.id) {
          logout();
        } else {
          refetch();
          setDeleteDialogOpen(false);
          setSelectedUser(null);
        }
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
  console.log("[UserManagmentPage] ", users);
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
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
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
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => openDeleteDialog(user)}
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {filter ? "No matching users found" : "No users found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
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
        currentUser={currentUser}
        isLoading={isDeletingUser}
      />

      <UserDetailsModal
        open={userDetailsOpen}
        onClose={() => setUserDetailsOpen(false)}
        userId={selectedUserForDetails}
        onUserUpdated={() => {
          fetchUsers();
        }}
        onUserDeleted={() => {
          fetchUsers();
        }}
      />
    </Box>
  );
}
