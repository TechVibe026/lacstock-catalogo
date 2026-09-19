import { useEffect, useRef, useState } from 'react'

function Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}) {
  const elementoRef = useRef(null)
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const elemento = elementoRef.current

    if (!elemento) return

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisivel(true)
          observer.unobserve(elemento)
        }
      },
      {
        threshold: 0.12,
      },
    )

    observer.observe(elemento)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={elementoRef}
      className={[
        'reveal',
        `reveal--${direction}`,
        visivel ? 'reveal--visible' : '',
        className,
      ].join(' ')}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default Reveal