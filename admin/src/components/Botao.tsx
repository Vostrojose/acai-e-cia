// src/components/Botao.tsx
export default function Botao({ children, onClick, cor, type }: any) {
  const estilo = {
    padding: "10px 15px",
    borderRadius: 8,
    border: "none",
    background: cor || "#333",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background 0.3s"
  }

  return (
    <button
      type={type || "button"}
      onClick={onClick}
      style={estilo}
      onMouseOver={(e) => (e.currentTarget.style.background = "#555")}
      onMouseOut={(e) => (e.currentTarget.style.background = cor || "#333")}
    >
      {children}
    </button>
  )
}
