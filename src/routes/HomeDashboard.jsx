import Articles from "../components/Articles";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import SideNavbar from "../components/SideNavbar";
import "../css/HomeDashboard.css";

const HomeDashboard = () => {
  return (
    <div className="home-grid min-h-lvh">
      <div className="fixed top-0 left-0 right-0 h-14 bg-red-300 z-50">
        <Navbar />
      </div>

      <div className="fixed top-14 left-0 h-[calc(100%-56px)] w-60 border-r border-gray-200 bg-white p-4 bg-white overflow-y-auto">
        <SideNavbar />
      </div>

      <main className="pt-16 ml-60 mr-96 p-6">
        <Articles />
      </main>

      <div className="fixed top-14 right-0 h-[calc(100%-56px)] w-96 bg-blue-300 border-l p-4">
        <Sidebar />
      </div>
    </div>
  );
};

export default HomeDashboard;
