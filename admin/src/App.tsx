import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Produtos from './pages/Produtos'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import Pagamento from './pages/Pagamento'


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/produtos"
          element={
            <ProtectedRoute>
              <Produtos />
            </ProtectedRoute>
          }
        />
        <Route
         path="/pagamento/:id" 
         element={
         <Pagamento />
         } 
         />
      </Routes>
    </BrowserRouter>
  )
}

