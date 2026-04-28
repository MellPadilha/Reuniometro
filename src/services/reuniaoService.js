import db from './db'
import { roundMoney } from 'src/utils/money'

function createId () {
  return crypto.randomUUID()
}

export function calcularCustosPreview (funcionarios, duracaoMinutos) {
  const duracaoHoras = Number(duracaoMinutos || 0) / 60
  const participantes = funcionarios.map((funcionario) => ({
    funcionarioId: funcionario.id,
    nomeHistorico: funcionario.nome,
    cargoHistorico: funcionario.cargo,
    departamentoHistorico: funcionario.departamento,
    salarioMensalHistorico: Number(funcionario.salarioMensal),
    custoHoraHistorico: Number(funcionario.custoHora),
    custoIndividual: roundMoney(Number(funcionario.custoHora) * duracaoHoras)
  }))

  return {
    duracaoHoras,
    participantes,
    custoTotal: roundMoney(participantes.reduce((total, item) => total + item.custoIndividual, 0))
  }
}

function validarReuniao (dados) {
  if (!dados.titulo?.trim()) {
    throw new Error('Informe o titulo da reuniao.')
  }

  if (!dados.data) {
    throw new Error('Informe a data da reuniao.')
  }

  if (Number(dados.duracaoMinutos) <= 0) {
    throw new Error('A duracao deve ser maior que zero.')
  }

  if (!dados.funcionarioIds?.length) {
    throw new Error('Selecione pelo menos 1 participante.')
  }
}

export async function criarReuniao (dados) {
  validarReuniao(dados)

  const funcionarios = await db.funcionarios.bulkGet(dados.funcionarioIds)
  const participantesValidos = funcionarios.filter(Boolean)

  if (participantesValidos.length !== dados.funcionarioIds.length) {
    throw new Error('Um ou mais participantes nao foram encontrados.')
  }

  const calculo = calcularCustosPreview(participantesValidos, dados.duracaoMinutos)
  const agora = new Date().toISOString()
  const reuniaoId = createId()

  const reuniao = {
    id: reuniaoId,
    titulo: dados.titulo.trim(),
    data: new Date(dados.data).toISOString(),
    duracaoMinutos: Number(dados.duracaoMinutos),
    descricao: dados.descricao?.trim() || '',
    custoTotal: calculo.custoTotal,
    criadoEm: agora
  }

  const participantes = calculo.participantes.map((participante) => ({
    id: createId(),
    reuniaoId,
    ...participante
  }))

  await db.transaction('rw', db.reunioes, db.reuniaoParticipantes, async () => {
    await db.reunioes.add(reuniao)
    await db.reuniaoParticipantes.bulkAdd(participantes)
  })

  return {
    reuniao,
    participantes
  }
}

export async function listarReunioes () {
  return db.reunioes.orderBy('data').reverse().toArray()
}

export async function buscarReuniaoComParticipantes (id) {
  const reuniao = await db.reunioes.get(id)

  if (!reuniao) {
    return null
  }

  const participantes = await db.reuniaoParticipantes.where('reuniaoId').equals(id).toArray()

  return {
    reuniao,
    participantes
  }
}
