import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import routes from "./routes/routes";
import { LoaderProvider } from "./context/LoaderContext";
import LoaderWrapper from "./components/LoaderWrapper";

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoaderProvider>
      <LoaderWrapper>
        <RouterProvider router={router} />
      </LoaderWrapper>
    </LoaderProvider>
  </StrictMode>
);
