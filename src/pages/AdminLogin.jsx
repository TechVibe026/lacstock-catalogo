import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LockKeyhole } from 'lucide-react'

import { supabase } from '../lib/supabase'

function AdminLogin() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [autenticado, setAutenticado] = useState(false)

  const entrar = async (event) => {
    event.preventDefault()

    setCarregando(true)
    setErro('')

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password: senha,
      })

    setCarregando(false)

    if (error) {
      setErro('E-mail ou senha incorretos.')
      return
    }

    setAutenticado(true)
    navigate('/admin')
  }

  if (autenticado) {
    return <Navigate to="/admin" replace />
  }

  return (
    <main style={pagina}>
      <section style={card}>
        <div style={icone}>
          <LockKeyhole size={25} />
        </div>

        <span style={marca}>LACSTOCK</span>

        <h1 style={titulo}>
          Área administrativa
        </h1>

        <p style={descricao}>
          Entre com sua conta para gerenciar o catálogo.
        </p>

        <form
          onSubmit={entrar}
          style={{
            display: 'grid',
            gap: '16px',
            marginTop: '30px',
          }}
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
              placeholder="admin@lacstock.com"
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
              placeholder="••••••••"
            />
          </label>

          {erro && (
            <p style={mensagemErro}>
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            style={{
              ...botao,
              opacity: carregando ? 0.65 : 1,
            }}
          >
            {carregando
              ? 'Entrando...'
              : 'Entrar'}
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
  opacity: 0.6,
  lineHeight: 1.5,
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
  font: 'inherit',
  outline: 'none',
}

const botao = {
  border: 0,
  padding: '15px',
  background: '#111',
  color: '#fff',
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