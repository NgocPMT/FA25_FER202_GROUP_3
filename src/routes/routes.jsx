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
import Library from "./Library";
import Read from "./Read";
import Articles from "../components/Articles";
import EditProfile from "./EditProfile"
import Articles from "../components/Articles"; import Following from "./Following";
import FollowingList from "./FollowingList";
import FollowersList from "./FollowersList";

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
        element: <Articles />
      },

      {
        path: "/search=:keyword",
        element: <HomeDashboard />,
      },
      {
        path: "/posts/:slug",
        element: <Read />,
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
        path: "/profile/:username?",
        element: (
            <Profile />
        ),
      },
      {
        path: "/profile/edit",
        element: (
          <ProtectedRoute>
            <EditProfile />
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
      {
        path: "/library",
        element: (
          <ProtectedRoute>
            <Library />
          </ProtectedRoute>
        ),
      },
      {
        path: "/following",
        element: (
          <ProtectedRoute>
            <Following />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <FollowingList />,
          },
          {
            path: "followings",
            element: <FollowingList />,
          },
          {
            path: "followers",
            element: <FollowersList />,
          },
        ],
      },

    ],
  },
];

export default routes;
