import { Routes, Route } from 'react-router-dom'
import ColaboradoresList from './ColaboradoresList'
import NovoColaborador from './NovoColaborador'

export default function ColaboradoresRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ColaboradoresList />} />
      <Route path="/new" element={<NovoColaborador />} />
    </Routes>
  )
}






