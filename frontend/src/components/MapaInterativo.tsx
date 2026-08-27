interface Quarto {
  id: string;
  numero: string;
  categoria: string;
  status: string;
  coordX?: number;
  coordY?: number;
}

interface MapaInterativoProps {
  quartos: Quarto[];
  onSelecionarQuarto?: (quarto: Quarto) => void;
}

export default function MapaInterativo({ quartos, onSelecionarQuarto }: MapaInterativoProps) {
  return (
    <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '20px', boxShadow: '0 8px 32px rgba(0,119,182,0.08)' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#1a365d', margin: '0 0 5px 0' }}>🗺️ Mapa Interativo da Pousada</h2>
        <p style={{ color: '#0077b6' }}>Clique em um chalé no mapa para ver o status em tempo real.</p>
      </div>

      <div style={{ 
        position: 'relative', 
        width: '100%', 
        height: '480px', 
        backgroundColor: '#f4f9f4', 
        borderRadius: '16px', 
        border: '2px dashed #bce0fd',
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(#d1e8e2 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}>
        
        {/* PISCINA PRINCIPAL (CENTRO) */}
        <div style={{ position: 'absolute', top: '45%', left: '48%', transform: 'translate(-50%, -50%)', textAlign: 'center', background: 'rgba(0, 119, 182, 0.1)', padding: '12px 20px', borderRadius: '12px', border: '1px solid #0077b6', zIndex: 1 }}>
          <span style={{ fontSize: '24px' }}>🏊‍♂️</span>
          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: '#0077b6', fontSize: '0.85rem' }}>Piscina Principal</p>
        </div>

        {/* RESTAURANTE DENGO (DIREITA TOPO) */}
        <div style={{ position: 'absolute', top: '12%', left: '76%', textAlign: 'center', background: 'rgba(230, 126, 34, 0.1)', padding: '10px 18px', borderRadius: '12px', border: '1px solid #e67e22', zIndex: 1 }}>
          <span style={{ fontSize: '22px' }}>🍹</span>
          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: '#e67e22', fontSize: '0.8rem' }}>Restaurante Dengo</p>
        </div>

        {/* ESTACIONAMENTO (CANTO INFERIOR ESQUERDO) */}
        <div style={{ position: 'absolute', bottom: '8%', left: '22%', textAlign: 'center', background: 'rgba(127, 140, 141, 0.1)', padding: '10px 18px', borderRadius: '12px', border: '1px solid #7f8c8d', zIndex: 1 }}>
          <span style={{ fontSize: '22px' }}>🚗</span>
          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: '#7f8c8d', fontSize: '0.8rem' }}>Estacionamento</p>
        </div>

        {/* DISTRIBUIÇÃO DOS CHALÉS */}
        {quartos.map((quarto, index) => {
          const posicoesFixas = [
            { top: '12%', left: '6%' },   // C-01
            { top: '5%', left: '42%' },   // C-02
            { top: '65%', left: '6%' },   // S-01
            { top: '65%', left: '42%' },  // S-02
            { top: '32%', left: '74%' },  // S-03
            { top: '65%', left: '74%' },  // S-04
          ];
          const pos = posicoesFixas[index % posicoesFixas.length];
          const isLivre = quarto.status === 'LIVRE';

          return (
            <div 
              key={quarto.id}
              onClick={() => onSelecionarQuarto && onSelecionarQuarto(quarto)}
              style={{
                position: 'absolute',
                top: pos.top,
                left: pos.left,
                backgroundColor: isLivre ? '#e8f8f5' : '#fdedec',
                border: `2px solid ${isLivre ? '#27ae60' : '#e74c3c'}`,
                padding: '10px 14px',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                width: '110px',
                zIndex: 2
              }}
            >
              <div style={{ fontSize: '18px' }}>🏡</div>
              <strong style={{ fontSize: '0.85rem', color: '#1a365d', display: 'block' }}>{quarto.numero}</strong>
              <span style={{ fontSize: '0.7rem', color: isLivre ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                {quarto.status}
              </span>
            </div>
          );
        })}

      </div>
    </div>
  );
}