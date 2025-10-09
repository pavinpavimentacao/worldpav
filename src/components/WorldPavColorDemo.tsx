import React from 'react';

const WorldPavColorDemo: React.FC = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen font-manrope">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-500 mb-8">
          🎨 WorldPav - Identidade Visual
        </h1>
        
        {/* Cores Primárias */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cores Primárias (Azul WorldPav)</h2>
          <div className="grid grid-cols-5 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade} className="text-center">
                <div className={`w-full h-16 bg-primary-${shade} rounded-lg mb-2 border`}></div>
                <p className="text-xs text-gray-600">{shade}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cores Secundárias */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cores Secundárias (Laranja)</h2>
          <div className="grid grid-cols-5 gap-4">
            {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
              <div key={shade} className="text-center">
                <div className={`w-full h-16 bg-secondary-${shade} rounded-lg mb-2 border`}></div>
                <p className="text-xs text-gray-600">{shade}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Status de Obras */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Status de Obras</h2>
          <div className="flex flex-wrap gap-4">
            <span className="status-planejada">Planejada</span>
            <span className="status-em-andamento">Em Andamento</span>
            <span className="status-concluida">Concluída</span>
            <span className="status-cancelada">Cancelada</span>
          </div>
        </section>

        {/* Empresas */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Empresas</h2>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-empresa-worldpav rounded-full mx-auto mb-2"></div>
              <p className="empresa-worldpav font-medium">WorldPav</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-empresa-pavin rounded-full mx-auto mb-2"></div>
              <p className="empresa-pavin font-medium">Pavin</p>
            </div>
          </div>
        </section>

        {/* Botões */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Botões</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-primary">Botão Primário</button>
            <button className="btn-secondary">Botão Secundário</button>
            <button className="btn-outline">Botão Outline</button>
            <button className="btn-danger">Botão Perigo</button>
          </div>
        </section>

        {/* Cards */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-primary-500 mb-2">Card Primário</h3>
              <p className="text-gray-600">Este é um exemplo de card com as novas cores da WorldPav.</p>
            </div>
            <div className="card border-l-4 border-secondary-500">
              <h3 className="text-lg font-semibold text-secondary-500 mb-2">Card Secundário</h3>
              <p className="text-gray-600">Card com destaque laranja para informações importantes.</p>
            </div>
            <div className="card bg-primary-50 border-primary-200">
              <h3 className="text-lg font-semibold text-primary-700 mb-2">Card Destacado</h3>
              <p className="text-primary-600">Card com fundo azul claro para destaque especial.</p>
            </div>
          </div>
        </section>

        {/* Tipografia */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tipografia - Manrope</h2>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-primary-500">Heading 1 - WorldPav</h1>
            <h2 className="text-3xl font-semibold text-secondary-500">Heading 2 - Pavin</h2>
            <h3 className="text-2xl font-medium text-gray-700">Heading 3 - Sistema</h3>
            <p className="text-lg text-gray-600">Parágrafo com fonte Manrope - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            <p className="text-base text-gray-500">Texto menor para descrições e detalhes.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WorldPavColorDemo;






