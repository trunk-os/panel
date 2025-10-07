import { NavLink } from "react-router";

import CenterForm from "../components/CenterForm.tsx";

export default function DashboardHome() {
  return (
    <CenterForm ceiling="medium">
      <div>Welcome to the Dashboard!</div>
      <div>
        <NavLink to="/dashboard/log">Audit Log</NavLink>
      </div>
      <div>
        <NavLink to="/dashboard/user">User Management</NavLink>
      </div>
      <div>
        <NavLink to="/dashboard/disk">Disk Management</NavLink>
      </div>
    </CenterForm>
  );
}
