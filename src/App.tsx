import React from "react";
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Router,
  Route,
} from "react-router-dom";

import Home from "./routes/Home.tsx";
import CreateUser from "./routes/CreateUser.tsx";
import Logout from "./routes/Logout.tsx";
import DashboardHome from "./routes/DashboardHome.tsx";
import UserManagement from "./routes/UserManagement.tsx";
import DiskManagement from "./routes/DiskManagement.tsx";
import SystemManagement from "./routes/SystemManagement.tsx";
import PackageManagement from "./routes/PackageManagement.tsx";
import SystemDashboard from "./routes/SystemDashboard.tsx";
import AuditLog from "./routes/AuditLog.tsx";

import Dashboard from "./components/Dashboard.tsx";
import CenterForm from "./components/CenterForm.tsx";

export default function App() {
  let [page, setPage] = React.useState(0);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Home />} />
        <Route
          path="user/create"
          element={
            <CenterForm ceiling="medium">
              <CreateUser />
            </CenterForm>
          }
        />
        <Route
          path="dashboard"
          element={
            <Dashboard>
              <DashboardHome />
            </Dashboard>
          }
        />
        <Route
          path="dashboard/user"
          element={
            <Dashboard>
              <UserManagement page={page} setPage={setPage} />
            </Dashboard>
          }
        />
        <Route
          path="dashboard/user/create"
          element={
            <Dashboard>
              <div style={{ height: "2em" }} />
              <CreateUser />
            </Dashboard>
          }
        />
        <Route
          path="dashboard/disk"
          element={
            <Dashboard>
              <DiskManagement />
            </Dashboard>
          }
        />
        <Route
          path="dashboard/system"
          element={
            <Dashboard>
              <SystemManagement />
            </Dashboard>
          }
        />
        <Route
          path="dashboard/packages"
          element={
            <Dashboard>
              <PackageManagement />
            </Dashboard>
          }
        />
        <Route
          path="dashboard/log"
          element={
            <Dashboard>
              <AuditLog page={page} setPage={setPage} />
            </Dashboard>
          }
        />
        <Route
          path="dashboard/system_dashboard"
          element={
            <Dashboard well={0.125}>
              <SystemDashboard />
            </Dashboard>
          }
        />
        <Route path="logout" element={<Logout />} />
      </>
    )
  );

  return <RouterProvider router={router} />;
}
