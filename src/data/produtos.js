import moletomNike from '../assets/produtos/moletom-nike.png'
import airMaxMarrom from '../assets/produtos/airmax-marrom.png'
import airJordan from '../assets/produtos/air-jordan.png'
import poloLacoste from '../assets/produtos/polo-lacoste.png'
import jaquetaNorthFace from '../assets/produtos/jaqueta-north-face.png'
import camisetaCalvinKlein from '../assets/produtos/camiseta-calvin-klein.png'

export const produtos = [
  {
    id: 1,
    slug: 'moletom-nike-preto',
    nome: 'Moletom Nike',
    marca: 'Nike',
    categoria: 'Roupas',
    subcategoria: 'Moletons',
    preco: 349.9,
    cores: ['Preto'],
    tamanhos: ['P', 'M', 'G', 'GG'],
    imagem: moletomNike,
    disponivel: true,
    novidade: true,
  },

  {
    id: 2,
    slug: 'nike-air-max-marrom',
    nome: 'Nike Air Max',
    marca: 'Nike',
    categoria: 'Tênis',
    subcategoria: 'Sneakers',
    preco: 699.9,
    cores: ['Marrom'],
    tamanhos: ['39', '40', '41', '42'],
    imagem: airMaxMarrom,
    disponivel: true,
    novidade: true,
  },

  {
    id: 3,
    slug: 'air-jordan-preto-marrom',
    nome: 'Air Jordan',
    marca: 'Jordan',
    categoria: 'Tênis',
    subcategoria: 'Sneakers',
    preco: 749.9,
    cores: ['Preto', 'Marrom'],
    tamanhos: ['40', '41', '42', '43'],
    imagem: airJordan,
    disponivel: true,
    novidade: true,
  },

  {
    id: 4,
    slug: 'polo-lacoste-branca',
    nome: 'Polo Lacoste',
    marca: 'Lacoste',
    categoria: 'Roupas',
    subcategoria: 'Polos',
    preco: 299.9,
    cores: ['Branco'],
    tamanhos: ['P', 'M', 'G'],
    imagem: poloLacoste,
    disponivel: true,
    novidade: false,
  },

  {
    id: 5,
    slug: 'jaqueta-the-north-face',
    nome: 'Jaqueta The North Face',
    marca: 'The North Face',
    categoria: 'Roupas',
    subcategoria: 'Jaquetas',
    preco: 599.9,
    cores: ['Preto', 'Cinza'],
    tamanhos: ['M', 'G', 'GG'],
    imagem: jaquetaNorthFace,
    disponivel: true,
    novidade: false,
  },

  {
    id: 6,
    slug: 'camiseta-calvin-klein-preta',
    nome: 'Camiseta Calvin Klein',
    marca: 'Calvin Klein',
    categoria: 'Roupas',
    subcategoria: 'Camisetas',
    preco: 189.9,
    cores: ['Preto'],
    tamanhos: ['P', 'M', 'G'],
    imagem: camisetaCalvinKlein,
    disponivel: true,
    novidade: false,
    importado: true,
  },
]