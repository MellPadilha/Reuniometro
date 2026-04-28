import { v4 as uuidv4 } from 'uuid';
import db from './db';
import { round2 } from '../utils/currency';

const calcularCustoIndividual = (custoHoraHistorico, duracaoMinutos) => {
  const duracaoHoras = Number(duracaoMinutos) / 60;
  return round2(Number(custoHoraHistorico) * duracaoHoras);
};

const criarReuniao = async ({ titulo, data, duracaoMinutos, descricao = '', funcionarioIds = [] }) => {
  if (!duracaoMinutos || Number(duracaoMinutos) <= 0) {
    throw new Error('Duração deve ser maior que zero.');
  }

  if (!funcionarioIds.length) {
    throw new Error('Selecione ao menos 1 participante.');
  }

  const funcionarios = await db.funcionarios.bulkGet(funcionarioIds);
  const participantesValidos = funcionarios.filter(Boolean).filter((f) => f.ativo);

  if (!participantesValidos.length) {
    throw new Error('Nenhum participante ativo encontrado.');
  }

  const reuniaoId = uuidv4();
  const criadoEm = new Date().toISOString();

  const participantes = participantesValidos.map((funcionario) => {
    const custoIndividual = calcularCustoIndividual(funcionario.custoHora, duracaoMinutos);
    return {
      id: uuidv4(),
      reuniaoId,
      funcionarioId: funcionario.id,
      nomeHistorico: funcionario.nome,
      cargoHistorico: funcionario.cargo,
      departamentoHistorico: funcionario.departamento,
      salarioMensalHistorico: funcionario.salarioMensal,
      custoHoraHistorico: funcionario.custoHora,
      custoIndividual
    };
  });

  const custoTotal = round2(participantes.reduce((sum, item) => sum + item.custoIndividual, 0));

  const reuniao = {
    id: reuniaoId,
    titulo: titulo?.trim() || '',
    data: data || new Date().toISOString(),
    duracaoMinutos: Number(duracaoMinutos),
    descricao,
    custoTotal,
    criadoEm
  };

  await db.transaction('rw', db.reunioes, db.reuniaoParticipantes, async () => {
    await db.reunioes.add(reuniao);
    await db.reuniaoParticipantes.bulkAdd(participantes);
  });

  return { reuniao, participantes };
};

const listarReunioes = async () => db.reunioes.orderBy('data').reverse().toArray();

const obterDetalheReuniao = async (reuniaoId) => {
  const reuniao = await db.reunioes.get(reuniaoId);
  if (!reuniao) {
    throw new Error('Reunião não encontrada.');
  }

  const participantes = await db.reuniaoParticipantes.where('reuniaoId').equals(reuniaoId).toArray();
  return { reuniao, participantes };
};

const simularCustos = async ({ duracaoMinutos, funcionarioIds = [] }) => {
  if (!duracaoMinutos || Number(duracaoMinutos) <= 0 || !funcionarioIds.length) {
    return { participantes: [], custoTotal: 0 };
  }

  const funcionarios = await db.funcionarios.bulkGet(funcionarioIds);
  const participantes = funcionarios
    .filter(Boolean)
    .filter((item) => item.ativo)
    .map((item) => ({
      funcionarioId: item.id,
      nome: item.nome,
      custoHora: item.custoHora,
      custoIndividual: calcularCustoIndividual(item.custoHora, duracaoMinutos)
    }));

  return {
    participantes,
    custoTotal: round2(participantes.reduce((sum, p) => sum + p.custoIndividual, 0))
  };
};

export default {
  criarReuniao,
  listarReunioes,
  obterDetalheReuniao,
  simularCustos,
  calcularCustoIndividual
};
