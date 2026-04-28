<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h6">Reuniões</div>
      <q-space />
      <q-btn color="primary" label="Nova reunião" to="/reunioes/nova" class="q-mr-sm" />
      <q-btn color="secondary" label="Exportar Excel" @click="exportar" />
    </div>

    <q-list bordered separator>
      <q-item v-for="item in reunioes" :key="item.id" clickable :to="`/reunioes/${item.id}`">
        <q-item-section>
          <q-item-label>{{ item.titulo }}</q-item-label>
          <q-item-label caption>{{ new Date(item.data).toLocaleString('pt-BR') }} - {{ item.duracaoMinutos }} min</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge color="primary">{{ formatCurrency(item.custoTotal) }}</q-badge>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { Notify } from 'quasar';
import reuniaoService from '../services/reuniaoService';
import exportService from '../services/exportService';
import { formatCurrency } from '../utils/currency';

const reunioes = ref([]);

const carregar = async () => {
  reunioes.value = await reuniaoService.listarReunioes();
};

const exportar = async () => {
  try {
    const filePath = await exportService.exportarExcel();
    Notify.create({ type: 'positive', message: `Exportado em ${filePath}` });
  } catch (error) {
    Notify.create({ type: 'negative', message: error.message });
  }
};

carregar();
</script>
