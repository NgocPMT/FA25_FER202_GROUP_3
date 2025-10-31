import { LucideLoaderCircle } from "lucide-react";

const Loader = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <LucideLoaderCircle className="size-14 animate-spin" />
    </div>
  );
};

export default Loader;
