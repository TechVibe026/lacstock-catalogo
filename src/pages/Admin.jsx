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
      const imagem = await enviarImagem()

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
          .eq('id', produtoEditando.id)

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
        URL.revokeObjectURL(previewImagem)
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

  const excluirProduto = async (produto) => {
    const confirmou = window.confirm(
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
        (item) => item.id !== produto.id,
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
    localStorage.removeItem('lacstock-admin')
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
    <main style={pagina}>
      <section style={container}>
        <div style={cabecalhoPagina}>
          <div>
            <span style={marca}>
              LACSTOCK
            </span>

            <h1 style={tituloPagina}>
              Painel administrativo
            </h1>

            <p style={descricao}>
              Gerencie os produtos disponíveis
              no catálogo.
            </p>
          </div>

          <div style={acoesCabecalho}>
            <button
              type="button"
              onClick={sair}
              style={botaoSecundario}
            >
              <LogOut size={17} />
              Sair
            </button>

            <button
              type="button"
              onClick={abrirNovoProduto}
              style={botaoPrincipal}
            >
              <Plus size={18} />
              Novo produto
            </button>
          </div>
        </div>

        {erro && !modalAberto && (
          <div style={mensagemErro}>
            {erro}
          </div>
        )}

        {mensagem && (
          <div style={mensagemSucesso}>
            {mensagem}
          </div>
        )}

        <div style={resumos}>
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
          <div style={caixaVazia}>
            <Package
              size={42}
              strokeWidth={1.4}
            />

            <h2>
              Carregando produtos...
            </h2>
          </div>
        ) : produtos.length === 0 ? (
          <div style={caixaVazia}>
            <Package
              size={42}
              strokeWidth={1.4}
            />

            <h2>
              Nenhum produto cadastrado
            </h2>

            <p style={descricao}>
              Cadastre o primeiro produto
              diretamente pelo painel.
            </p>

            <button
              type="button"
              onClick={abrirNovoProduto}
              style={{
                ...botaoPrincipal,
                marginTop: '15px',
              }}
            >
              <Plus size={18} />
              Cadastrar produto
            </button>
          </div>
        ) : (
          <div style={listaProdutos}>
            {produtos.map((produto) => (
              <article
                key={produto.id}
                style={cardProduto}
              >
                <div style={fotoProduto}>
                  {produto.imagem ? (
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                      style={imagemProduto}
                    />
                  ) : (
                    <Package
                      size={25}
                      strokeWidth={1.3}
                    />
                  )}
                </div>

                <div style={dadosProduto}>
                  <small style={marcaProduto}>
                    {produto.marca}
                  </small>

                  <h3 style={nomeProduto}>
                    {produto.nome}
                  </h3>

                  <strong>
                    {formatarPreco(
                      produto.preco,
                    )}
                  </strong>
                </div>

                <div style={acoesProduto}>
                  <button
                    type="button"
                    onClick={() =>
                      alternarDisponibilidade(
                        produto,
                      )
                    }
                    style={
                      produto.disponivel
                        ? etiquetaAtiva
                        : etiquetaInativa
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
                    style={
                      produto.importado
                        ? etiquetaAtiva
                        : etiquetaInativa
                    }
                  >
                    {produto.importado
                      ? 'Importado'
                      : 'Normal'}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      abrirEdicao(produto)
                    }
                    style={botaoIcone}
                    aria-label={
                      `Editar ${produto.nome}`
                    }
                  >
                    <Edit3 size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      excluirProduto(produto)
                    }
                    style={botaoIcone}
                    aria-label={
                      `Excluir ${produto.nome}`
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {modalAberto && (
        <div style={fundoModal}>
          <div style={modal}>
            <div style={cabecalhoModal}>
              <div>
                <small style={marca}>
                  LACSTOCK
                </small>

                <h2
                  style={{
                    margin: '5px 0 0',
                  }}
                >
                  {produtoEditando
                    ? 'Editar produto'
                    : 'Novo produto'}
                </h2>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                style={botaoIcone}
                disabled={salvando}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {erro && (
              <div style={mensagemErro}>
                {erro}
              </div>
            )}

            <form
              onSubmit={salvarProduto}
              style={formulario}
            >
              <label style={label}>
                Foto do produto

                <div style={areaImagem}>
                  {previewImagem ? (
                    <img
                      src={previewImagem}
                      alt="Prévia do produto"
                      style={preview}
                    />
                  ) : (
                    <div style={semImagem}>
                      <ImagePlus
                        size={34}
                        strokeWidth={1.4}
                      />

                      <span>
                        Nenhuma foto selecionada
                      </span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={selecionarImagem}
                  style={inputArquivo}
                />

                <small style={ajuda}>
                  No celular, toque para escolher
                  uma foto da galeria. Máximo 5 MB.
                </small>
              </label>

              <Campo
                label="Nome"
                name="nome"
                value={form.nome}
                onChange={atualizarCampo}
                required
              />

              <Campo
                label="Marca"
                name="marca"
                value={form.marca}
                onChange={atualizarCampo}
                required
              />

              <div style={gradeCampos}>
                <label style={label}>
                  Categoria

                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={atualizarCampo}
                    style={input}
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
                  value={form.subcategoria}
                  onChange={atualizarCampo}
                  required
                />
              </div>

              <Campo
                label="Preço"
                name="preco"
                type="number"
                min="0"
                step="0.01"
                value={form.preco}
                onChange={atualizarCampo}
                required
              />

              <Campo
                label="Cores"
                name="cores"
                value={form.cores}
                onChange={atualizarCampo}
                placeholder="Preto, Branco, Cinza"
                required
              />

              <Campo
                label="Tamanhos"
                name="tamanhos"
                value={form.tamanhos}
                onChange={atualizarCampo}
                placeholder="P, M, G, GG"
                required
              />

              <div style={checkboxes}>
                <Checkbox
                  name="disponivel"
                  checked={form.disponivel}
                  onChange={atualizarCampo}
                  label="Disponível"
                />

                <Checkbox
                  name="importado"
                  checked={form.importado}
                  onChange={atualizarCampo}
                  label="Produto importado"
                />

                <Checkbox
                  name="novidade"
                  checked={form.novidade}
                  onChange={atualizarCampo}
                  label="Novidade"
                />
              </div>

              <div style={acoesModal}>
                <button
                  type="button"
                  onClick={fecharModal}
                  disabled={salvando}
                  style={botaoSecundario}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  style={{
                    ...botaoPrincipal,
                    opacity:
                      salvando ? 0.6 : 1,
                  }}
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
      )}
    </main>
  )
}

function Campo({
  label: titulo,
  ...propriedades
}) {
  return (
    <label style={label}>
      {titulo}

      <input
        {...propriedades}
        style={input}
      />
    </label>
  )
}

function Checkbox({
  label: titulo,
  ...propriedades
}) {
  return (
    <label style={checkbox}>
      <input
        type="checkbox"
        {...propriedades}
      />

      {titulo}
    </label>
  )
}

function Resumo({
  titulo,
  valor,
}) {
  return (
    <div style={resumo}>
      <small style={resumoTitulo}>
        {titulo}
      </small>

      <strong style={resumoValor}>
        {valor}
      </strong>
    </div>
  )
}

const pagina = {
  minHeight: '100vh',
  padding: '120px 6% 60px',
  background: '#f7f7f5',
}

const container = {
  maxWidth: '1200px',
  margin: '0 auto',
}

const cabecalhoPagina = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '40px',
  flexWrap: 'wrap',
}

const marca = {
  fontSize: '12px',
  letterSpacing: '0.18em',
  fontWeight: 700,
}

const tituloPagina = {
  margin: '8px 0',
  fontSize: 'clamp(32px, 5vw, 54px)',
}

const descricao = {
  margin: 0,
  opacity: 0.65,
}

const acoesCabecalho = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
}

const resumos = {
  display: 'flex',
  gap: '12px',
  marginBottom: '24px',
  flexWrap: 'wrap',
}

const resumo = {
  minWidth: '150px',
  background: '#fff',
  border: '1px solid #e5e5e5',
  padding: '18px 22px',
}

const resumoTitulo = {
  opacity: 0.55,
}

const resumoValor = {
  display: 'block',
  fontSize: '26px',
  marginTop: '4px',
}

const listaProdutos = {
  display: 'grid',
  gap: '12px',
}

const cardProduto = {
  display: 'flex',
  alignItems: 'center',
  gap: '18px',
  padding: '16px',
  background: '#fff',
  border: '1px solid #e5e5e5',
  flexWrap: 'wrap',
}

const fotoProduto = {
  width: '80px',
  height: '80px',
  display: 'grid',
  placeItems: 'center',
  background: '#eee',
  flexShrink: 0,
  overflow: 'hidden',
}

const imagemProduto = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
}

const dadosProduto = {
  flex: 1,
  minWidth: '180px',
}

const marcaProduto = {
  opacity: 0.55,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
}

const nomeProduto = {
  margin: '5px 0',
}

const acoesProduto = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  alignItems: 'center',
}

const botaoPrincipal = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  border: 0,
  padding: '13px 18px',
  background: '#111',
  color: '#fff',
  cursor: 'pointer',
  borderRadius: '4px',
}

