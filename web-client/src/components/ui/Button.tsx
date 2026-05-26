type Props = {
  children: React.ReactNode
  onClick?: () => void

  disabled?: boolean

  variant?: 'primary' | 'secondary' | 'danger'
}

export default function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
}: Props) {

  const styles = {

    base: {
      padding: '12px 16px',
      borderRadius: 8,
      border: 'none',

      cursor: disabled
        ? 'not-allowed'
        : 'pointer',

      fontWeight: 'bold',

      opacity: disabled ? 0.6 : 1,

      transition: '0.2s',
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

      disabled={disabled}

      style={{
        ...styles.base,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}