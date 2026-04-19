import { useState } from "react";
import api from "../services/api";

export default function ProdutoForm({ onCreated }: any) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState(0);

  const [dias, setDias] = useState({
    disponivelSeg: true,
    disponivelTer: true,
    disponivelQua: true,
    disponivelQui: true,
    disponivelSex: true,
    disponivelSab: true,
    disponivelDom: true
  });

  function toggleDia(dia: string) {
    setDias({ ...dias, [dia]: !dias[dia as keyof typeof dias] });
  }

  async function salvar(e: any) {
    e.preventDefault();

    await api.post("/produtos", {
      nome,
      descricao,
      preco,
      ativo: true, // ✅ CORREÇÃO CRÍTICA
      ...dias
    });

    setNome("");
    setDescricao("");
    setPreco(0);

    onCreated();
  }

  return (
    <form onSubmit={salvar} style={{ marginTop: 20 }}>
      <h3>Novo Produto</h3>

      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />

      <br />

      <input
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

      <br />

      <input
        type="number"
        placeholder="Preço"
        value={preco}
        onChange={(e) => setPreco(Number(e.target.value))}
      />

      <h4>Dias disponíveis</h4>

      {Object.keys(dias).map((dia) => (
        <label key={dia} style={{ marginRight: 10 }}>
          <input
            type="checkbox"
            checked={dias[dia as keyof typeof dias]}
            onChange={() => toggleDia(dia)}
          />
          {dia.replace("disponivel", "")}
        </label>
      ))}

      <br />
      <button type="submit">Salvar</button>
    </form>
  );
}