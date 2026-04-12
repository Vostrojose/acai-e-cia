import { useEffect } from "react";
import { useCart } from "../context/CartContext";

export default function Sucesso() {
  const { limparCarrinho } = useCart();

  useEffect(() => {
    // 🔥 limpa carrinho após pagamento
    limparCarrinho();
  }, []);

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <h1>✅ Pagamento aprovado!</h1>
      <p>Seu pedido foi recebido com sucesso.</p>
    </div>
  );
}