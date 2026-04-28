<template>
  <q-page class="page-wrap">
    <div class="row items-center justify-between page-heading">
      <div>
        <h1 class="text-h5 q-my-none">Reunioes</h1>
        <div class="text-caption text-grey-7">Historico e exportacao</div>
      </div>

      <div class="row q-gutter-sm">
        <q-btn outline color="primary" icon="file_download" label="Exportar" :loading="exportando" @click="exportar" />
        <q-btn color="primary" icon="add" label="Nova reuniao" to="/reunioes/nova" />
      </div>
    </div>

    <q-card flat class="surface-card">
      <q-table
        flat
        row-key="id"
        :rows="reunioes"
        :columns="columns"
        :loading="carregando"
        no-data-label="Nenhuma reuniao cadastrada"
        @row-click="abrirDetalhe"
      >
        <template #body-cell-data="props">
          <q-td :props="props">{{ formatDate(props.row.data) }}</q-td>
        </template>

        <template #body-cell-duracao="props">
          <q-td :props="props">{{ props.row.duracaoMinutos }} min</q-td>
        </template>

        <template #body-cell-custoTotal="props">
          <q-td :props="props">{{ formatCurrency(props.row.custoTotal) }}</q-td>
        </template>

        <template #body-cell-acoes="props">
          <q-td :props="props">
            <q-btn flat round dense icon="chevron_right" color="primary" :to="`/reunioes/${props.row.id}`">
              <q-tooltip>Detalhe</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { listarReunioes } from 'src/services/reuniaoService'
import { exportarExcel } from 'src/services/exportService'
import { formatCurrency } from 'src/utils/money'

const $q = useQuasar()
const router = useRouter()
const reunioes = ref([])
const carregando = ref(false)
const exportando = ref(false)

const columns = [
  { name: 'titulo', label: 'Titulo', field: 'titulo', align: 'left', sortable: true },
  { name: 'data', label: 'Data', field: 'data', align: 'left', sortable: true },
  { name: 'duracao', label: 'Duracao', field: 'duracaoMinutos', align: 'right' },
  { name: 'custoTotal', label: 'Custo total', field: 'custoTotal', align: 'right', sortable: true },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' }
]

function formatDate (value) {
  return new Date(value).toLocaleString('pt-BR')
}

async function carregarReunioes () {
  carregando.value = true

  try {
    reunioes.value = await listarReunioes()
  } finally {
    carregando.value = false
  }
}

function abrirDetalhe (_, row) {
  router.push(`/reunioes/${row.id}`)
}

async function exportar () {
  exportando.value = true

  try {
    const resultado = await exportarExcel()
    $q.notify({ type: 'positive', message: `Excel exportado: ${resultado.filePath}` })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    exportando.value = false
  }
}

onMounted(carregarReunioes)
</script>
