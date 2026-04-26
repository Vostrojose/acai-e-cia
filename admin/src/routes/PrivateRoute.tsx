import { ReactNode } from "react"

export default function PrivateRoute({ children }: { children: ReactNode }) {
  // 🔥 NÃO BLOQUEIA MAIS — login controlado por modal
  return <>{children}</>
}
