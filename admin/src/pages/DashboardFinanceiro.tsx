import { useEffect, useState } from "react";
import api from "../services/api";

export default function DashboardFinanceiro() {
  const [data, setData] = useState<any>(null);

  async function carregar() {
    const res = await api.get("/dashboard-financeiro");
    setData(res.data.data);
  }

  useEffect(() => {
    carregar();
  }, []);

  if (!data) return <p>Carregando...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>📊 Financeiro</h1>

      <p>Total Vendas: R$ {data.totalVendas.toFixed(2)}</p>
      <p>Total Pago: R$ {data.totalPago.toFixed(2)}</p>
      <p>Total Fiado: R$ {data.totalFiado.toFixed(2)}</p>
      <p>Total Crédito: R$ {data.totalCredito.toFixed(2)}</p>
    </div>
  );
}