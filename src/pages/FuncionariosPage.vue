<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-sm items-center q-mb-md">
      <q-input v-model="filtroNome" label="Buscar nome" dense outlined />
      <q-input v-model="filtroDepartamento" label="Departamento" dense outlined />
      <q-btn color="primary" label="Filtrar" @click="carregar" />
      <q-space />
      <q-btn color="positive" label="Novo" @click="abrirNovo" />
    </div>

    <q-table :rows="funcionarios" :columns="columns" row-key="id">
      <template #body-cell-custoHora="props">
        <q-td>{{ formatCurrency(props.row.custoHora) }}</q-td>
      </template>
      <template #body-cell-ativo="props">
        <q-td>
          <q-badge :color="props.row.ativo ? 'positive' : 'grey'">{{ props.row.ativo ? 'Ativo' : 'Inativo' }}</q-badge>
        </q-td>
      </template>
      <template #body-cell-acoes="props">
        <q-td>
          <q-btn flat dense icon="edit" @click="editar(props.row)" />
          <q-btn flat dense icon="block" color="negative" @click="inativar(props.row.id)" />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="modalAberto">
      <q-card style="min-width: 420px">
        <q-card-section>
          <div class="text-h6">{{ form.id ? 'Editar funcionário' : 'Novo funcionário' }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.nome" label="Nome" outlined dense />
          <q-input v-model="form.cargo" label="Cargo" outlined dense />
          <q-input v-model="form.departamento" label="Departamento" outlined dense />
          <q-input v-model.number="form.salarioMensal" type="number" label="Salário mensal" outlined dense />
          <q-input v-model.number="form.cargaHorariaMensal" type="number" label="Carga horária mensal" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Salvar" @click="salvar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { Notify } from 'quasar';
import funcionarioService from '../services/funcionarioService';
import { formatCurrency } from '../utils/currency';

const filtroNome = ref('');
const filtroDepartamento = ref('');
const funcionarios = ref([]);
const modalAberto = ref(false);
const form = ref({});

const columns = [
  { name: 'nome', label: 'Nome', field: 'nome', align: 'left' },
  { name: 'cargo', label: 'Cargo', field: 'cargo' },
  { name: 'departamento', label: 'Departamento', field: 'departamento' },
  { name: 'salarioMensal', label: 'Salário', field: 'salarioMensal' },
  { name: 'cargaHorariaMensal', label: 'Carga Horária', field: 'cargaHorariaMensal' },
  { name: 'custoHora', label: 'Custo Hora', field: 'custoHora' },
  { name: 'ativo', label: 'Status', field: 'ativo' },
  { name: 'acoes', label: 'Ações', field: 'acoes' }
];

const carregar = async () => {
  funcionarios.value = await funcionarioService.listarFuncionarios({
    filtro: filtroNome.value,
    departamento: filtroDepartamento.value
  });
};

const abrirNovo = () => {
  form.value = { ativo: true };
  modalAberto.value = true;
};

const editar = (row) => {
  form.value = { ...row };
  modalAberto.value = true;
};

const salvar = async () => {
  try {
    if (form.value.id) {
      await funcionarioService.editarFuncionario(form.value.id, form.value);
    } else {
      await funcionarioService.criarFuncionario(form.value);
    }
    modalAberto.value = false;
    await carregar();
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message });
  }
};

const inativar = async (id) => {
  await funcionarioService.inativarFuncionario(id);
  await carregar();
};

carregar();
</script>
