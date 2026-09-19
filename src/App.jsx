import { Route, Routes } from 'react-router-dom'

import Header from './components/Header'
import Hero from './components/Hero'
import Catalogo from './components/Catalogo'

import Produto from './pages/Produto'
import Admin from './pages/Admin'

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
          path="/admin"
          element={<Admin />}
        />
      </Routes>
    </>
  )
}

export default App