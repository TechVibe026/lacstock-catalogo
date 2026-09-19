import { Route, Routes } from 'react-router-dom'

import Header from './components/Header'
import Hero from './components/Hero'
import Catalogo from './components/Catalogo'
import AdminRoute from './components/AdminRoute'

import Produto from './pages/Produto'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'

function Home() {
  return (
    <>
      <Hero />
      <Catalogo />
    </>
  )
}

function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/produto/:slug"
          element={<Produto />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App