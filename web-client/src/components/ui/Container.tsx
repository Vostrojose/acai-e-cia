export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        maxWidth: 600,
        margin: '0 auto',
        padding: 20,
        minHeight: '100vh',
        background: '#f9f9f9',
      }}
    >
      {children}
    </div>
  )
}
