import { useLoader } from "@/context/LoaderContext";
import Loader from "./Loader";

const LoaderWrapper = ({ children }) => {
  const { loading } = useLoader();

  return (
    <>
      <Loader show={loading} />
      {children}
    </>
  );
};

export default LoaderWrapper;
