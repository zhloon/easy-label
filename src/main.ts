import { createApp } from 'vue';
import { createPinia } from 'pinia'; // 🌟 引入 Pinia
import './style.css';
import App from './App.vue';

createApp(App).use(createPinia()).mount('#app'); // 🌟 挂载 Pinia   
