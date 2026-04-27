import { createApp } from 'vue';
import { Quasar, Notify } from 'quasar';
import router from './router';
import App from './App.vue';
import 'quasar/dist/quasar.css';

createApp(App).use(Quasar, { plugins: { Notify } }).use(router).mount('#app');
