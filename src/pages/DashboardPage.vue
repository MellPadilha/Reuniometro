<template>
  <q-page class="page-wrap">
    <div class="row items-center justify-between page-heading">
      <div>
        <h1 class="text-h5 q-my-none">Dashboard</h1>
        <div class="text-caption text-grey-7">Gastos com reunioes por periodo</div>
      </div>

      <q-select
        v-model="anoSelecionado"
        outlined
        dense
        emit-value
        map-options
        :options="anosDisponiveis"
        label="Ano"
        class="dashboard-year-select"
      />
    </div>

    <div class="row q-col-gutter-lg q-mb-lg">
      <div v-for="card in cardsResumo" :key="card.titulo" class="col-12 col-md-4">
        <q-card flat class="dashboard-summary-card">
          <q-card-section>
            <div class="row items-start justify-between no-wrap">
              <div>
                <div class="text-caption text-grey-7">{{ card.titulo }}</div>
                <div class="text-h5 text-weight-bold q-mt-xs">{{ formatCurrency(card.total) }}</div>
              </div>

              <q-avatar :icon="card.icon" color="primary" text-color="white" />
            </div>

            <div class="row items-center justify-between q-mt-md text-caption text-grey-7">
              <span>{{ card.quantidade }} reunioes</span>
              <span>Media {{ formatCurrency(card.media) }}</span>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-lg-7">
        <q-card flat class="surface-card">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1">Gastos mensais</div>
              <div class="text-caption text-grey-7">{{ anoSelecionado }}</div>
            </div>
            <div class="text-subtitle1 text-primary">{{ formatCurrency(totalAno) }}</div>
          </q-card-section>

          <div class="accent-divider" />

          <q-card-section class="q-gutter-md">
            <div v-for="mes in gastosMensais" :key="mes.numero" class="dashboard-bar-row">
              <div class="dashboard-bar-label">
                <span>{{ mes.nome }}</span>
                <span class="text-grey-7">{{ formatCurrency(mes.total) }}</span>
              </div>
              <q-linear-progress
                rounded
                size="12px"
                :value="mes.percentual"
                color="primary"
                track-color="purple-1"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-5">
        <q-card flat class="surface-card">
          <q-card-section>
            <div class="text-subtitle1">Maiores custos</div>
            <div class="text-caption text-grey-7">Reunioes mais caras do ano</div>
          </q-card-section>

          <div class="accent-divider" />

          <q-list separator>
            <q-item v-for="reuniao in maioresCustos" :key="reuniao.id">
              <q-item-section>
                <q-item-label>{{ reuniao.titulo }}</q-item-label>
                <q-item-label caption>{{ formatDate(reuniao.data) }}</q-item-label>
              </q-item-section>

              <q-item-section side class="text-primary text-weight-medium">
                {{ formatCurrency(reuniao.custoTotal) }}
              </q-item-section>
            </q-item>

            <q-item v-if="!maioresCustos.length">
              <q-item-section class="text-grey-7">Nenhuma reuniao registrada neste ano.</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { listarReunioes } from 'src/services/reuniaoService'
import { formatCurrency, roundMoney } from 'src/utils/money'

const reunioes = ref([])
const anoSelecionado = ref(new Date().getFullYear())

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' })

const anosDisponiveis = computed(() => {
  const anos = new Set([new Date().getFullYear()])

  reunioes.value.forEach((reuniao) => {
    anos.add(new Date(reuniao.data).getFullYear())
  })

  return [...anos]
    .sort((a, b) => b - a)
    .map((ano) => ({
      label: String(ano),
      value: ano
    }))
})

const reunioesDoAno = computed(() =>
  reunioes.value.filter((reuniao) => new Date(reuniao.data).getFullYear() === anoSelecionado.value)
)

const agora = computed(() => new Date())

const reunioesDoMes = computed(() =>
  reunioesDoAno.value.filter((reuniao) => {
    const data = new Date(reuniao.data)
    return data.getMonth() === agora.value.getMonth()
  })
)

const reunioesDoSemestre = computed(() => {
  const semestreInicial = agora.value.getMonth() < 6 ? 0 : 6
  const semestreFinal = semestreInicial + 5

  return reunioesDoAno.value.filter((reuniao) => {
    const mes = new Date(reuniao.data).getMonth()
    return mes >= semestreInicial && mes <= semestreFinal
  })
})

const totalMes = computed(() => somaCustos(reunioesDoMes.value))
const totalSemestre = computed(() => somaCustos(reunioesDoSemestre.value))
const totalAno = computed(() => somaCustos(reunioesDoAno.value))

const cardsResumo = computed(() => [
  criarCard('Mes atual', 'calendar_month', reunioesDoMes.value, totalMes.value),
  criarCard('Semestre atual', 'date_range', reunioesDoSemestre.value, totalSemestre.value),
  criarCard('Ano', 'query_stats', reunioesDoAno.value, totalAno.value)
])

const gastosMensais = computed(() => {
  const totais = Array.from({ length: 12 }, (_, mes) => ({
    numero: mes,
    nome: monthFormatter.format(new Date(anoSelecionado.value, mes, 1)).replace('.', ''),
    total: 0
  }))

  reunioesDoAno.value.forEach((reuniao) => {
    const mes = new Date(reuniao.data).getMonth()
    totais[mes].total += Number(reuniao.custoTotal || 0)
  })

  const maiorTotal = Math.max(...totais.map((mes) => mes.total), 0)

  return totais.map((mes) => ({
    ...mes,
    total: roundMoney(mes.total),
    percentual: maiorTotal > 0 ? mes.total / maiorTotal : 0
  }))
})

const maioresCustos = computed(() =>
  [...reunioesDoAno.value].sort((a, b) => Number(b.custoTotal || 0) - Number(a.custoTotal || 0)).slice(0, 5)
)

function somaCustos (lista) {
  return roundMoney(lista.reduce((total, reuniao) => total + Number(reuniao.custoTotal || 0), 0))
}

function criarCard (titulo, icon, lista, total) {
  return {
    titulo,
    icon,
    total,
    quantidade: lista.length,
    media: lista.length ? roundMoney(total / lista.length) : 0
  }
}

function formatDate (value) {
  return new Date(value).toLocaleDateString('pt-BR')
}

onMounted(async () => {
  reunioes.value = await listarReunioes()
})
</script>
