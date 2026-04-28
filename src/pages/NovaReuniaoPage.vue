<template>
  <q-page class="q-pa-md">
    <div class="text-h6 q-mb-md">Nova reunião</div>

    <div class="q-gutter-md" style="max-width: 720px">
      <q-input v-model="form.titulo" label="Título" outlined dense />
      <q-input v-model="form.data" type="datetime-local" label="Data" outlined dense />
      <q-input v-model.number="form.duracaoMinutos" type="number" label="Duração (min)" outlined dense @update:model-value="simular" />
      <q-input v-model="form.descricao" type="textarea" label="Descrição" outlined />

      <q-select
        v-model="form.funcionarioIds"
        :options="funcionariosOptions"
        emit-value
        map-options
        multiple
        label="Participantes"
        outlined
        dense
        @update:model-value="simular"
      />

      <q-card flat bordered>
        <q-card-section>
          <div class="text-subtitle1">Prévia de custos</div>
          <q-list dense>
            <q-item v-for="p in preview.participantes" :key="p.funcionarioId">
              <q-item-section>{{ p.nome }}</q-item-section>
              <q-item-section side>{{ formatCurrency(p.custoIndividual) }}</q-item-section>
            </q-item>
          </q-list>
          <div class="text-weight-bold q-mt-sm">Total: {{ formatCurrency(preview.custoTotal) }}</div>
        </q-card-section>
      </q-card>

      <q-btn color="primary" label="Salvar reunião" @click="salvar" />
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router';
import funcionarioService from '../services/funcionarioService';
import reuniaoService from '../services/reuniaoService';
import { formatCurrency } from '../utils/currency';

const router = useRouter();
const funcionariosOptions = ref([]);
const preview = ref({ participantes: [], custoTotal: 0 });
const form = ref({
  titulo: '',
  data: new Date().toISOString().slice(0, 16),
  duracaoMinutos: 60,
  descricao: '',
  funcionarioIds: []
});

const carregarFuncionarios = async () => {
  const funcionarios = await funcionarioService.listarFuncionariosAtivos();
  funcionariosOptions.value = funcionarios.map((item) => ({
    label: `${item.nome} (${item.departamento})`,
    value: item.id
  }));
};

const simular = async () => {
  preview.value = await reuniaoService.simularCustos(form.value);
};

const salvar = async () => {
  try {
    const { reuniao } = await reuniaoService.criarReuniao(form.value);
    Notify.create({ type: 'positive', message: 'Reunião criada com sucesso.' });
    router.push(`/reunioes/${reuniao.id}`);
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message });
  }
};

carregarFuncionarios();
simular();
</script>
