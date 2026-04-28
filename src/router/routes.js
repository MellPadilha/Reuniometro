const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'reunioes', component: () => import('pages/ReunioesPage.vue') },
      { path: 'reunioes/nova', component: () => import('pages/NovaReuniaoPage.vue') },
      { path: 'reunioes/:id', component: () => import('pages/ReuniaoDetalhePage.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
