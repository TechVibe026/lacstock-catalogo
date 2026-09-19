function TextReveal({
  children,
  delay = 0,
  speed = 70,
  className = '',
}) {
  const texto = String(children)

  return (
    <span
      className={`text-reveal ${className}`}
      aria-label={texto}
    >
      {texto.split('').map((letra, index) => (
        <span
          key={`${letra}-${index}`}
          className="text-reveal__letter"
          aria-hidden="true"
          style={{
            animationDelay: `${delay + index * speed}ms`,
          }}
        >
          {letra === ' ' ? '\u00A0' : letra}
        </span>
      ))}
    </span>
  )
}

export default TextReveal