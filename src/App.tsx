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

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Home />} />
      <Route path="user/create" element={<CreateUser />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="logout" element={<Logout />} />
    </>
  )
);

export default function App() {
  return <RouterProvider router={router} />;
}
