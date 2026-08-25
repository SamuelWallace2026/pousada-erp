import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Esta é a estrutura dos dados falsos (mock) que usaremos por enquanto
export interface MockReserva {
  id: string;
  cliente: string;
  dataCheckIn: string;
  dataCheckOut: string;
  quarto: string;
  diarias: { quantidade: number; valor: number; total: number };
  consumos: { descricao: string; quantidade: number; subtotal: number }[];
  totalGeral: number;
}

export const gerarReciboPdf = (reserva: MockReserva) => {
  // Cria o documento PDF no formato A4 (retrato)
  const doc = new jsPDF();

  // --- CABEÇALHO ---
  doc.setFontSize(22);
  doc.text("Pousada Refúgio Dourado", 105, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.text("Recibo de Estadia e Consumo", 105, 30, { align: "center" });

  // --- DADOS DO CLIENTE ---
  doc.setFontSize(11);
  doc.text(`Cliente: ${reserva.cliente}`, 15, 45);
  doc.text(`Quarto: ${reserva.quarto}`, 15, 52);
  doc.text(`Check-in: ${reserva.dataCheckIn}`, 130, 45);
  doc.text(`Check-out: ${reserva.dataCheckOut}`, 130, 52);

  // --- TABELA DE COBRANÇAS ---
  const tableData = [];
  
  // 1. Adiciona a cobrança das diárias na tabela
  tableData.push([
    `Diárias (${reserva.diarias.quantidade}x)`, 
    reserva.diarias.quantidade, 
    `R$ ${reserva.diarias.valor.toFixed(2)}`, 
    `R$ ${reserva.diarias.total.toFixed(2)}`
  ]);

  // 2. Adiciona os itens consumidos (frigobar, restaurante, etc)
  reserva.consumos.forEach(item => {
    tableData.push([
      item.descricao, 
      item.quantidade, 
      "-", // Preço unitário não é obrigatório mostrar se já temos o subtotal
      `R$ ${item.subtotal.toFixed(2)}`
    ]);
  });

  // Gera a tabela no PDF
  autoTable(doc, {
    startY: 60,
    head: [['Descrição', 'Qtd.', 'Valor Unit.', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185] }, // Cor azul para o cabeçalho
  });

  // --- RODAPÉ COM O TOTAL ---
  // @ts-ignore - A biblioteca autoTable injeta a propriedade 'lastAutoTable' no doc
  const finalY = doc.lastAutoTable.finalY || 60;
  
  doc.setFontSize(14);
  doc.text(`TOTAL PAGO: R$ ${reserva.totalGeral.toFixed(2)}`, 130, finalY + 15);
  
  doc.setFontSize(10);
  doc.text("Obrigado pela preferência! Volte sempre.", 105, finalY + 30, { align: "center" });

  // Baixa o arquivo para o PC
  doc.save(`Recibo_${reserva.cliente.replace(" ", "_")}.pdf`);
};