import { Routes, Route } from 'react-router-dom'

import Dashboard from '../pages/Dashboard'
import Produtos from '../pages/Produtos'
import Pedidos from '../pages/Pedidos'
import Cozinha from '../pages/Cozinha'
import Auditoria from '../pages/Auditoria' // ✅ ADICIONADO
import Login from '../pages/Login'

import PrivateRoute from './PrivateRoute'

export default function AppRoutes() {
  return (
    <Routes>

      {/* ========================= */}
      {/* LOGIN (PÚBLICO)          */}
      {/* ========================= */}
      <Route path="/login" element={<Login />} />

      {/* ========================= */}
      {/* ROTA PRINCIPAL            */}
      {/* ========================= */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Cozinha />
          </PrivateRoute>
        }
      />

      {/* ========================= */}
      {/* COZINHA                   */}
      {/* ========================= */}
      <Route
        path="/cozinha"
        element={
          <PrivateRoute>
            <Cozinha />
          </PrivateRoute>
        }
      />

      {/* ========================= */}
      {/* PRODUTOS                  */}
      {/* ========================= */}
      <Route
        path="/produtos"
        element={
          <PrivateRoute>
            <Produtos />
          </PrivateRoute>
        }
      />

      {/* ========================= */}
      {/* PEDIDOS                   */}
      {/* ========================= */}
      <Route
        path="/pedidos"
        element={
          <PrivateRoute>
            <Pedidos />
          </PrivateRoute>
        }
      />

      {/* ========================= */}
      {/* AUDITORIA (NOVO)          */}
      {/* ========================= */}
      <Route
        path="/auditoria"
        element={
          <PrivateRoute>
            <Auditoria />
          </PrivateRoute>
        }
      />

      {/* ========================= */}
      {/* DASHBOARD                 */}
      {/* ========================= */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

    </Routes>
  )
}
