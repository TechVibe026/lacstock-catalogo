import { Navigate } from 'react-router-dom'

function AdminRoute({ children }) {
  const autenticado =
    localStorage.getItem('lacstock-admin') ===
    'autenticado'

  if (!autenticado) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    )
  }

  return children
}

export default AdminRoute