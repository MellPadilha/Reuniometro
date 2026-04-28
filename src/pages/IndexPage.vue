<template>
  <q-page class="page-wrap">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <h1 class="text-h5 q-my-none">Funcionarios</h1>
        <div class="text-caption text-grey-7">Cadastro e custos por hora</div>
      </div>

      <q-btn color="primary" icon="add" label="Novo" @click="abrirModal()" />
    </div>

    <q-input
      v-model="filtro"
      outlined
      dense
      debounce="250"
      class="q-mb-md"
      placeholder="Filtrar por nome ou departamento"
      @update:model-value="carregarFuncionarios"
    >
      <template #prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <q-table
      flat
      bordered
      row-key="id"
      :rows="funcionarios"
      :columns="columns"
      :loading="carregando"
      no-data-label="Nenhum funcionario cadastrado"
    >
      <template #body-cell-salarioMensal="props">
        <q-td :props="props">{{ formatCurrency(props.row.salarioMensal) }}</q-td>
      </template>

      <template #body-cell-custoHora="props">
        <q-td :props="props">{{ formatCurrency(props.row.custoHora) }}</q-td>
      </template>

      <template #body-cell-ativo="props">
        <q-td :props="props">
          <q-badge :color="props.row.ativo ? 'positive' : 'grey-6'">
            {{ props.row.ativo ? 'Ativo' : 'Inativo' }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-acoes="props">
        <q-td :props="props" class="q-gutter-xs">
          <q-btn flat round dense icon="edit" color="primary" @click="abrirModal(props.row)">
            <q-tooltip>Editar</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="person_off"
            color="negative"
            :disable="!props.row.ativo"
            @click="inativar(props.row)"
          >
            <q-tooltip>Inativar</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="modalAberto" persistent>
      <q-card class="dialog-card">
        <q-card-section>
          <div class="text-h6">{{ form.id ? 'Editar funcionario' : 'Novo funcionario' }}</div>
        </q-card-section>

        <q-form @submit="salvar">
          <q-card-section class="q-gutter-md">
            <q-input v-model="form.nome" outlined label="Nome" :rules="[required]" />
            <q-input v-model="form.cargo" outlined label="Cargo" />
            <q-input v-model="form.departamento" outlined label="Departamento" />
            <q-input
              v-model.number="form.salarioMensal"
              outlined
              type="number"
              step="0.01"
              label="Salario mensal"
              :rules="[positive]"
            />
            <q-input
              v-model.number="form.cargaHorariaMensal"
              outlined
              type="number"
              step="1"
              label="Carga horaria mensal"
              :rules="[positive]"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn color="primary" label="Salvar" type="submit" :loading="salvando" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  criarFuncionario,
  editarFuncionario,
  inativarFuncionario,
  listarFuncionarios
} from 'src/services/funcionarioService'
import { formatCurrency } from 'src/utils/money'

const $q = useQuasar()
const filtro = ref('')
const funcionarios = ref([])
const carregando = ref(false)
const salvando = ref(false)
const modalAberto = ref(false)

const formInicial = {
  id: '',
  nome: '',
  cargo: '',
  departamento: '',
  salarioMensal: null,
  cargaHorariaMensal: 220
}

const form = ref({ ...formInicial })

const columns = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left', sortable: true },
  { name: 'cargo', label: 'Cargo', field: 'cargo', align: 'left' },
  { name: 'departamento', label: 'Departamento', field: 'departamento', align: 'left' },
  { name: 'salarioMensal', label: 'Salario', field: 'salarioMensal', align: 'right' },
  { name: 'cargaHorariaMensal', label: 'Horas/mes', field: 'cargaHorariaMensal', align: 'right' },
  { name: 'custoHora', label: 'Custo/hora', field: 'custoHora', align: 'right' },
  { name: 'ativo', label: 'Status', field: 'ativo', align: 'center' },
  { name: 'acoes', label: '', field: 'acoes', align: 'right' }
]

const required = (value) => !!String(value || '').trim() || 'Campo obrigatorio'
const positive = (value) => Number(value) > 0 || 'Informe um valor maior que zero'

async function carregarFuncionarios () {
  carregando.value = true

  try {
    funcionarios.value = await listarFuncionarios({ filtro: filtro.value })
  } finally {
    carregando.value = false
  }
}

function abrirModal (funcionario = null) {
  form.value = funcionario ? { ...funcionario } : { ...formInicial }
  modalAberto.value = true
}

async function salvar () {
  salvando.value = true

  try {
    if (form.value.id) {
      await editarFuncionario(form.value.id, form.value)
    } else {
      await criarFuncionario(form.value)
    }

    modalAberto.value = false
    await carregarFuncionarios()
    $q.notify({ type: 'positive', message: 'Funcionario salvo.' })
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  } finally {
    salvando.value = false
  }
}

async function inativar (funcionario) {
  await inativarFuncionario(funcionario.id)
  await carregarFuncionarios()
  $q.notify({ type: 'positive', message: 'Funcionario inativado.' })
}

onMounted(carregarFuncionarios)
</script>
