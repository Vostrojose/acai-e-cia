import { useEffect, useState } from 'react'
import axios from 'axios'

interface Propaganda {
  id: string
  nome: string
  tipo: string
  arquivo: string
  duracao: number
  ativo: boolean
}

const API_URL = 'https://api.acaiecompanhia.com.br'

export default function Propagandas() {
  const [propagandas, setPropagandas] = useState<Propaganda[]>([])

  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('IMAGEM')
  const [duracao, setDuracao] = useState(15)

  const [arquivo, setArquivo] = useState<File | null>(null)

  async function carregar() {
    const response = await axios.get(
      `${API_URL}/api/propagandas`,
    )

    setPropagandas(response.data.data)
  }

  async function remover(id: string) {
    const confirmar = confirm(
      'Deseja realmente excluir esta propaganda?',
    )

    if (!confirmar) {
      return
    }

    try {
      await axios.delete(
        `${API_URL}/api/propagandas/${id}`,
      )

      await carregar()

      alert('Propaganda removida')
    } catch (error) {
      console.error(error)

      alert('Erro ao remover propaganda')
    }
  }

  async function salvar() {
    try {
      if (!nome.trim()) {
        alert('Informe o nome da propaganda')
        return
      }

      if (!arquivo) {
        alert('Selecione um arquivo')
        return
      }

      const formData = new FormData()

      formData.append('arquivo', arquivo)

      const upload = await axios.post(
        `${API_URL}/api/propagandas/upload`,
        formData,
      )

      await axios.post(
        `${API_URL}/api/propagandas`,
        {
          nome,
          tipo,
          duracao,
          arquivo: upload.data.arquivo,
        },
      )

      setNome('')
      setTipo('IMAGEM')
      setDuracao(15)
      setArquivo(null)

      await carregar()

      alert('Propaganda cadastrada')
    } catch (error) {
      console.error(error)

      alert('Erro ao cadastrar propaganda')
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h1>Propagandas</h1>

      <div
        style={{
          border: '1px solid #ddd',
          padding: 20,
          marginBottom: 20,
          borderRadius: 8,
        }}
      >
        <h2>Nova Propaganda</h2>

        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <br />
        <br />

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
        >
          <option value="IMAGEM">
            IMAGEM
          </option>

          <option value="VIDEO">
            VIDEO
          </option>
        </select>

        <br />
        <br />

        <input
          type="number"
          value={duracao}
          onChange={(e) =>
            setDuracao(
              Number(e.target.value),
            )
          }
        />

        <br />
        <br />

        <input
          type="file"
          onChange={(e) =>
            setArquivo(
              e.target.files?.[0] ?? null,
            )
          }
        />

        {arquivo && (
          <>
            <br />
            <br />

            <p>
              Arquivo selecionado:{' '}
              <strong>
                {arquivo.name}
              </strong>
            </p>
          </>
        )}

        <br />

        <button onClick={salvar}>
          Salvar
        </button>
      </div>

      <h2>Lista</h2>

      <table
        width="100%"
        style={{
          borderCollapse: 'collapse',
        }}
      >
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Preview</th>
            <th>Duração</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {propagandas.map((item) => (
            <tr key={item.id}>
              <td
                style={{
                  borderBottom:
                    '1px solid #eee',
                  padding: 10,
                }}
              >
                {item.nome}
              </td>

              <td
                style={{
                  borderBottom:
                    '1px solid #eee',
                  padding: 10,
                }}
              >
                {item.tipo}
              </td>

              <td
                style={{
                  borderBottom:
                    '1px solid #eee',
                  padding: 10,
                }}
              >
                {item.tipo ===
                'IMAGEM' ? (
                  <img
                    src={`${API_URL}/uploads/propagandas/${item.arquivo}`}
                    alt={item.nome}
                    style={{
                      width: 120,
                      borderRadius: 8,
                    }}
                  />
                ) : (
                  <video
                    src={`${API_URL}/uploads/propagandas/${item.arquivo}`}
                    style={{
                      width: 120,
                      borderRadius: 8,
                    }}
                    muted
                  />
                )}
              </td>

              <td
                style={{
                  borderBottom:
                    '1px solid #eee',
                  padding: 10,
                }}
              >
                {item.duracao}s
              </td>

              <td
                style={{
                  borderBottom:
                    '1px solid #eee',
                  padding: 10,
                }}
              >
                {item.ativo
                  ? '🟢 Ativa'
                  : '🔴 Inativa'}
              </td>

              <td
                style={{
                  borderBottom:
                    '1px solid #eee',
                  padding: 10,
                }}
              >
                <button
                  onClick={() =>
                    remover(item.id)
                  }
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}