import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SideNavbar from "../components/SideNavbar";
import "../css/HomeDashboard.css";

const HomeDashboard = () => {
  return (
    <div className="home-grid min-h-lvh">
      <div className="navbar h-14 bg-red-300">
        <Navbar />
      </div>

      <div className="sidebar w-60 bg-yellow-300 border-r p-4">
        <Sidebar />
      </div>

      <main>
        <h1 className="text-2xl font-semibold mb-4">For you</h1>
        <div className="space-y-4">
          <div className="border p-4 rounded-lg shadow-sm">Article 1</div>
          <div className="border p-4 rounded-lg shadow-sm">Article 2</div>
        </div>
      </main>

      <div className="side-navbar w-96 bg-blue-300">
        <SideNavbar />
      </div>
    </div>
  );
};

export default HomeDashboard;
