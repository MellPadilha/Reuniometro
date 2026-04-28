import Dexie from 'dexie'

export const db = new Dexie('reuniometro')

db.version(1).stores({
  funcionarios: 'id, nome, departamento, ativo, criadoEm, atualizadoEm',
  reunioes: 'id, data, criadoEm',
  reuniaoParticipantes: 'id, reuniaoId, funcionarioId'
})

export default db
