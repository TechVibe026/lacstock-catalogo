import { X } from 'lucide-react'

function FilterPanel({
  aberto,
  onFechar,
  filtros,
  setFiltros,
  onLimpar,
}) {
  const marcas = [
    'Nike',
    'Jordan',
    'Lacoste',
    'Calvin Klein',
    'The North Face',
  ]

  const tamanhos = [
    'P',
    'M',
    'G',
    'GG',
    '39',
    '40',
    '41',
    '42',
    '43',
  ]

  const cores = [
    'Preto',
    'Branco',
    'Marrom',
    'Cinza',
  ]

  const toggleItem = (campo, valor) => {
    setFiltros((estadoAtual) => {
      const listaAtual = estadoAtual[campo]

      const novaLista = listaAtual.includes(valor)
        ? listaAtual.filter((item) => item !== valor)
        : [...listaAtual, valor]

      return {
        ...estadoAtual,
        [campo]: novaLista,
      }
    })
  }

  if (!aberto) return null

  return (
    <>
      <button
        className="filter-overlay"
        onClick={onFechar}
        aria-label="Fechar filtros"
      />

      <aside className="filter-panel">
        <div className="filter-panel__header">
          <div>
            <span>REFINE SUA BUSCA</span>
            <h2>Filtros</h2>
          </div>

          <button
            className="filter-panel__close"
            onClick={onFechar}
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </div>

        <div className="filter-group">
          <h3>Marca</h3>

          <div className="filter-options">
            {marcas.map((marca) => (
              <button
                key={marca}
                className={
                  filtros.marcas.includes(marca)
                    ? 'filter-option filter-option--active'
                    : 'filter-option'
                }
                onClick={() =>
                  toggleItem('marcas', marca)
                }
              >
                {marca}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3>Tamanho</h3>

          <div className="filter-options filter-options--sizes">
            {tamanhos.map((tamanho) => (
              <button
                key={tamanho}
                className={
                  filtros.tamanhos.includes(tamanho)
                    ? 'filter-option filter-option--active'
                    : 'filter-option'
                }
                onClick={() =>
                  toggleItem('tamanhos', tamanho)
                }
              >
                {tamanho}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3>Cor</h3>

          <div className="filter-options">
            {cores.map((cor) => (
              <button
                key={cor}
                className={
                  filtros.cores.includes(cor)
                    ? 'filter-option filter-option--active'
                    : 'filter-option'
                }
                onClick={() =>
                  toggleItem('cores', cor)
                }
              >
                {cor}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-price-heading">
            <h3>Preço máximo</h3>

            <strong>
              {Number(filtros.precoMaximo).toLocaleString(
                'pt-BR',
                {
                  style: 'currency',
                  currency: 'BRL',
                },
              )}
            </strong>
          </div>

          <input
            className="filter-range"
            type="range"
            min="100"
            max="1000"
            step="50"
            value={filtros.precoMaximo}
            onChange={(event) =>
              setFiltros((estadoAtual) => ({
                ...estadoAtual,
                precoMaximo: Number(event.target.value),
              }))
            }
          />
        </div>

        <div className="filter-panel__footer">
          <button
            className="filter-panel__clear"
            onClick={onLimpar}
          >
            Limpar filtros
          </button>

          <button
            className="filter-panel__apply"
            onClick={onFechar}
          >
            Ver resultados
          </button>
        </div>
      </aside>
    </>
  )
}

export default FilterPanel