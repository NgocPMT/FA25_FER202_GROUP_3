import ReadOnlyContent from "@/components/ReadOnlyContent";
import { useParams } from "react-router";

const Read = () => {
  const { slug } = useParams();
  return <ReadOnlyContent slug={slug} />;
};

export default Read;
