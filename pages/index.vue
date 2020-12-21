<template>
  <v-row justify="center" align="center">
    <v-col :key="updateKey" cols="12" sm="8" md="6">
      <template v-if="todos.overdue.length">
        <h4 class="text-h5">Overdue</h4>
        <v-divider class="my-3" />
        <TodoCard v-for="todo in todos.overdue" :key="todo.id" :data-set="todo" class="mb-4" />
      </template>

      <h4 :class="['text-h5', { 'mt-7': todos.overdue.length }]">Upcoming</h4>
      <v-divider class="my-3" />
      <template v-if="todos.upcoming.length">
        <TodoCard v-for="todo in todos.upcoming" :key="todo.id" :data-set="todo" class="mb-4" />
      </template>
      <span v-else>No upcoming todos</span>

      <template v-if="todos.other.length">
        <h4 class="text-h5 mt-7">Planned</h4>
        <v-divider class="my-3" />
        <TodoCard v-for="todo in todos.other" :key="todo.id" :data-set="todo" class="mb-4" />
      </template>

      <h4 class="text-h5 mt-7">Completed</h4>
      <v-divider class="my-3" />
      <template v-if="todos.completed.length">
        <TodoCard v-for="todo in todos.completed" :key="todo.id" :data-set="todo" class="mb-4" />
      </template>
      <span v-else>No completed todos</span>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator';
import TodoCard from '~/components/cards/TodoCard.vue';
import TodosStore from '~/store/TodosStore';

@Component({
  components: { TodoCard }
})
export default class HomePage extends Vue {
  updateKey = 1

  get todos() {
    return TodosStore.dashboardTodos
  }

  mounted () {
    this.$nuxt.$on('globalMinuteTimer', () => this.updateKey++)
  }

  destroyed() {
    this.$nuxt.$off('globalMinuteTimer')
  }
}
</script>
