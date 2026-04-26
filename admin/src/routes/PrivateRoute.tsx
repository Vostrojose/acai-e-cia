import { Navigate } from "react-router-dom"
import { ReactNode } from "react"

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const token = sessionStorage.getItem("token")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}