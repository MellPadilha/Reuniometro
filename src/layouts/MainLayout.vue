<template>
  <q-layout view="lHh Lpr lFf">
    <q-header bordered class="bg-white text-dark">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>Reuniometro</q-toolbar-title>

        <q-btn flat round icon="file_download" to="/reunioes">
          <q-tooltip>Exportar</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label header>Menu</q-item-label>

        <q-item
          v-for="link in menuLinks"
          :key="link.title"
          clickable
          v-ripple
          :to="link.to"
          exact
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ link.title }}</q-item-label>
            <q-item-label caption>{{ link.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

const menuLinks = [
  {
    title: 'Funcionarios',
    caption: 'Cadastro e custos',
    icon: 'groups',
    to: '/'
  },
  {
    title: 'Reunioes',
    caption: 'Custos e exportacao',
    icon: 'event',
    to: '/reunioes'
  }
]

const leftDrawerOpen = ref(false)

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
