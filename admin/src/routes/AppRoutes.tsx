import { Routes, Route } from 'react-router-dom'

import Dashboard from '../pages/Dashboard'
import Produtos from '../pages/Produtos'
import Pedidos from '../pages/Pedidos'
import Cozinha from '../pages/Cozinha'
import Auditoria from '../pages/Auditoria'
import Login from '../pages/Login'

// 🔥 NOVA TELA DE ADICIONAIS
import Adicionais from '../pages/Adicionais'

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

      {/* 🔥 NOVA ROTA ADICIONAIS */}
      <Route
        path="/produtos/:id/adicionais"
        element={
          <PrivateRoute>
            <Adicionais />
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
      {/* AUDITORIA                 */}
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
