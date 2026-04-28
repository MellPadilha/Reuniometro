<template>
  <q-page class="page-wrap">
    <div class="row items-center justify-between page-heading">
      <div>
        <h1 class="text-h5 q-my-none">Nova reuniao</h1>
        <div class="text-caption text-grey-7">Participantes e custo previsto</div>
      </div>

      <q-btn flat icon="arrow_back" label="Voltar" to="/reunioes" />
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-5">
        <q-card flat class="soft-card form-card">
          <q-form class="q-gutter-md" @submit="salvar">
            <q-input v-model="form.titulo" outlined label="Titulo" :rules="[required]" />
            <q-input v-model="form.data" outlined type="datetime-local" label="Data" :rules="[required]" />
            <q-input
              v-model.number="form.duracaoMinutos"
              outlined
              type="number"
              step="1"
              label="Duracao em minutos"
              :rules="[positive]"
            />
            <q-input v-model="form.descricao" outlined type="textarea" label="Descricao" autogrow />
            <q-select
              v-model="participantesSelecionados"
              outlined
              multiple
              use-chips
              option-label="nome"
              :options="funcionarios"
              label="Participantes"
              :rules="[hasParticipants]"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.nome }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.departamento || 'Sem departamento' }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>{{ formatCurrency(scope.opt.custoHora) }}/h</q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-btn color="primary" icon="save" label="Salvar reuniao" type="submit" :loading="salvando" />
          </q-form>
        </q-card>
      </div>

      <div class="col-12 col-md-7">
        <q-card flat class="surface-card">
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle1">Preview</div>
              <div class="text-caption text-grey-7">{{ calculo.duracaoHoras.toFixed(2) }} horas</div>
            </div>
            <div class="text-h5 text-primary">{{ formatCurrency(calculo.custoTotal) }}</div>
          </q-card-section>

          <q-separator />

          <q-table
            flat
            row-key="funcionarioId"
            :rows="calculo.participantes"
            :columns="previewColumns"
            hide-pagination
            :pagination="{ rowsPerPage: 0 }"
            no-data-label="Selecione participantes"
          >
            <template #body-cell-custoHoraHistorico="props">
              <q-td :props="props">{{ formatCurrency(props.row.custoHoraHistorico) }}</q-td>
            </template>

            <template #body-cell-custoIndividual="props">
              <q-td :props="props">{{ formatCurrency(props.row.custoIndividual) }}</q-td>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { listarFuncionarios } from 'src/services/funcionarioService'
import { calcularCustosPreview, criarReuniao } from 'src/services/reuniaoService'
import { formatCurrency } from 'src/utils/money'

const $q = useQuasar()
const router = useRouter()
const salvando = ref(false)
const funcionarios = ref([])
const participantesSelecionados = ref([])
const form = ref({
  titulo: '',
  data: new Date().toISOString().slice(0, 16),
  duracaoMinutos: 60,
  descricao: ''
})

const previewColumns = [
  { name: 'nomeHistorico', label: 'Nome', field: 'nomeHistorico', align: 'left' },
  { name: 'departamentoHistorico', label: 'Departamento', field: 'departamentoHistorico', align: 'left' },
  { name: 'custoHoraHistorico', label: 'Custo/hora', field: 'custoHoraHistorico', align: 'right' },
  { name: 'custoIndividual', label: 'Custo', field: 'custoIndividual', align: 'right' }
]

const calculo = computed(() => calcularCustosPreview(participantesSelecionados.value, form.value.duracaoMinutos))

const required = (value) => !!String(value || '').trim() || 'Campo obrigatorio'
const positive = (value) => Number(value) > 0 || 'Informe um valor maior que zero'
const hasParticipants = (value) => value?.length > 0 || 'Selecione pelo menos 1 participante'

async function salvar () {
  salvando.value = true

  try {
    const resultado = await criarReuniao({
      ...form.value,
      funcionarioIds: participantesSelecionados.value.map((funcionario) => funcionario.id)
    })

    $q.notify({ type: 'positive', message: 'Reuniao salva.' })
    router.push(`/reunioes/${resultado.reuniao.id}`)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    salvando.value = false
  }
}

onMounted(async () => {
  funcionarios.value = await listarFuncionarios({ somenteAtivos: true })
})
</script>
