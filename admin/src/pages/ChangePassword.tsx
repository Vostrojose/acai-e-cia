import { useState } from "react";
import axios from "axios";

export default function ChangePassword() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (novaSenha !== confirmarSenha) {
      alert("As senhas não coincidem");
      return;
    }

    const token = localStorage.getItem("token");

    try {
      setLoading(true);

      await axios.put(
        "http://localhost:3000/api/auth/change-password",
        {
          senhaAtual,
          novaSenha,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Senha alterada com sucesso!");

      localStorage.removeItem("token");
      window.location.href = "/login";

    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao alterar senha");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Alterar Senha</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Senha atual"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Nova senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirmar nova senha"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Alterar senha"}
        </button>
      </form>
    </div>
  );
}