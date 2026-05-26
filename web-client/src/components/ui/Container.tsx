type Props = {
  children: React.ReactNode

  background?: string
}

export default function Container({
  children,
  background = '#f9f9f9',
}: Props) {

  return (
    <div
      style={{
        maxWidth: 600,

        margin: '0 auto',

        padding: 20,

        minHeight: '100vh',

        background,
      }}
    >
      {children}
    </div>
  )
}
