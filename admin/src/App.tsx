import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'

import AdminIdleManager from './components/AdminIdleManager'

export default function App() {
  return (
    <BrowserRouter>

      <AdminIdleManager />

      <AppRoutes />

    </BrowserRouter>
  )
}