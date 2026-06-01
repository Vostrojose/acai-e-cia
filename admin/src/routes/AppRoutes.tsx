import { Routes, Route } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import Produtos from '../pages/Produtos'
import Pedidos from '../pages/Pedidos'
import Cozinha from '../pages/Cozinha'
import Auditoria from '../pages/Auditoria'
import Login from '../pages/Login'
import ChangePassword from '../pages/ChangePassword'
import Clientes from '../pages/Clientes'
import DashboardFinanceiro from '../pages/DashboardFinanceiro'
import Adicionais from '../pages/Adicionais'
import Variacoes from '../pages/Variacoes'
import PrivateRoute from './PrivateRoute'
import Fiados from '../pages/Fiados'
import AuditoriaPagamentos from '../pages/AuditoriaPagamentos'
import BannerAcompanhamento from '../pages/BannerAcompanhamento'
import ProdutoBalcao from '../pages/ProdutoBalcao'
import Balcao from '../pages/Balcao'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Cozinha />
          </PrivateRoute>
        }
      />
      <Route
        path="/cozinha"
        element={
          <PrivateRoute>
            <Cozinha />
          </PrivateRoute>
        }
      />
      <Route
        path="/produtos"
        element={
          <PrivateRoute>
            <Produtos />
          </PrivateRoute>
        }
      />
      <Route
        path="/produtos/:id/adicionais"
        element={
          <PrivateRoute>
            <Adicionais />
          </PrivateRoute>
        }
      />
      <Route
        path="/produtos/:id/variacoes"
        element={
          <PrivateRoute>
            <Variacoes />
          </PrivateRoute>
        }
      />
      <Route
        path="/pedidos"
        element={
          <PrivateRoute>
            <Pedidos />
          </PrivateRoute>
        }
      />
      <Route
        path="/fiados"
        element={
          <PrivateRoute>
            <Fiados />
          </PrivateRoute>
        }
      />
      <Route
        path="/auditoria"
        element={
          <PrivateRoute>
            <Auditoria />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <PrivateRoute>
            <Clientes />
          </PrivateRoute>
        }
      />

      <Route
        path="/financeiro"
        element={
          <PrivateRoute>
            <DashboardFinanceiro />
          </PrivateRoute>
        }
      />
      <Route
        path="/auditoria-pagamentos"
        element={
          <PrivateRoute>
            <AuditoriaPagamentos />
          </PrivateRoute>
        }
      />
      <Route
        path="/banner-acompanhamento"
        element={
          <PrivateRoute>
            <BannerAcompanhamento />
          </PrivateRoute>
        }
      />
      <Route
        path="/balcao"
        element={
          <PrivateRoute>
            <Balcao />
          </PrivateRoute>
        }
      />

      <Route
        path="/balcao/produto/:id"
        element={
          <PrivateRoute>
            <ProdutoBalcao />
          </PrivateRoute>
        }
      />

      <Route
        path="/balcao/item/:uid"
        element={
          <PrivateRoute>
            <ProdutoBalcao />
          </PrivateRoute>
        }
      />

      <Route path="/change-password" element={<ChangePassword />} />
    </Routes>
  )
}
