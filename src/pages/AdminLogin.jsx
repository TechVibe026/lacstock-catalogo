import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'

const EMAIL_MOCK = 'luan@admin.com'
const SENHA_MOCK = '123'

function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  const entrar = (event) => {
    event.preventDefault()
    setErro('')

    const emailDigitado =
      email.trim().toLowerCase()

    if (
      emailDigitado === EMAIL_MOCK &&
      senha === SENHA_MOCK
    ) {
      localStorage.setItem(
        'lacstock-admin',
        'autenticado',
      )

      navigate('/admin')
      return
    }

    setErro('E-mail ou senha incorretos.')
  }

  return (
    <main style={pagina}>
      <section style={card}>
        <div style={icone}>
          <LockKeyhole
            size={25}
            strokeWidth={1.7}
          />
        </div>

        <span style={marca}>
          LACSTOCK
        </span>

        <h1 style={titulo}>
          Área administrativa
        </h1>

        <p style={descricao}>
          Entre com sua conta para gerenciar o catálogo.
        </p>

        <form
          onSubmit={entrar}
          style={formulario}
        >
          <label style={label}>
            E-mail

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
              autoComplete="email"
              style={input}
              placeholder="luan@admin.com"
            />
          </label>

          <label style={label}>
            Senha

            <input
              type="password"
              value={senha}
              onChange={(event) =>
                setSenha(event.target.value)
              }
              required
              autoComplete="current-password"
              style={input}
              placeholder="Digite sua senha"
            />
          </label>

          {erro && (
            <p style={mensagemErro}>
              {erro}
            </p>
          )}

          <button
            type="submit"
            style={botao}
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  )
}

const pagina = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '100px 20px 40px',
  background: '#f7f7f5',
}

const card = {
  width: '100%',
  maxWidth: '430px',
  boxSizing: 'border-box',
  background: '#fff',
  border: '1px solid #e5e5e5',
  padding: '40px',
}

const icone = {
  width: '52px',
  height: '52px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#111',
  color: '#fff',
  marginBottom: '25px',
}

const marca = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  fontWeight: 700,
}

const titulo = {
  fontSize: '32px',
  margin: '8px 0',
}

const descricao = {
  margin: 0,
  opacity: 0.6,
  lineHeight: 1.5,
}

const formulario = {
  display: 'grid',
  gap: '16px',
  marginTop: '30px',
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
  padding: '14px',
  border: '1px solid #ccc',
  background: '#fff',
  color: '#111',
  font: 'inherit',
}

const botao = {
  width: '100%',
  border: 0,
  padding: '15px',
  background: '#111',
  color: '#fff',
  font: 'inherit',
  fontWeight: 700,
  cursor: 'pointer',
}

const mensagemErro = {
  margin: 0,
  padding: '12px',
  background: '#fff0f0',
  border: '1px solid #ffd1d1',
  fontSize: '14px',
}

export default AdminLogin