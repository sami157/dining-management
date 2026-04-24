import { Navigate } from 'react-router';
import useRole from '../hooks/useRole';
import Loading from './Loading';
import { isAdminRole } from '../utils/roles';

const AdminRoute = ({ children }) => {
  const { role, roleLoading } = useRole();

  if (roleLoading) {
    return <Loading />;
  }

  if (!isAdminRole(role)) {
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
};

export default AdminRoute;
