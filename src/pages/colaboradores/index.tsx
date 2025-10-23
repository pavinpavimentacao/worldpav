import { Routes, Route } from 'react-router-dom'
import ColaboradoresList from './ColaboradoresList'
import NovoColaborador from './NovoColaborador'
import ColaboradorDetalhes from './ColaboradorDetalhes'

export default function ColaboradoresRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ColaboradoresList />} />
      <Route path="/new" element={<NovoColaborador />} />
      <Route path="/:id" element={<ColaboradorDetalhes />} />
    </Routes>
  )
}








