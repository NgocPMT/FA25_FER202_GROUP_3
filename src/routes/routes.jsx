import Layout from "./Layout";
import Home from "./Home";
import ErrorPage from "./ErrorPage";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import HomeDashboard from "./HomeDashboard";
import UsernameInputPage from "./UsernameInputPage";
import Profile from "./Profile";
import Stat from "./Stat";
import StatStories from "../components/StatStories";
import StatAudience from "../components/StatAudience";
import Notifications from "./Notification";
import Write from "./Write";
import StoriesPage from "./StoriesPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import Articles from "../components/Articles";

const routes = [
  {
    path: "/",
    element: <Home />,
    children: [
      {
        path: "sign-up",
        element: <SignUp />,
      },
      {
        path: "sign-in",
        element: <SignIn />,
      },
    ],
  },
  {
    path: "/write",
    element: (
      <ProtectedRoute>
        <Write />
      </ProtectedRoute>
    ),
  },
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/home",
        element: <HomeDashboard />,
      },

      {
        path: "/search",
        element: <Articles />,
      },

      {
        path: "/search=:keyword",
        element: <HomeDashboard />,
      },

      {
        path: "/username-input",
        element: (
          <ProtectedRoute>
            <UsernameInputPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/stat",
        element: (
          <ProtectedRoute>
            <Stat />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <StatStories />,
          },
          {
            path: "audience",
            element: <StatAudience />,
          },
        ],
      },
      {
        path: "/notifications",
        element: (
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        ),
      },

      {
        path: "/stories",
        element: (
          <ProtectedRoute>
            <StoriesPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
];

export default routes;
