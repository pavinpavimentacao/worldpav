import React, { useState } from 'react'
import { Layout } from '../../components/Layout'
import { Button } from '../../components/Button'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Truck, Calendar, FileText } from 'lucide-react'

const NovoCarregamento = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    data: '',
    quantidade: '',
    valorTotal: '',
    notaFiscal: '',
    observacoes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Novo carregamento:', formData)
    // Aqui você implementaria a lógica de salvar
    navigate(`/parceiros/${id}`)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/parceiros/${id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900">
                Novo Carregamento
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Registre um novo carregamento de emulsão
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-lg border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data */}
            <div>
              <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data do Carregamento
              </label>
              <input
                type="date"
                id="data"
                name="data"
                value={formData.data}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Quantidade */}
            <div>
              <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">
                <Truck className="h-4 w-4 inline mr-1" />
                Quantidade (kg)
              </label>
              <input
                type="number"
                id="quantidade"
                name="quantidade"
                value={formData.quantidade}
                onChange={handleChange}
                required
                placeholder="Ex: 8000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Valor Total */}
            <div>
              <label htmlFor="valorTotal" className="block text-sm font-medium text-gray-700 mb-1">
                Valor Total (R$)
              </label>
              <input
                type="number"
                id="valorTotal"
                name="valorTotal"
                value={formData.valorTotal}
                onChange={handleChange}
                required
                placeholder="Ex: 5000.00"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Nota Fiscal */}
            <div>
              <label htmlFor="notaFiscal" className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                Número da Nota Fiscal
              </label>
              <input
                type="text"
                id="notaFiscal"
                name="notaFiscal"
                value={formData.notaFiscal}
                onChange={handleChange}
                placeholder="Ex: NF-12345"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Observações */}
            <div className="md:col-span-2">
              <label htmlFor="observacoes" className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={4}
                placeholder="Informações adicionais sobre o carregamento..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="mt-6 flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/parceiros/${id}`)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar Carregamento
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}

export default NovoCarregamento


