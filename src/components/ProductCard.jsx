import { Heart, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function ProductCard({ produto }) {
  const precoFormatado = produto.preco.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

  return (
    <article className="product-card">
      <div className="product-card__image">
        <Link
          to={`/produto/${produto.slug}`}
          className="product-card__image-link"
          aria-label={`Ver ${produto.nome}`}
        >
          <img
            src={produto.imagem}
            alt={produto.nome}
            loading="lazy"
          />
        </Link>

        {produto.novidade && (
          <span className="product-card__badge">
            NOVO
          </span>
        )}

        <button
          type="button"
          className="product-card__favorite"
          aria-label={`Favoritar ${produto.nome}`}
        >
          <Heart size={19} strokeWidth={1.7} />
        </button>
      </div>

      <div className="product-card__content">
        <Link
          to={`/produto/${produto.slug}`}
          className="product-card__product-link"
        >
          <div className="product-card__heading">
            <div>
              <span className="product-card__brand">
                {produto.marca}
              </span>

              <h3>{produto.nome}</h3>
            </div>

            <ArrowUpRight
              className="product-card__arrow"
              size={18}
              strokeWidth={1.6}
            />
          </div>

          <div className="product-card__footer">
            <strong>{precoFormatado}</strong>

            <span>
              {produto.tamanhos.length} tamanhos
            </span>
          </div>
        </Link>
      </div>
    </article>
  )
}

export default ProductCard