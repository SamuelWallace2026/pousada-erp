import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface MockConsumo {
  descricao: string;
  quantidade: number;
  subtotal: number;
}

export interface MockReserva {
  id: string;
  cliente: string;
  dataCheckIn: string;
  dataCheckOut: string;
  quarto: string;
  diarias: {
    quantidade: number;
    valor: number;
    total: number;
  };
  consumos: MockConsumo[];
  totalGeral: number;
}

export function gerarReciboPdf(reserva: MockReserva) {
  const doc = new jsPDF();

  const corPrimaria: [number, number, number] = [26, 54, 93];    // Azul Noite
  const corSecundaria: [number, number, number] = [230, 126, 34]; // Laranja Dourado
  const corCinza: [number, number, number] = [120, 120, 120];

  // Cabeçalho institucional
  doc.setFillColor(...corPrimaria);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Pousada Refúgio Dourado', 14, 22);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Recibo Oficial de Hospedagem & Consumo', 130, 22);

  // Informações do Comprovante
  doc.setTextColor(...corCinza);
  doc.setFontSize(10);
  doc.text(`Comprovante ID: ${reserva.id.slice(0, 8).toUpperCase()}`, 14, 45);
  doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 145, 45);

  // Dados do Hóspede
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, 52, 182, 24, 3, 3, 'F');

  doc.setTextColor(...corPrimaria);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados da Estadia', 18, 60);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Hóspede: ${reserva.cliente}`, 18, 68);
  doc.text(`Acomodação: ${reserva.quarto}`, 110, 68);
  doc.text(`Período: ${reserva.dataCheckIn} até ${reserva.dataCheckOut}`, 18, 74);

  // Montagem da lista de itens (Diárias + Consumos)
  const corpoTabela = [
    [
      `Hospedagem - Diárias (${reserva.diarias.quantidade}x)`,
      reserva.diarias.quantidade.toString(),
      `R$ ${reserva.diarias.valor.toFixed(2)}`,
      `R$ ${reserva.diarias.total.toFixed(2)}`
    ]
  ];

  if (reserva.consumos && reserva.consumos.length > 0) {
    reserva.consumos.forEach(c => {
      corpoTabela.push([
        `[Restaurante Dengo] ${c.descricao}`,
        c.quantidade.toString(),
        `-`,
        `R$ ${c.subtotal.toFixed(2)}`
      ]);
    });
  }

  // Geração direta da tabela
  autoTable(doc, {
    startY: 85,
    head: [['Descrição dos Itens', 'Qtd', 'Valor Unit.', 'Subtotal']],
    body: corpoTabela,
    theme: 'grid',
    headStyles: {
      fillColor: corPrimaria,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 6,
    },
    columnStyles: {
      0: { cellWidth: 90 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 37, halign: 'right' },
    },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 130;

  // Bloco de Total Geral
  doc.setFillColor(254, 249, 231);
  doc.roundedRect(120, finalY + 10, 76, 18, 2, 2, 'F');

  doc.setTextColor(...corPrimaria);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL A PAGAR:', 124, finalY + 21);

  doc.setTextColor(...corSecundaria);
  doc.setFontSize(13);
  doc.text(`R$ ${reserva.totalGeral.toFixed(2)}`, 160, finalY + 21);

  // Rodapé
  doc.setTextColor(...corCinza);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Agradecemos a preferência! Esperamos vê-lo novamente em breve.', 105, 275, { align: 'center' });
  doc.text('Pousada Refúgio Dourado - Canoa Quebrada / CE', 105, 280, { align: 'center' });

  // Disparo do download
  doc.save(`Recibo_${reserva.cliente.replace(/\s+/g, '_')}.pdf`);
}