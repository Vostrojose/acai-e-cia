type Props = {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}

export default function Button({ children, onClick, variant = 'primary' }: Props) {
  const styles = {
    base: {
      padding: '12px 16px',
      borderRadius: 8,
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
    },

    primary: {
      background: '#3d7a07dd',
      color: '#fff',
    },

    secondary: {
      background: '#333',
      color: '#fff',
    },

    danger: {
      background: '#f44336',
      color: '#fff',
    },
  }

  return (
    <button
      onClick={onClick}
      style={{
        ...styles.base,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}