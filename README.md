# Reuniômetro

Aplicação desktop em Quasar + Electron para cadastro de funcionários, registro de reuniões e cálculo de custo total com persistência local (Dexie/IndexedDB) e exportação para Excel.

## Regras críticas implementadas

- `custoHora = salarioMensal / cargaHorariaMensal`
- Em reunião, cada participante salva snapshot histórico (`salarioMensalHistorico` e `custoHoraHistorico`)
- O custo da reunião nunca é recalculado com dados atuais do funcionário

## Serviços

- `src/services/funcionarioService.js`
- `src/services/reuniaoService.js`
- `src/services/exportService.js`
- `src/services/db.js`

## Exportação Excel

A exportação gera 3 abas:

1. Reunioes
2. Participantes
3. Funcionarios

Arquivo salvo em `Documentos/MeetingCost` via processo principal do Electron (`electron/main.js`).
