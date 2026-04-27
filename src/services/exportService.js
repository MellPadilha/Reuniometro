import * as XLSX from 'xlsx';
import db from './db';

const getSheets = async () => {
  const [reunioes, participantes, funcionarios] = await Promise.all([
    db.reunioes.toArray(),
    db.reuniaoParticipantes.toArray(),
    db.funcionarios.toArray()
  ]);

  const reunioesRows = reunioes.map((item) => ({
    ReuniaoId: item.id,
    Titulo: item.titulo,
    Data: item.data,
    DuracaoMinutos: item.duracaoMinutos,
    DuracaoHoras: item.duracaoMinutos / 60,
    CustoTotal: item.custoTotal
  }));

  const participantesRows = participantes.map((item) => ({
    ReuniaoId: item.reuniaoId,
    FuncionarioId: item.funcionarioId,
    Nome: item.nomeHistorico,
    Cargo: item.cargoHistorico,
    Departamento: item.departamentoHistorico,
    SalarioMensal: item.salarioMensalHistorico,
    CustoHora: item.custoHoraHistorico,
    CustoIndividual: item.custoIndividual
  }));

  const funcionariosRows = funcionarios.map((item) => ({
    FuncionarioId: item.id,
    Nome: item.nome,
    Cargo: item.cargo,
    Departamento: item.departamento,
    SalarioMensal: item.salarioMensal,
    CargaHorariaMensal: item.cargaHorariaMensal,
    CustoHora: item.custoHora,
    Ativo: item.ativo
  }));

  return { reunioesRows, participantesRows, funcionariosRows };
};

const exportarExcel = async () => {
  const { reunioesRows, participantesRows, funcionariosRows } = await getSheets();

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(reunioesRows), 'Reunioes');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(participantesRows), 'Participantes');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(funcionariosRows), 'Funcionarios');

  const binary = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

  if (window?.meetingCost?.saveExcelFile) {
    return window.meetingCost.saveExcelFile(binary);
  }

  throw new Error('Integração Electron indisponível para salvar arquivo.');
};

export default {
  exportarExcel
};
