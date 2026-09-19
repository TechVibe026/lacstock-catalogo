import { useEffect, useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import lacstockLogo from '../assets/lacstock-logo.png'

const categorias = [
  'Todos',
  'Novidades',
  'Importados',
  'Roupas',
  'Tênis',
  'Bonés',
  'Acessórios',
]

function Header() {
  const [menuAberto, setMenuAberto] = useState(false)

  const [headerVisivel, setHeaderVisivel] = useState(true)

useEffect(() => {
  let ultimaPosicao = window.scrollY

  const controlarHeader = () => {
    const posicaoAtual = window.scrollY

    if (menuAberto) {
      setHeaderVisivel(true)
      ultimaPosicao = posicaoAtual
      return
    }

    if (posicaoAtual < 80) {
      setHeaderVisivel(true)
    } else if (posicaoAtual > ultimaPosicao) {
      setHeaderVisivel(false)
    } else if (posicaoAtual < ultimaPosicao) {
      setHeaderVisivel(true)
    }

    ultimaPosicao = posicaoAtual
  }

  window.addEventListener('scroll', controlarHeader, {
    passive: true,
  })

  return () => {
    window.removeEventListener('scroll', controlarHeader)
  }
}, [menuAberto])

  const navigate = useNavigate()

  const selecionarCategoria = (categoria) => {
    if (categoria === 'Todos') {
      navigate('/#catalogo')
    } else {
      navigate(
        `/?categoria=${encodeURIComponent(categoria)}#catalogo`,
      )
    }

    setMenuAberto(false)

    setTimeout(() => {
      document
        .getElementById('catalogo')
        ?.scrollIntoView({
          behavior: 'smooth',
        })
    }, 50)
  }

  return (
    <header
  className={
    headerVisivel
      ? 'header header--visible'
      : 'header header--hidden'
  }
>
      <div className="header__container">

        <button
          type="button"
          className="header__icon header__menu"
          aria-label={
            menuAberto
              ? 'Fechar menu'
              : 'Abrir menu'
          }
          aria-expanded={menuAberto}
          onClick={() =>
            setMenuAberto((aberto) => !aberto)
          }
        >
          {menuAberto ? (
            <X size={23} strokeWidth={1.8} />
          ) : (
            <Menu size={23} strokeWidth={1.8} />
          )}
        </button>

        <a
          href="/"
          className="header__brand"
          aria-label="LacStock Loja"
        >
          <img
            src={lacstockLogo}
            alt="LacStock Loja"
            className="header__logo"
          />
        </a>

        <div className="header__actions">
          <button
            type="button"
            className="header__icon"
            aria-label="Pesquisar"
          >
            <Search size={21} strokeWidth={1.8} />
          </button>
        </div>

      </div>

      {menuAberto && (
        <nav
          className="header__mobile-menu"
          aria-label="Categorias"
        >
          {categorias.map((categoria) => (
            <button
              key={categoria}
              type="button"
              onClick={() =>
                selecionarCategoria(categoria)
              }
            >
              {categoria}
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}

export default Header