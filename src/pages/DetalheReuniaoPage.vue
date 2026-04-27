<template>
  <q-page class="q-pa-md" v-if="reuniao">
    <div class="text-h6">{{ reuniao.titulo }}</div>
    <div class="text-caption q-mb-md">{{ new Date(reuniao.data).toLocaleString('pt-BR') }} - {{ reuniao.duracaoMinutos }} minutos</div>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1">Participantes (snapshot histórico)</div>
        <q-markup-table flat dense>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Cargo</th>
              <th>Departamento</th>
              <th>Custo hora histórico</th>
              <th>Custo individual</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in participantes" :key="p.id">
              <td>{{ p.nomeHistorico }}</td>
              <td>{{ p.cargoHistorico }}</td>
              <td>{{ p.departamentoHistorico }}</td>
              <td>{{ formatCurrency(p.custoHoraHistorico) }}</td>
              <td>{{ formatCurrency(p.custoIndividual) }}</td>
            </tr>
          </tbody>
        </q-markup-table>

        <div class="text-weight-bold q-mt-md">Custo total: {{ formatCurrency(reuniao.custoTotal) }}</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import reuniaoService from '../services/reuniaoService';
import { formatCurrency } from '../utils/currency';

const route = useRoute();
const reuniao = ref(null);
const participantes = ref([]);

const carregar = async () => {
  const data = await reuniaoService.obterDetalheReuniao(route.params.id);
  reuniao.value = data.reuniao;
  participantes.value = data.participantes;
};

carregar();
</script>
