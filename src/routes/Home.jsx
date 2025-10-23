import { Link, Navigate, Outlet } from "react-router";

const Home = () => {
  const token = localStorage.getItem("token");
  return token ? (
    <Navigate to="/home" />
  ) : (
    <>
      <div className="grid grid-rows-[auto_1fr_auto] min-h-lvh w-full text-black bg-amber-50">
        <header className="bg-amber-50">
          <div className="flex justify-between items-center p-5 max-w-7xl md:px-12 lg:mx-auto">
            <Link to="/" className="font-lora font-bold text-3xl">
              Easium
            </Link>
            <nav className="flex items-center gap-3">
              <Link to="sign-in" className="max-sm:hidden mr-3" viewTransition>
                Sign in
              </Link>
              <Link to="sign-up" className="btn" viewTransition>
                Get started
              </Link>
            </nav>
          </div>
          <hr />
        </header>
        <section className="flex flex-col justify-center items-start px-5 pt-16 gap-8  md:px-12 max-w-7xl xl:w-7xl lg:mx-auto">
          <h1 className="font-lora text-6xl sm:mr-64 md:mr-96 md:text-[6.75rem]">
            <span className="block">Human</span>
            <span>stories &amp; ideas</span>
          </h1>
          <p className="text-2xl">
            A place to read, write, and deepen your understanding
          </p>
          <Link
            to="sign-up"
            className="btn px-11 text-lg  hover:opacity-80 transition-all"
            viewTransition
          >
            Start reading
          </Link>
        </section>
        <hr />
        <footer className="text-xs flex gap-4 py-6.5 px-5 md:px-12 lg:justify-center bg-amber-50">
          <Link to="#">About</Link>
          <Link to="#">Help</Link>
          <Link to="#">Terms</Link>
          <Link to="#">Privacy</Link>
        </footer>
      </div>
      <Outlet />
    </>
  );
};

export default Home;
