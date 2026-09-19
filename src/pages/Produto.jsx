import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Check,
  Heart,
  Share2,
  X,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import Reveal from '../components/Reveal'
import { produtos } from '../data/produtos'

function Produto() {
  const { slug } = useParams()
  useEffect(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant',
  })
}, [slug])

  const produto = produtos.find(
    (item) => item.slug === slug,
  )

  const [tamanhoSelecionado, setTamanhoSelecionado] =
    useState('')

  const [corSelecionada, setCorSelecionada] =
    useState('')

  const [modalAberto, setModalAberto] =
    useState(false)

  if (!produto) {
    return (
      <main className="product-page product-page--not-found">
        <span>PRODUTO NÃO ENCONTRADO</span>

        <h1>Essa peça não está disponível.</h1>

        <Link to="/#catalogo">
          Voltar ao catálogo
        </Link>
      </main>
    )
  }

  const precoFormatado = produto.preco.toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    },
  )

  const podeDemonstrarInteresse =
    tamanhoSelecionado && corSelecionada

  const compartilharProduto = async () => {
    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title: produto.nome,
          text: `Confira ${produto.nome} na LacStock:`,
          url,
        })

        return
      }

      await navigator.clipboard.writeText(url)
    } catch (erro) {
      if (erro.name !== 'AbortError') {
        console.error(
          'Erro ao compartilhar produto:',
          erro,
        )
      }
    }
  }

  const abrirDemonstracao = () => {
    if (!podeDemonstrarInteresse) {
      return
    }

    setModalAberto(true)
  }

  return (
    <>
      <main className="product-page">
        <div className="product-page__top">
          <Link
            to="/#catalogo"
            className="product-page__back"
          >
            <ArrowLeft size={17} />
            Voltar ao catálogo
          </Link>
        </div>

        <div className="product-page__layout">
          <Reveal direction="left">
            <div className="product-page__visual">
              <img
                src={produto.imagem}
                alt={produto.nome}
              />

              {produto.novidade && (
                <span className="product-page__badge">
                  NOVO
                </span>
              )}
            </div>
          </Reveal>
            <Reveal direction="right" delay={180}>
          <div className="product-page__info">
            <div className="product-page__intro">
              <span className="product-page__brand">
                {produto.marca}
              </span>

              <h1>{produto.nome}</h1>

              <strong className="product-page__price">
                {precoFormatado}
              </strong>
            </div>

            <div className="product-page__section">
              <span className="product-page__label">
                Tamanho
              </span>

              <div className="product-page__options">
                {produto.tamanhos.map((tamanho) => (
                  <button
                    type="button"
                    key={tamanho}
                    className={
                      tamanhoSelecionado === tamanho
                        ? 'product-page__option product-page__option--active'
                        : 'product-page__option'
                    }
                    onClick={() =>
                      setTamanhoSelecionado(tamanho)
                    }
                  >
                    {tamanho}
                  </button>
                ))}
              </div>
            </div>

            <div className="product-page__section">
              <span className="product-page__label">
                Cor
              </span>

              <div className="product-page__options">
                {produto.cores.map((cor) => (
                  <button
                    type="button"
                    key={cor}
                    className={
                      corSelecionada === cor
                        ? 'product-page__option product-page__option--active'
                        : 'product-page__option'
                    }
                    onClick={() =>
                      setCorSelecionada(cor)
                    }
                  >
                    {cor}
                  </button>
                ))}
              </div>
            </div>

            <div className="product-page__availability">
              <span className="product-page__availability-dot" />
              Disponível
            </div>

            <div className="product-page__actions">
              <button
                type="button"
                className="product-page__interest"
                onClick={abrirDemonstracao}
                disabled={!podeDemonstrarInteresse}
              >
                Tenho interesse
              </button>

              <button
                type="button"
                className="product-page__action-icon"
                onClick={compartilharProduto}
                aria-label="Compartilhar produto"
              >
                <Share2 size={19} />
              </button>

              <button
                type="button"
                className="product-page__action-icon"
                aria-label="Favoritar produto"
              >
                <Heart size={19} />
              </button>
            </div>

            {!podeDemonstrarInteresse && (
              <p className="product-page__help">
                Selecione tamanho e cor para continuar.
              </p>
            )}
          </div>
          </Reveal>
        </div>
      </main>

      {modalAberto && (
        <div className="interest-modal">
          <button
            type="button"
            className="interest-modal__overlay"
            onClick={() => setModalAberto(false)}
            aria-label="Fechar demonstração"
          />

          <div className="interest-modal__content">
            <div className="interest-modal__top">
              <div>
                <span>DEMONSTRAÇÃO</span>
                <h2>Interesse enviado</h2>
              </div>

              <button
                type="button"
                className="interest-modal__close"
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
              >
                <X size={21} />
              </button>
            </div>

            <div className="interest-modal__status">
              <Check size={17} />
              Mensagem pronta para o atendimento
            </div>

            <div className="interest-modal__message">
              <span>Mensagem simulada</span>

              <p>
                Olá! Tenho interesse no{' '}
                <strong>{produto.nome}</strong>.
              </p>

              <p>
                Tamanho:{' '}
                <strong>{tamanhoSelecionado}</strong>
                <br />
                Cor: <strong>{corSelecionada}</strong>
              </p>

              <p>
                Vi pelo catálogo da LacStock.
              </p>
            </div>

            <p className="interest-modal__note">
              Demonstração do fluxo. Nenhuma mensagem
              real foi enviada.
            </p>

            <button
              type="button"
              className="interest-modal__finish"
              onClick={() => setModalAberto(false)}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default Produto