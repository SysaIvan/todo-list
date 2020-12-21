<template>
  <v-app dark>
    <v-app-bar
      fixed
      app
    >
      <v-toolbar-title>
        Todo List
      </v-toolbar-title>

      <div class="ml-auto">
        <TodoItem type="new">
          <template #activator="{ on, attrs }">
            <v-btn dark color="primary" v-bind="attrs" v-on="on">
              NEW todo
            </v-btn>
          </template>
        </TodoItem>
      </div>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { Vue, Component } from 'nuxt-property-decorator'
import TodoItem from '~/components/blocks/TodoItem'

@Component({
  components: { TodoItem }
})
export default class DefaultLayout extends Vue {
  timer = null

  mounted() {
    this.timer = setInterval(() => this.$nuxt.$emit('globalMinuteTimer'), 6000)
  }

  destroyed() {
    clearInterval(this.timer)
  }
}
</script>
