export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 12,
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      }}
    >
      {children}
    </div>
  )
}