import * as XLSX from 'xlsx'
import db from './db'

function toDate (value) {
  return value ? new Date(value).toLocaleString('pt-BR') : ''
}

function downloadInBrowser (bytes, fileName) {
  const blob = new Blob([bytes], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export async function exportarExcel () {
  const [reunioes, participantes, funcionarios] = await Promise.all([
    db.reunioes.orderBy('data').toArray(),
    db.reuniaoParticipantes.orderBy('reuniaoId').toArray(),
    db.funcionarios.orderBy('nome').toArray()
  ])

  const reunioesSheet = reunioes.map((reuniao) => ({
    ReuniaoId: reuniao.id,
    Titulo: reuniao.titulo,
    Data: toDate(reuniao.data),
    DuracaoMinutos: reuniao.duracaoMinutos,
    DuracaoHoras: reuniao.duracaoMinutos / 60,
    CustoTotal: reuniao.custoTotal
  }))

  const participantesSheet = participantes.map((participante) => ({
    ReuniaoId: participante.reuniaoId,
    FuncionarioId: participante.funcionarioId,
    Nome: participante.nomeHistorico,
    Cargo: participante.cargoHistorico,
    Departamento: participante.departamentoHistorico,
    SalarioMensal: participante.salarioMensalHistorico,
    CustoHora: participante.custoHoraHistorico,
    CustoIndividual: participante.custoIndividual
  }))

  const funcionariosSheet = funcionarios.map((funcionario) => ({
    FuncionarioId: funcionario.id,
    Nome: funcionario.nome,
    Cargo: funcionario.cargo,
    Departamento: funcionario.departamento,
    SalarioMensal: funcionario.salarioMensal,
    CargaHorariaMensal: funcionario.cargaHorariaMensal,
    CustoHora: funcionario.custoHora,
    Ativo: funcionario.ativo ? 'Sim' : 'Nao'
  }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(reunioesSheet), 'Reunioes')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(participantesSheet), 'Participantes')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(funcionariosSheet), 'Funcionarios')

  const bytes = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  })

  const fileName = `reuniometro-${new Date().toISOString().slice(0, 10)}.xlsx`

  if (window.reuniometro?.saveExcel) {
    return window.reuniometro.saveExcel({
      fileName,
      bytes: Array.from(new Uint8Array(bytes))
    })
  }

  downloadInBrowser(bytes, fileName)
  return {
    filePath: fileName
  }
}
