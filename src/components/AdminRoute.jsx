import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

import { supabase } from '../lib/supabase'

function AdminRoute({ children }) {
  const [carregando, setCarregando] = useState(true)
  const [sessao, setSessao] = useState(null)

  useEffect(() => {
    const verificarSessao = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setSessao(session)
      setCarregando(false)
    }

    verificarSessao()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_evento, session) => {
        setSessao(session)
        setCarregando(false)
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (carregando) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        Carregando...
      </div>
    )
  }

  if (!sessao) {
    return (
      <Navigate
        to="/admin/login"
        replace
      />
    )
  }

  return children
}

export default AdminRoute