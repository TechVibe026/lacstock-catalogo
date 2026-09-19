import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Edit3,
  ImagePlus,
  LogOut,
  Package,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

import { supabase } from '../lib/supabase'

const produtoVazio = {
  nome: '',
  marca: '',
  categoria: 'Roupas',
  subcategoria: '',
  preco: '',
  cores: '',
  tamanhos: '',
  disponivel: true,
  novidade: false,
  importado: false,
  imagem: '',
}

function Admin() {
  const navigate = useNavigate()

  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [modalAberto, setModalAberto] =
    useState(false)

  const [produtoEditando, setProdutoEditando] =
    useState(null)

  const [form, setForm] =
    useState(produtoVazio)

  const [arquivoImagem, setArquivoImagem] =
    useState(null)

  const [previewImagem, setPreviewImagem] =
    useState('')

  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    carregarProdutos()
  }, [])

  useEffect(() => {
    if (modalAberto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [modalAberto])

  const carregarProdutos = async () => {
    setCarregando(true)
    setErro('')

    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(error)

      setErro(
        'Não foi possível carregar os produtos.',
      )

      setCarregando(false)
      return
    }

    setProdutos(data ?? [])
    setCarregando(false)
  }

  const abrirNovoProduto = () => {
    setProdutoEditando(null)
    setForm(produtoVazio)
    setArquivoImagem(null)
    setPreviewImagem('')
    setErro('')
    setMensagem('')
    setModalAberto(true)
  }

  const abrirEdicao = (produto) => {
    setProdutoEditando(produto)

    setForm({
      nome: produto.nome ?? '',
      marca: produto.marca ?? '',
      categoria:
        produto.categoria ?? 'Roupas',
      subcategoria:
        produto.subcategoria ?? '',
      preco: produto.preco ?? '',

      cores:
        produto.cores?.join(', ') ?? '',

      tamanhos:
        produto.tamanhos?.join(', ') ?? '',

      disponivel:
        produto.disponivel ?? true,

      novidade:
        produto.novidade ?? false,

      importado:
        produto.importado ?? false,

      imagem:
        produto.imagem ?? '',
    })

    setArquivoImagem(null)
    setPreviewImagem(produto.imagem ?? '')
    setErro('')
    setMensagem('')
    setModalAberto(true)
  }

  const fecharModal = () => {
    if (salvando) return

    if (
      previewImagem &&
      previewImagem.startsWith('blob:')
    ) {
      URL.revokeObjectURL(previewImagem)
    }

    setModalAberto(false)
    setProdutoEditando(null)
    setForm(produtoVazio)
    setArquivoImagem(null)
    setPreviewImagem('')
    setErro('')
  }

  const atualizarCampo = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target

    setForm((estadoAtual) => ({
      ...estadoAtual,

      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }))
  }

  const selecionarImagem = (event) => {
    const arquivo =
      event.target.files?.[0]

    if (!arquivo) return

    if (!arquivo.type.startsWith('image/')) {
      setErro(
        'Selecione um arquivo de imagem.',
      )

      return
    }

    const limite = 5 * 1024 * 1024

    if (arquivo.size > limite) {
      setErro(
        'A imagem deve ter no máximo 5 MB.',
      )

      return
    }

    if (
      previewImagem &&
      previewImagem.startsWith('blob:')
    ) {
      URL.revokeObjectURL(previewImagem)
    }

    setErro('')
    setArquivoImagem(arquivo)

    setPreviewImagem(
      URL.createObjectURL(arquivo),
    )
  }

  const criarSlug = (texto) =>
    texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

  const criarNomeArquivo = (arquivo) => {
    const extensao =
      arquivo.name
        .split('.')
        .pop()
        ?.toLowerCase() || 'jpg'

    return `${Date.now()}-${crypto.randomUUID()}.${extensao}`
  }

  const enviarImagem = async () => {
    if (!arquivoImagem) {
      return form.imagem || null
    }

    const nomeArquivo =
      criarNomeArquivo(arquivoImagem)

    const caminho =
      `catalogo/${nomeArquivo}`

    const {
      data: uploadData,
      error: uploadError,
    } = await supabase.storage
      .from('produtos')
      .upload(
        caminho,
        arquivoImagem,
        {
          cacheControl: '3600',
          upsert: false,
        },
      )

    if (uploadError) {
      throw uploadError
    }

    if (!uploadData?.path) {
      throw new Error(
        'Não foi possível identificar o caminho da imagem.',
      )
    }

    const { data: urlData } =
      supabase.storage
        .from('produtos')
        .getPublicUrl(uploadData.path)

    if (!urlData?.publicUrl) {
      throw new Error(
        'Não foi possível gerar a URL pública da imagem.',
      )
    }

    return urlData.publicUrl
  }

  const salvarProduto = async (event) => {
    event.preventDefault()

    setSalvando(true)
    setErro('')
    setMensagem('')

    try {
      const imagem =
        await enviarImagem()

      const slugBase =
        criarSlug(form.nome.trim())

      const slug = produtoEditando
        ? produtoEditando.slug || slugBase
        : `${slugBase}-${Date.now()}`

      const dadosProduto = {
        nome: form.nome.trim(),
        marca: form.marca.trim(),
        categoria: form.categoria,

        subcategoria:
          form.subcategoria.trim(),

        preco: Number(form.preco),

        cores: form.cores
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),

        tamanhos: form.tamanhos
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),

        disponivel: form.disponivel,
        novidade: form.novidade,
        importado: form.importado,
        imagem,
        slug,
      }

      if (produtoEditando) {
        const { error } = await supabase
          .from('produtos')
          .update(dadosProduto)
          .eq(
            'id',
            produtoEditando.id,
          )

        if (error) {
          throw error
        }

        setMensagem(
          'Produto atualizado com sucesso.',
        )
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert(dadosProduto)

        if (error) {
          throw error
        }

        setMensagem(
          'Produto cadastrado com sucesso.',
        )
      }

      await carregarProdutos()

      if (
        previewImagem &&
        previewImagem.startsWith('blob:')
      ) {
        URL.revokeObjectURL(
          previewImagem,
        )
      }

      setModalAberto(false)
      setProdutoEditando(null)
      setForm(produtoVazio)
      setArquivoImagem(null)
      setPreviewImagem('')
    } catch (error) {
      console.error(error)

      setErro(
        error?.message ||
          'Não foi possível salvar o produto.',
      )
    } finally {
      setSalvando(false)
    }
  }

  const excluirProduto = async (
    produto,
  ) => {
    const confirmou =
      window.confirm(
        `Deseja realmente excluir "${produto.nome}"?`,
      )

    if (!confirmou) return

    setErro('')
    setMensagem('')

    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', produto.id)

    if (error) {
      console.error(error)

      setErro(
        'Não foi possível excluir o produto.',
      )

      return
    }

    setProdutos((estadoAtual) =>
      estadoAtual.filter(
        (item) =>
          item.id !== produto.id,
      ),
    )

    setMensagem(
      'Produto excluído com sucesso.',
    )
  }

  const alternarDisponibilidade =
    async (produto) => {
      const novoValor =
        !produto.disponivel

      const { error } = await supabase
        .from('produtos')
        .update({
          disponivel: novoValor,
        })
        .eq('id', produto.id)

      if (error) {
        console.error(error)

        setErro(
          'Não foi possível alterar a disponibilidade.',
        )

        return
      }

      setProdutos((estadoAtual) =>
        estadoAtual.map((item) =>
          item.id === produto.id
            ? {
                ...item,
                disponivel: novoValor,
              }
            : item,
        ),
      )
    }

  const alternarImportado =
    async (produto) => {
      const novoValor =
        !produto.importado

      const { error } = await supabase
        .from('produtos')
        .update({
          importado: novoValor,
        })
        .eq('id', produto.id)

      if (error) {
        console.error(error)

        setErro(
          'Não foi possível alterar o tipo do produto.',
        )

        return
      }

      setProdutos((estadoAtual) =>
        estadoAtual.map((item) =>
          item.id === produto.id
            ? {
                ...item,
                importado: novoValor,
              }
            : item,
        ),
      )
    }

  const sair = () => {
    localStorage.removeItem(
      'lacstock-admin',
    )

    navigate('/admin/login')
  }

  const formatarPreco = (preco) =>
    Number(preco).toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL',
      },
    )

  return (
    <main className="admin-page">
      <section className="admin-container">
        <header className="admin-header">
          <div className="admin-header__text">
            <span className="admin-eyebrow">
              LACSTOCK
            </span>

            <h1>
              Painel administrativo
            </h1>

            <p>
              Gerencie os produtos
              disponíveis no catálogo.
            </p>
          </div>

          <div className="admin-header__actions">
            <button
              type="button"
              onClick={sair}
              className="admin-button admin-button--secondary"
            >
              <LogOut size={17} />
              Sair
            </button>

            <button
              type="button"
              onClick={abrirNovoProduto}
              className="admin-button admin-button--primary"
            >
              <Plus size={18} />
              Novo produto
            </button>
          </div>
        </header>

        {erro && !modalAberto && (
          <div className="admin-message admin-message--error">
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="admin-message admin-message--success">
            {mensagem}
          </div>
        )}

        <div className="admin-summary-grid">
          <Resumo
            titulo="Produtos"
            valor={produtos.length}
          />

          <Resumo
            titulo="Disponíveis"
            valor={
              produtos.filter(
                (produto) =>
                  produto.disponivel,
              ).length
            }
          />

          <Resumo
            titulo="Importados"
            valor={
              produtos.filter(
                (produto) =>
                  produto.importado,
              ).length
            }
          />
        </div>

        {carregando ? (
          <div className="admin-empty">
            <Package
              size={42}
              strokeWidth={1.4}
            />

            <h2>
              Carregando produtos...
            </h2>
          </div>
        ) : produtos.length === 0 ? (
          <div className="admin-empty">
            <Package
              size={42}
              strokeWidth={1.4}
            />

            <h2>
              Nenhum produto cadastrado
            </h2>

            <p>
              Cadastre o primeiro produto
              diretamente pelo painel.
            </p>

            <button
              type="button"
              onClick={abrirNovoProduto}
              className="admin-button admin-button--primary"
            >
              <Plus size={18} />
              Cadastrar produto
            </button>
          </div>
        ) : (
          <div className="admin-products">
            {produtos.map((produto) => (
              <article
                key={produto.id}
                className="admin-product-card"
              >
                <div className="admin-product-card__image">
                  {produto.imagem ? (
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                    />
                  ) : (
                    <Package
                      size={25}
                      strokeWidth={1.3}
                    />
                  )}
                </div>

                <div className="admin-product-card__info">
                  <small>
                    {produto.marca}
                  </small>

                  <h3>
                    {produto.nome}
                  </h3>

                  <strong>
                    {formatarPreco(
                      produto.preco,
                    )}
                  </strong>
                </div>

                <div className="admin-product-card__actions">
                  <button
                    type="button"
                    onClick={() =>
                      alternarDisponibilidade(
                        produto,
                      )
                    }
                    className={
                      produto.disponivel
                        ? 'admin-pill admin-pill--active'
                        : 'admin-pill'
                    }
                  >
                    {produto.disponivel
                      ? 'Disponível'
                      : 'Esgotado'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      alternarImportado(
                        produto,
                      )
                    }
                    className={
                      produto.importado
                        ? 'admin-pill admin-pill--active'
                        : 'admin-pill'
                    }
                  >
                    {produto.importado
                      ? 'Importado'
                      : 'Normal'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      abrirEdicao(
                        produto,
                      )
                    }
                    className="admin-icon-button"
                    aria-label={`Editar ${produto.nome}`}
                  >
                    <Edit3 size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      excluirProduto(
                        produto,
                      )
                    }
                    className="admin-icon-button admin-icon-button--danger"
                    aria-label={`Excluir ${produto.nome}`}
                  >
                    <Trash2
                      size={17}
                    />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {modalAberto && (
        <div className="admin-modal-overlay">
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
          >
            <header className="admin-modal__header">
              <div>
                <small className="admin-eyebrow">
                  LACSTOCK
                </small>

                <h2 id="admin-modal-title">
                  {produtoEditando
                    ? 'Editar produto'
                    : 'Novo produto'}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                className="admin-icon-button"
                disabled={salvando}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </header>

            <div className="admin-modal__body">
              {erro && (
                <div className="admin-message admin-message--error">
                  {erro}
                </div>
              )}

              <form
                onSubmit={salvarProduto}
                className="admin-form"
              >
                <label className="admin-field">
                  <span>
                    Foto do produto
                  </span>

                  <div className="admin-image-upload">
                    {previewImagem ? (
                      <img
                        src={
                          previewImagem
                        }
                        alt="Prévia do produto"
                      />
                    ) : (
                      <div className="admin-image-upload__empty">
                        <ImagePlus
                          size={36}
                          strokeWidth={
                            1.4
                          }
                        />

                        <span>
                          Nenhuma foto
                          selecionada
                        </span>
                      </div>
                    )}
                  </div>

                  <input
                    className="admin-file-input"
                    type="file"
                    accept="image/*"
                    onChange={
                      selecionarImagem
                    }
                  />

                  <small className="admin-field__help">
                    No celular, toque para
                    escolher uma foto da
                    galeria. Máximo 5 MB.
                  </small>
                </label>

                <Campo
                  label="Nome"
                  name="nome"
                  value={form.nome}
                  onChange={
                    atualizarCampo
                  }
                  required
                />

                <Campo
                  label="Marca"
                  name="marca"
                  value={form.marca}
                  onChange={
                    atualizarCampo
                  }
                  required
                />

                <div className="admin-form__grid">
                  <label className="admin-field">
                    <span>
                      Categoria
                    </span>

                    <select
                      name="categoria"
                      value={
                        form.categoria
                      }
                      onChange={
                        atualizarCampo
                      }
                    >
                      <option value="Roupas">
                        Roupas
                      </option>

                      <option value="Tênis">
                        Tênis
                      </option>

                      <option value="Bonés">
                        Bonés
                      </option>

                      <option value="Acessórios">
                        Acessórios
                      </option>
                    </select>
                  </label>

                  <Campo
                    label="Subcategoria"
                    name="subcategoria"
                    value={
                      form.subcategoria
                    }
                    onChange={
                      atualizarCampo
                    }
                    required
                  />
                </div>

                <Campo
                  label="Preço"
                  name="preco"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={form.preco}
                  onChange={
                    atualizarCampo
                  }
                  required
                />

                <Campo
                  label="Cores"
                  name="cores"
                  value={form.cores}
                  onChange={
                    atualizarCampo
                  }
                  placeholder="Preto, Branco, Cinza"
                  required
                />

                <Campo
                  label="Tamanhos"
                  name="tamanhos"
                  value={form.tamanhos}
                  onChange={
                    atualizarCampo
                  }
                  placeholder="P, M, G, GG"
                  required
                />

                <div className="admin-form__checkboxes">
                  <Checkbox
                    name="disponivel"
                    checked={
                      form.disponivel
                    }
                    onChange={
                      atualizarCampo
                    }
                    label="Disponível"
                  />

                  <Checkbox
                    name="importado"
                    checked={
                      form.importado
                    }
                    onChange={
                      atualizarCampo
                    }
                    label="Produto importado"
                  />

                  <Checkbox
                    name="novidade"
                    checked={
                      form.novidade
                    }
                    onChange={
                      atualizarCampo
                    }
                    label="Novidade"
                  />
                </div>

                <div className="admin-form__actions">
                  <button
                    type="button"
                    onClick={
                      fecharModal
                    }
                    disabled={salvando}
                    className="admin-button admin-button--secondary"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={salvando}
                    className="admin-button admin-button--primary"
                  >
                    {salvando
                      ? 'Salvando...'
                      : produtoEditando
                        ? 'Salvar alterações'
                        : 'Cadastrar produto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function Campo({
  label,
  ...propriedades
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>

      <input {...propriedades} />
    </label>
  )
}

function Checkbox({
  label,
  ...propriedades
}) {
  return (
    <label className="admin-checkbox">
      <input
        type="checkbox"
        {...propriedades}
      />

      <span>{label}</span>
    </label>
  )
}

function Resumo({
  titulo,
  valor,
}) {
  return (
    <div className="admin-summary">
      <small>{titulo}</small>

      <strong>{valor}</strong>
    </div>
  )
}

export default Admin