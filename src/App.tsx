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
import Dashboard from "./routes/Dashboard.tsx";
import Logout from "./routes/Logout.tsx";

import AuditLog from "./components/AuditLog.tsx";
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
              <div>Welcome to the Dashboard!</div>
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
          path="dashboard/log"
          element={
            <Dashboard>
              <AuditLog page={page} pageSetter={setPage} />
            </Dashboard>
          }
        />
        <Route path="logout" element={<Logout />} />
      </>
    )
  );

  return <RouterProvider router={router} />;
}
