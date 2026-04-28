<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>Reuniômetro</q-toolbar-title>
        <q-btn flat to="/funcionarios" label="Funcionários" />
        <q-btn flat to="/reunioes" label="Reuniões" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
