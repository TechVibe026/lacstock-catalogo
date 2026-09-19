import { Heart, Menu, Search } from 'lucide-react'

function Header() {
  return (
    <header className="header">
      <div className="header__container">
        <button className="header__icon header__menu" aria-label="Abrir menu">
          <Menu size={22} strokeWidth={1.8} />
        </button>

        <a href="/" className="header__brand">
          <span className="header__symbol">↗</span>

          <div>
            <strong>LacStock</strong>
            <span>@lacstockloja</span>
          </div>
        </a>

        <div className="header__actions">
          <button className="header__icon" aria-label="Pesquisar">
            <Search size={21} strokeWidth={1.8} />
          </button>

          <button className="header__icon" aria-label="Favoritos">
            <Heart size={21} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header