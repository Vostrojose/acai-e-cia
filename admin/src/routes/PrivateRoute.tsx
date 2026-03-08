import { Navigate } from "react-router-dom"

export default function PrivateRoute({ children }: any) {

  const token = localStorage.getItem("token")

  if (!token) {
    return <Navigate to="/login" />
  }

  return children
}