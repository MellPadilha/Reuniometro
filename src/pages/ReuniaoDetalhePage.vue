<template>
  <q-page class="page-wrap">
    <div class="row items-center justify-between page-heading">
      <div>
        <h1 class="text-h5 q-my-none">{{ detalhe?.reuniao.titulo || 'Reuniao' }}</h1>
        <div class="text-caption text-grey-7">{{ detalhe ? formatDate(detalhe.reuniao.data) : '' }}</div>
      </div>

      <q-btn flat icon="arrow_back" label="Voltar" to="/reunioes" />
    </div>

    <q-card v-if="detalhe" flat class="surface-card q-mb-md">
      <q-card-section class="row q-col-gutter-md">
        <div class="col-12 col-sm-3">
          <div class="stat-card">
            <div class="text-caption text-grey-7">Duracao</div>
            <div class="text-subtitle1">{{ detalhe.reuniao.duracaoMinutos }} min</div>
          </div>
        </div>
        <div class="col-12 col-sm-3">
          <div class="stat-card">
            <div class="text-caption text-grey-7">Horas</div>
            <div class="text-subtitle1">{{ (detalhe.reuniao.duracaoMinutos / 60).toFixed(2) }}</div>
          </div>
        </div>
        <div class="col-12 col-sm-3">
          <div class="stat-card">
            <div class="text-caption text-grey-7">Participantes</div>
            <div class="text-subtitle1">{{ detalhe.participantes.length }}</div>
          </div>
        </div>
        <div class="col-12 col-sm-3">
          <div class="stat-card">
            <div class="text-caption text-grey-7">Custo total</div>
            <div class="text-h6 text-primary">{{ formatCurrency(detalhe.reuniao.custoTotal) }}</div>
          </div>
        </div>
      </q-card-section>

      <div v-if="detalhe.reuniao.descricao" class="accent-divider" />

      <q-card-section v-if="detalhe.reuniao.descricao">
        {{ detalhe.reuniao.descricao }}
      </q-card-section>
    </q-card>

    <q-card v-if="detalhe" flat class="surface-card">
      <q-table
        flat
        row-key="id"
        :rows="detalhe.participantes"
        :columns="columns"
        no-data-label="Nenhum participante"
      >
        <template #body-cell-salarioMensalHistorico="props">
          <q-td :props="props">{{ formatCurrency(props.row.salarioMensalHistorico) }}</q-td>
        </template>

        <template #body-cell-custoHoraHistorico="props">
          <q-td :props="props">{{ formatCurrency(props.row.custoHoraHistorico) }}</q-td>
        </template>

        <template #body-cell-custoIndividual="props">
          <q-td :props="props">{{ formatCurrency(props.row.custoIndividual) }}</q-td>
        </template>
      </q-table>
    </q-card>

    <q-banner v-else-if="!carregando" rounded class="bg-grey-2 text-grey-8">
      Reuniao nao encontrada.
    </q-banner>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { buscarReuniaoComParticipantes } from 'src/services/reuniaoService'
import { formatCurrency } from 'src/utils/money'

const route = useRoute()
const detalhe = ref(null)
const carregando = ref(false)

const columns = [
  { name: 'nomeHistorico', label: 'Nome', field: 'nomeHistorico', align: 'left' },
  { name: 'cargoHistorico', label: 'Cargo', field: 'cargoHistorico', align: 'left' },
  { name: 'departamentoHistorico', label: 'Departamento', field: 'departamentoHistorico', align: 'left' },
  { name: 'salarioMensalHistorico', label: 'Salario', field: 'salarioMensalHistorico', align: 'right' },
  { name: 'custoHoraHistorico', label: 'Custo/hora', field: 'custoHoraHistorico', align: 'right' },
  { name: 'custoIndividual', label: 'Custo', field: 'custoIndividual', align: 'right' }
]

function formatDate (value) {
  return new Date(value).toLocaleString('pt-BR')
}

onMounted(async () => {
  carregando.value = true

  try {
    detalhe.value = await buscarReuniaoComParticipantes(route.params.id)
  } finally {
    carregando.value = false
  }
})
</script>
