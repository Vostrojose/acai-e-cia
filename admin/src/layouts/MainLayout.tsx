import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './MainLayout.css'

interface Props {
  children: ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Açaí & Cia</h2>

        <nav>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/pedidos">Pedidos</Link></li>
            <li><Link to="/produtos">Produtos</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="content">{children}</main>
    </div>
  )
}
