import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { App } from "./App";
import "./index.css";

// this import triggers the initial status checking
import "./store/apiStatusStore";

console.log("Initializing Trunk Admin Dashboard...");

const router = createHashRouter([
  {
    path: "*",
    element: <App />,
  },
]);

const rootElement = document.getElementById("root");

if (rootElement) {
  console.log("Mounting app to root element");

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
} else {
  console.error("Root element not found!");
  document.body.innerHTML =
    '<div style="color: red; padding: 20px;">Root element not found! Check your HTML structure.</div>';
}
