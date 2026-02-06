import { PropsWithChildren } from "react";
import { Spinner } from "./ui/spinner";

interface QueryResultProps {
  loading: boolean;
  error?: { message: string } | null;
  data?: any;
}

export const QueryResult: React.FC<PropsWithChildren<QueryResultProps>> = ({
  loading,
  error,
  data,
  children,
}): React.ReactElement<any, any> | null => {
  if (error) {
    return <p>ERROR: {error.message}</p>;
  }
  if (loading) {
    return (
      <Spinner />
    );
  }
  if (data) {
    return <>{children}</>;
  }
  return <p>Nothing to show...</p>;
};
