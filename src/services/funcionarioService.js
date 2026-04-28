import db from './db'
import { roundMoney } from 'src/utils/money'

function createId () {
  return crypto.randomUUID()
}

export function calcularCustoHora (salarioMensal, cargaHorariaMensal) {
  return roundMoney(Number(salarioMensal) / Number(cargaHorariaMensal))
}

function validarFuncionario (funcionario) {
  if (!funcionario.nome?.trim()) {
    throw new Error('Informe o nome do funcionario.')
  }

  if (Number(funcionario.salarioMensal) <= 0) {
    throw new Error('O salario deve ser maior que zero.')
  }

  if (Number(funcionario.cargaHorariaMensal) <= 0) {
    throw new Error('A carga horaria deve ser maior que zero.')
  }
}

function normalizarFuncionario (funcionario) {
  const salarioMensal = Number(funcionario.salarioMensal)
  const cargaHorariaMensal = Number(funcionario.cargaHorariaMensal)

  return {
    nome: funcionario.nome.trim(),
    cargo: funcionario.cargo?.trim() || '',
    departamento: funcionario.departamento?.trim() || '',
    salarioMensal,
    cargaHorariaMensal,
    custoHora: calcularCustoHora(salarioMensal, cargaHorariaMensal),
    ativo: funcionario.ativo ?? true
  }
}

export async function criarFuncionario (funcionario) {
  validarFuncionario(funcionario)

  const agora = new Date().toISOString()
  const novoFuncionario = {
    id: createId(),
    ...normalizarFuncionario(funcionario),
    ativo: true,
    criadoEm: agora,
    atualizadoEm: agora
  }

  await db.funcionarios.add(novoFuncionario)
  return novoFuncionario
}

export async function editarFuncionario (id, funcionario) {
  validarFuncionario(funcionario)

  const existente = await db.funcionarios.get(id)
  if (!existente) {
    throw new Error('Funcionario nao encontrado.')
  }

  const atualizado = {
    ...existente,
    ...normalizarFuncionario(funcionario),
    atualizadoEm: new Date().toISOString()
  }

  await db.funcionarios.put(atualizado)
  return atualizado
}

export async function inativarFuncionario (id) {
  const existente = await db.funcionarios.get(id)
  if (!existente) {
    throw new Error('Funcionario nao encontrado.')
  }

  const atualizado = {
    ...existente,
    ativo: false,
    atualizadoEm: new Date().toISOString()
  }

  await db.funcionarios.put(atualizado)
  return atualizado
}

export async function listarFuncionarios ({ filtro = '', somenteAtivos = false } = {}) {
  const texto = filtro.trim().toLowerCase()
  const funcionarios = await db.funcionarios.orderBy('nome').toArray()

  return funcionarios.filter((funcionario) => {
    if (somenteAtivos && !funcionario.ativo) {
      return false
    }

    if (!texto) {
      return true
    }

    return [funcionario.nome, funcionario.departamento]
      .join(' ')
      .toLowerCase()
      .includes(texto)
  })
}
