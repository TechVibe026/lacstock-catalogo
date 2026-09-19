import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useSearchParams,
} from 'react-router-dom'

import {
  Check,
  Search,
  Share2,
  SlidersHorizontal,
  X,
} from 'lucide-react'

import TextReveal from './TextReveal'
import ProductCard from './ProductCard'
import FilterPanel from './FilterPanel'
import Reveal from './Reveal'

import {
  produtos as produtosLocais,
} from '../data/produtos'

import { supabase } from '../lib/supabase'

const categorias = [
  'Todos',
  'Roupas',
  'Tênis',
  'Bonés',
  'Acessórios',
]

const precoPadrao = 1000

function Catalogo() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams()

  const [produtosSupabase, setProdutosSupabase] =
    useState([])

  const [carregando, setCarregando] =
    useState(true)

  const [erroCatalogo, setErroCatalogo] =
    useState('')

  const [painelAberto, setPainelAberto] =
    useState(false)

  const [linkCopiado, setLinkCopiado] =
    useState(false)

  useEffect(() => {
    const carregarProdutosSupabase = async () => {
      setCarregando(true)
      setErroCatalogo('')

      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('disponivel', true)
        .order('created_at', {
          ascending: false,
        })

      if (error) {
        console.error(
          'Erro ao carregar catálogo:',
          error,
        )

        setErroCatalogo(
          'Não foi possível carregar os novos produtos.',
        )

        setCarregando(false)
        return
      }

      setProdutosSupabase(data ?? [])
      setCarregando(false)
    }

    carregarProdutosSupabase()
  }, [])

  const produtos = useMemo(() => {
    const produtosLocaisDisponiveis =
      produtosLocais.filter(
        (produto) => produto.disponivel,
      )

    return [
      ...produtosSupabase,
      ...produtosLocaisDisponiveis,
    ]
  }, [produtosSupabase])

  const busca =
    searchParams.get('busca') || ''

  const categoriaAtiva =
    searchParams.get('categoria') || 'Todos'

  const filtros = {
    marcas: searchParams.getAll('marca'),

    tamanhos:
      searchParams.getAll('tamanho'),

    cores:
      searchParams.getAll('cor'),

    precoMaximo: Number(
      searchParams.get('preco') ||
        precoPadrao,
    ),
  }

  const atualizarParametros = (
    alteracoes,
  ) => {
    const novosParametros =
      new URLSearchParams(searchParams)

    Object.entries(alteracoes).forEach(
      ([chave, valor]) => {
        novosParametros.delete(chave)

        if (Array.isArray(valor)) {
          valor.forEach((item) => {
            novosParametros.append(
              chave,
              item,
            )
          })

          return
        }

        if (
          valor !== '' &&
          valor !== null &&
          valor !== undefined
        ) {
          novosParametros.set(
            chave,
            valor,
          )
        }
      },
    )

    setSearchParams(
      novosParametros,
      {
        replace: true,
      },
    )
  }

  const setFiltros = (novoEstado) => {
    const estadoAtual = {
      marcas: filtros.marcas,
      tamanhos: filtros.tamanhos,
      cores: filtros.cores,
      precoMaximo:
        filtros.precoMaximo,
    }

    const resultado =
      typeof novoEstado === 'function'
        ? novoEstado(estadoAtual)
        : novoEstado

    atualizarParametros({
      marca: resultado.marcas,
      tamanho: resultado.tamanhos,
      cor: resultado.cores,

      preco:
        resultado.precoMaximo <
        precoPadrao
          ? resultado.precoMaximo
          : '',
    })
  }

  const quantidadeFiltros =
    filtros.marcas.length +
    filtros.tamanhos.length +
    filtros.cores.length +
    (filtros.precoMaximo <
    precoPadrao
      ? 1
      : 0)

  const produtosFiltrados =
    useMemo(() => {
      const termo =
        busca.trim().toLowerCase()

      return produtos.filter(
        (produto) => {
          const categoria =
            produto.categoria || ''

          const subcategoria =
            produto.subcategoria || ''

          const nome =
            produto.nome || ''

          const marca =
            produto.marca || ''

          const cores =
            Array.isArray(produto.cores)
              ? produto.cores
              : []

          const tamanhos =
            Array.isArray(
              produto.tamanhos,
            )
              ? produto.tamanhos
              : []

          const correspondeCategoria =
            categoriaAtiva ===
              'Todos' ||
            categoria ===
              categoriaAtiva

          const correspondeBusca =
            termo === '' ||
            nome
              .toLowerCase()
              .includes(termo) ||
            marca
              .toLowerCase()
              .includes(termo) ||
            categoria
              .toLowerCase()
              .includes(termo) ||
            subcategoria
              .toLowerCase()
              .includes(termo) ||
            cores.some((cor) =>
              String(cor)
                .toLowerCase()
                .includes(termo),
            ) ||
            tamanhos.some(
              (tamanho) =>
                String(tamanho)
                  .toLowerCase()
                  .includes(termo),
            )

          const correspondeMarca =
            filtros.marcas.length ===
              0 ||
            filtros.marcas.includes(
              marca,
            )

          const correspondeTamanho =
            filtros.tamanhos.length ===
              0 ||
            filtros.tamanhos.some(
              (tamanho) =>
                tamanhos.includes(
                  tamanho,
                ),
            )

          const correspondeCor =
            filtros.cores.length ===
              0 ||
            filtros.cores.some(
              (cor) =>
                cores.includes(cor),
            )

          const correspondePreco =
            Number(produto.preco) <=
            filtros.precoMaximo

          return (
            correspondeCategoria &&
            correspondeBusca &&
            correspondeMarca &&
            correspondeTamanho &&
            correspondeCor &&
            correspondePreco
          )
        },
      )
    }, [
      produtos,
      busca,
      categoriaAtiva,
      filtros.marcas,
      filtros.tamanhos,
      filtros.cores,
      filtros.precoMaximo,
    ])

  const limparFiltros = () => {
    atualizarParametros({
      marca: [],
      tamanho: [],
      cor: [],
      preco: '',
    })
  }

  const limparTudo = () => {
    setSearchParams(
      {},
      {
        replace: true,
      },
    )
  }

  const compartilharSelecao =
    async () => {
      const url =
        window.location.href

      const dadosCompartilhamento = {
        title: 'LacStock',
        text: 'Confira essa seleção da LacStock:',
        url,
      }

      try {
        if (navigator.share) {
          await navigator.share(
            dadosCompartilhamento,
          )

          return
        }

        await navigator.clipboard.writeText(
          url,
        )

        setLinkCopiado(true)

        setTimeout(() => {
          setLinkCopiado(false)
        }, 2200)
      } catch (erro) {
        if (
          erro.name !==
          'AbortError'
        ) {
          console.error(
            'Erro ao compartilhar:',
            erro,
          )
        }
      }
    }

  return (
    <>
      <section
        className="catalog"
        id="catalogo"
      >
        <Reveal direction="left">
          <div className="catalog__header">
            <div>
              <span className="catalog__eyebrow">
                <TextReveal
                  delay={100}
                  speed={80}
                >
                  CATÁLOGO
                </TextReveal>
              </span>

              <h2>
                <TextReveal
                  delay={650}
                  speed={55}
                >
                  Explore a LacStock
                </TextReveal>
              </h2>
            </div>

            <span className="catalog__count">
              {produtosFiltrados.length}{' '}
              {produtosFiltrados.length ===
              1
                ? 'produto'
                : 'produtos'}
            </span>
          </div>
        </Reveal>

        <Reveal direction="left">
          <div className="catalog__tools">
            <label className="catalog__search">
              <Search
                size={19}
                strokeWidth={1.7}
              />

              <input
                type="search"
                placeholder="Buscar produto, marca, tamanho..."
                value={busca}
                onChange={(event) =>
                  atualizarParametros({
                    busca:
                      event.target
                        .value,
                  })
                }
              />

              {busca && (
                <button
                  type="button"
                  className="catalog__clear-search"
                  onClick={() =>
                    atualizarParametros({
                      busca: '',
                    })
                  }
                  aria-label="Limpar busca"
                >
                  <X
                    size={17}
                    strokeWidth={1.7}
                  />
                </button>
              )}
            </label>

            <button
              type="button"
              className="catalog__filter-button"
              onClick={() =>
                setPainelAberto(true)
              }
            >
              <SlidersHorizontal
                size={18}
                strokeWidth={1.7}
              />

              Filtros

              {quantidadeFiltros >
                0 && (
                <span className="catalog__filter-count">
                  {quantidadeFiltros}
                </span>
              )}
            </button>
          </div>
        </Reveal>

        <Reveal
          direction="left"
          delay={200}
        >
          <nav
            className="catalog__categories"
            aria-label="Categorias"
          >
            {categorias.map(
              (categoria) => (
                <button
                  key={categoria}
                  type="button"
                  className={
                    categoriaAtiva ===
                    categoria
                      ? 'catalog__category catalog__category--active'
                      : 'catalog__category'
                  }
                  onClick={() =>
                    atualizarParametros({
                      categoria:
                        categoria ===
                        'Todos'
                          ? ''
                          : categoria,
                    })
                  }
                >
                  {categoria}
                </button>
              ),
            )}
          </nav>
        </Reveal>

        {carregando && (
          <div className="catalog__empty">
            <span>CARREGANDO</span>

            <h3>
              Carregando produtos...
            </h3>
          </div>
        )}

        {erroCatalogo && (
          <p
            style={{
              margin: '20px 0',
              fontSize: '14px',
            }}
          >
            {erroCatalogo}
          </p>
        )}

        {!carregando &&
          produtosFiltrados.length >
            0 && (
            <Reveal
              direction="left"
              delay={450}
            >
              <div className="catalog__share">
                <span>
                  Encontrou o que
                  procurava?
                </span>

                <button
                  type="button"
                  onClick={
                    compartilharSelecao
                  }
                  className={
                    linkCopiado
                      ? 'catalog__share-button catalog__share-button--success'
                      : 'catalog__share-button'
                  }
                >
                  {linkCopiado ? (
                    <>
                      <Check
                        size={17}
                        strokeWidth={
                          1.8
                        }
                      />
                      Link copiado
                    </>
                  ) : (
                    <>
                      <Share2
                        size={17}
                        strokeWidth={
                          1.8
                        }
                      />
                      Compartilhar
                      seleção
                    </>
                  )}
                </button>
              </div>
            </Reveal>
          )}

        {!carregando &&
        produtosFiltrados.length >
          0 ? (
          <div className="catalog__grid">
            {produtosFiltrados.map(
              (produto, index) => {
                const posicaoNaLinha =
                  index % 3

                return (
                  <Reveal
                    key={`${produto.slug}-${produto.id}`}
                    direction="left"
                    delay={
                      posicaoNaLinha *
                      220
                    }
                  >
                    <ProductCard
                      produto={produto}
                    />
                  </Reveal>
                )
              },
            )}
          </div>
        ) : (
          !carregando && (
            <div className="catalog__empty">
              <span>
                NENHUM RESULTADO
              </span>

              <h3>
                Não encontramos essa
                combinação.
              </h3>

              <p>
                Tente remover algum
                filtro ou explorar
                outras opções.
              </p>

              <button
                type="button"
                onClick={limparTudo}
              >
                Limpar busca e filtros
              </button>
            </div>
          )
        )}
      </section>

      <FilterPanel
        aberto={painelAberto}
        onFechar={() =>
          setPainelAberto(false)
        }
        filtros={filtros}
        setFiltros={setFiltros}
        onLimpar={limparFiltros}
      />
    </>
  )
}

export default Catalogo