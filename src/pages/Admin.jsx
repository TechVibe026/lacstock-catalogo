import { Package, Plus } from 'lucide-react'

function Admin() {
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '120px 6% 60px',
        background: '#f7f7f5',
      }}
    >
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '40px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span
              style={{
                fontSize: '12px',
                letterSpacing: '0.18em',
                fontWeight: '700',
              }}
            >
              LACSTOCK
            </span>

            <h1
              style={{
                margin: '8px 0',
                fontSize: 'clamp(32px, 5vw, 54px)',
              }}
            >
              Painel administrativo
            </h1>

            <p
              style={{
                margin: 0,
                opacity: 0.65,
              }}
            >
              Gerencie os produtos disponíveis no catálogo.
            </p>
          </div>

          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: 0,
              padding: '14px 20px',
              background: '#111',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            <Plus size={18} />
            Novo produto
          </button>
        </div>

        <div
          style={{
            padding: '50px 30px',
            background: '#fff',
            border: '1px solid #e5e5e5',
            textAlign: 'center',
          }}
        >
          <Package
            size={42}
            strokeWidth={1.4}
          />

          <h2>
            Gerenciamento de produtos
          </h2>

          <p
            style={{
              maxWidth: '520px',
              margin: '10px auto 0',
              opacity: 0.6,
              lineHeight: 1.6,
            }}
          >
            Na próxima etapa, os produtos do catálogo
            aparecerão aqui para cadastrar, editar,
            excluir e controlar a disponibilidade.
          </p>
        </div>
      </section>
    </main>
  )
}

export default Admin