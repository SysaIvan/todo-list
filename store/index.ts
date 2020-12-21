import { NuxtCookies } from 'cookie-universal-nuxt';
import Vuex, { Store } from 'vuex';
import Vue from 'vue'

Vue.use(Vuex)

declare module 'vuex/types/index' {
  interface Store<S> {
    $cookiz: NuxtCookies
  }
}

interface RootState {}

export const COOKIES_TODOS_KEY = 'TODOS'

export const store = new Vuex.Store<RootState>({
  actions: {
    nuxtServerInit: ({ commit }, { $cookiz }) => {
      commit('TodosStore/setTodos', $cookiz.get(COOKIES_TODOS_KEY) || [])
    }
  }
});

const createStore = (): Store<RootState> => {
  return store;
};

export default createStore;
