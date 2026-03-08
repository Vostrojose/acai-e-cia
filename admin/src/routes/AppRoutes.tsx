import { Routes, Route } from "react-router-dom"

import Dashboard from "../pages/Dashboard"
import Produtos from "../pages/Produtos"
import Pedidos from "../pages/Pedidos"
import Cozinha from "../pages/Cozinha"
import Login from "../pages/Login"

import PrivateRoute from "./PrivateRoute"

export default function AppRoutes() {

  return (

    <Routes>

      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
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
        path="/pedidos"
        element={
          <PrivateRoute>
            <Pedidos />
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

    </Routes>

  )
}