import { Navigate, useParams } from "@/lib/router-compat";

export default function CategoryDetail() {
  const { slug } = useParams();
  return <Navigate to={`/categories?cat=${slug}`} replace />;
}
