import { useState } from "react";
import api from "../services/api";

export default function ProdutoForm({ onCreated, exigirLogin }: any) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [arquivoImagem, setArquivoImagem] = useState<File | null>(null);
  const [preco, setPreco] = useState(0);
  const [salvando, setSalvando] = useState(false);

  const [dias, setDias] = useState({
    disponivelSeg: true,
    disponivelTer: true,
    disponivelQua: true,
    disponivelQui: true,
    disponivelSex: true,
    disponivelSab: true,
    disponivelDom: true,
  });

  function toggleDia(dia: string) {
    setDias({
      ...dias,
      [dia]: !dias[dia as keyof typeof dias],
    });
  }

  async function salvar(e: any) {
    e.preventDefault();

    exigirLogin(async () => {
      try {
        setSalvando(true);

        const formData = new FormData();

        formData.append("nome", nome);
        formData.append("descricao", descricao);
        formData.append("categoria", categoria);
        formData.append("preco", String(preco));
        formData.append("ativo", "true");

        Object.entries(dias).forEach(([dia, disponivel]) => {
          formData.append(dia, String(disponivel));
        });

        if (arquivoImagem) {
          formData.append("arquivoImagem", arquivoImagem);
        }

        console.log("📦 ENVIANDO PRODUTO COM FORMDATA");

        await api.post("/produtos", formData);

        setNome("");
        setDescricao("");
        setCategoria("");
        setArquivoImagem(null);
        setPreco(0);

        setDias({
          disponivelSeg: true,
          disponivelTer: true,
          disponivelQua: true,
          disponivelQui: true,
          disponivelSex: true,
          disponivelSab: true,
          disponivelDom: true,
        });

        onCreated();
      } catch (error) {
        console.error("❌ Erro ao salvar produto:", error);
        alert("Não foi possível salvar o produto.");
      } finally {
        setSalvando(false);
      }
    });
  }

  return (
    <form onSubmit={salvar} style={{ marginTop: 20 }}>
      <h3>Novo Produto</h3>

      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        required
      />

      <br />

      <input
        placeholder="Descrição"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />

      <br />

      <input
        placeholder="Categoria — exemplo: Bebidas"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      />

      <br />

      <label>
        Imagem do produto:
        <br />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const arquivo = e.target.files?.[0] ?? null;
            setArquivoImagem(arquivo);
          }}
        />
      </label>

      {arquivoImagem && (
        <p style={{ fontSize: 13 }}>
          Imagem selecionada: {arquivoImagem.name}
        </p>
      )}

      <br />

      <input
        type="number"
        placeholder="Preço"
        min="0"
        step="0.01"
        value={preco}
        onChange={(e) => setPreco(Number(e.target.value))}
        required
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

      <button type="submit" disabled={salvando}>
        {salvando ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}