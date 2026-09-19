import { ArrowUpRight } from 'lucide-react'
import heroImage from '../assets/hero/lacstock-hero.png'
import TextReveal from './TextReveal'

function Hero() {
  const scrollToCatalog = () => {
    document
      .getElementById('catalogo')
      ?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero">
      <div className="hero__image">
        <img
          src={heroImage}
          alt="LacStock"
        />

        <div className="hero__shade" />
      </div>

      <div className="hero__content">
      <span className="hero__eyebrow">
  <TextReveal speed={90}>
    LACSTOCK
  </TextReveal>
</span>

<h1>
  <TextReveal
    delay={650}
    speed={65}
  >
    Seu estilo.
  </TextReveal>

  <br />

  <TextReveal
    delay={1250}
    speed={65}
  >
    Sua escolha.
  </TextReveal>
</h1>

<p>
  <TextReveal
    delay={1900}
    speed={28}
  >
    Explore as peças disponíveis e encontre
  </TextReveal>

  <br />

  <TextReveal
    delay={2750}
    speed={28}
  >
    o que combina com você.
  </TextReveal>
</p>

<button
  className="hero__action"
  onClick={scrollToCatalog}
>
  <TextReveal
    delay={3350}
    speed={45}
  >
    Explorar catálogo
  </TextReveal>

  <ArrowUpRight
    className="hero__action-arrow"
    size={18}
  />
</button>
      </div>

      <span className="hero__instagram">
        @lacstockloja
      </span>
    </section>
  )
}

export default Hero