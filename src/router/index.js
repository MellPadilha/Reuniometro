import { createRouter, createWebHashHistory } from 'vue-router';
import FuncionariosPage from '../pages/FuncionariosPage.vue';
import ReunioesPage from '../pages/ReunioesPage.vue';
import NovaReuniaoPage from '../pages/NovaReuniaoPage.vue';
import DetalheReuniaoPage from '../pages/DetalheReuniaoPage.vue';

const routes = [
  { path: '/', redirect: '/funcionarios' },
  { path: '/funcionarios', component: FuncionariosPage },
  { path: '/reunioes', component: ReunioesPage },
  { path: '/reunioes/nova', component: NovaReuniaoPage },
  { path: '/reunioes/:id', component: DetalheReuniaoPage, props: true }
];

export default createRouter({
  history: createWebHashHistory(),
  routes
});
