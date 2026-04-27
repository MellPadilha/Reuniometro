import { v4 as uuidv4 } from 'uuid';
import db from './db';
import { round2 } from '../utils/currency';

const validarFuncionario = ({ salarioMensal, cargaHorariaMensal }) => {
  if (!salarioMensal || Number(salarioMensal) <= 0) {
    throw new Error('Salário mensal deve ser maior que zero.');
  }
  if (!cargaHorariaMensal || Number(cargaHorariaMensal) <= 0) {
    throw new Error('Carga horária mensal deve ser maior que zero.');
  }
};

const calcularCustoHora = (salarioMensal, cargaHorariaMensal) =>
  round2(Number(salarioMensal) / Number(cargaHorariaMensal));

const criarFuncionario = async (payload) => {
  validarFuncionario(payload);

  const agora = new Date().toISOString();
  const funcionario = {
    id: uuidv4(),
    nome: payload.nome?.trim() || '',
    cargo: payload.cargo?.trim() || '',
    departamento: payload.departamento?.trim() || '',
    salarioMensal: Number(payload.salarioMensal),
    cargaHorariaMensal: Number(payload.cargaHorariaMensal),
    custoHora: calcularCustoHora(payload.salarioMensal, payload.cargaHorariaMensal),
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora
  };

  await db.funcionarios.add(funcionario);
  return funcionario;
};

const editarFuncionario = async (id, payload) => {
  const existente = await db.funcionarios.get(id);
  if (!existente) {
    throw new Error('Funcionário não encontrado.');
  }

  const salarioMensal = Number(payload.salarioMensal ?? existente.salarioMensal);
  const cargaHorariaMensal = Number(payload.cargaHorariaMensal ?? existente.cargaHorariaMensal);
  validarFuncionario({ salarioMensal, cargaHorariaMensal });

  const atualizado = {
    ...existente,
    ...payload,
    salarioMensal,
    cargaHorariaMensal,
    custoHora: calcularCustoHora(salarioMensal, cargaHorariaMensal),
    atualizadoEm: new Date().toISOString()
  };

  await db.funcionarios.put(atualizado);
  return atualizado;
};

const inativarFuncionario = async (id) => editarFuncionario(id, { ativo: false });

const listarFuncionarios = async ({ filtro = '', departamento = '' } = {}) => {
  const filtroLower = filtro.toLowerCase();

  const funcionarios = await db.funcionarios
    .filter((item) => {
      const matchNome = !filtroLower || item.nome.toLowerCase().includes(filtroLower);
      const matchDepartamento = !departamento || item.departamento === departamento;
      return matchNome && matchDepartamento;
    })
    .sortBy('nome');

  return funcionarios;
};

const listarFuncionariosAtivos = async () => db.funcionarios.where('ativo').equals(true).toArray();

export default {
  criarFuncionario,
  editarFuncionario,
  inativarFuncionario,
  listarFuncionarios,
  listarFuncionariosAtivos,
  calcularCustoHora
};