const botaoSecundario = {
  ...botaoPrincipal,
  background: '#eee',
  color: '#111',
}

const botaoIcone = {
  width: '38px',
  height: '38px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#fff',
  border: '1px solid #ddd',
  cursor: 'pointer',
  borderRadius: '4px',
}

const etiquetaAtiva = {
  border: '1px solid #111',
  background: '#111',
  color: '#fff',
  padding: '9px 12px',
  cursor: 'pointer',
  borderRadius: '100px',
}

const etiquetaInativa = {
  ...etiquetaAtiva,
  background: '#fff',
  color: '#555',
  border: '1px solid #ddd',
}

const caixaVazia = {
  padding: '60px 30px',
  background: '#fff',
  border: '1px solid #e5e5e5',
  textAlign: 'center',
}

const fundoModal = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  background: 'rgba(0, 0, 0, 0.55)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  overflowY: 'auto',
}

const modal = {
  width: '100%',
  maxWidth: '650px',
  maxHeight: '90vh',
  boxSizing: 'border-box',
  overflowY: 'auto',
  background: '#fff',
  padding: '28px',
}

const cabecalhoModal = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '20px',
  marginBottom: '28px',
}

const formulario = {
  display: 'grid',
  gap: '16px',
}

const gradeCampos = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
}

const label = {
  display: 'grid',
  gap: '7px',
  fontSize: '14px',
  fontWeight: 600,
}

const input = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '12px',
  border: '1px solid #ccc',
  background: '#fff',
  font: 'inherit',
}

const inputArquivo = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '11px',
  border: '1px solid #ccc',
  background: '#fff',
}

const areaImagem = {
  width: '100%',
  height: '220px',
  background: '#f4f4f2',
  border: '1px dashed #bbb',
  overflow: 'hidden',
}

const preview = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
}

const semImagem = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  opacity: 0.55,
}

const ajuda = {
  opacity: 0.55,
  fontWeight: 400,
}

const checkboxes = {
  display: 'flex',
  gap: '20px',
  flexWrap: 'wrap',
}

const checkbox = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
}

const acoesModal = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '10px',
  flexWrap: 'wrap',
}

const mensagemErro = {
  padding: '12px 14px',
  marginBottom: '18px',
  background: '#fff0f0',
  border: '1px solid #ffd1d1',
  fontSize: '14px',
}

const mensagemSucesso = {
  padding: '12px 14px',
  marginBottom: '18px',
  background: '#effaf1',
  border: '1px solid #cbe8d0',
  fontSize: '14px',
}

export default Admin