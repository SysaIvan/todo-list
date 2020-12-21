<template>
  <v-card
    :class="['todo-card d-flex align-center', { 'todo-card--completed': completed, 'todo-card--expired': expired && !completed }]"
  >
    <v-checkbox v-model="localCompleted" class="ml-5" />
    <div>
      <v-card-title :class="{ 'text-decoration-line-through': completed }">{{ dataSet.title }}</v-card-title>
      <v-card-subtitle>
        {{ dataSet.date }} {{ dataSet.time }}
        <template v-if="!completed">
          - time left:
          <span class="text--primary" :key="updateTime">{{ dataSet.timestamp | timeLeft }}</span>
        </template>
      </v-card-subtitle>
    </div>
    <v-card-actions class="ml-auto">
      <v-menu
        bottom
        left
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            dark
            icon
            v-bind="attrs"
            v-on="on"
          >
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item link @click="openTodoItem('item')">
            <v-list-item-title>View</v-list-item-title>
          </v-list-item>
          <v-list-item link @click="openTodoItem('edit')">
            <v-list-item-title>Edit</v-list-item-title>
          </v-list-item>
          <v-list-item link @click="removeTodo">
            <v-list-item-title class="red--text">Delete</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>

    <TodoItem
      ref="todoItem"
      v-if="showDialog"
      :data-set="dataSet"
      :type="todoItemType"
      @dialogClosed="showDialog = $event"
    />
  </v-card>
</template>

<script lang="ts">
import { Component, Prop, Ref, Vue, Watch } from 'nuxt-property-decorator'
import TodoItem from '~/components/blocks/TodoItem.vue';
import { TodoStatus } from '~/enums/TodoStatus';
import { Todo } from '~/interfaces/Todo';
import TodosStore from '~/store/TodosStore';

@Component({
  components: { TodoItem },
  filters: {
    timeLeft: (value: number) => {
      const countDownDate = new Date(value).getTime()
      const now = new Date().getTime()
      const diff = countDownDate - now

      const tdays = Math.floor(diff / (1000 * 60 * 60 * 24))
      const thours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const tminutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      const twoCharNumber = (val: number) => {
        return val < 10 ? '0' + val : val
      }

      return diff < 0 ? '00h 00m' : `${tdays === 0 ? ''
        : twoCharNumber(tdays) + 'd '}${twoCharNumber(thours)}h ${twoCharNumber(tminutes)}m`
    }
  }
})
export default class TodoCard extends Vue {
  @Prop({ required: true })
  dataSet!: Todo

  @Ref('todoItem') todoItem!: TodoItem

  updateTime = 1
  localCompleted = this.dataSet.status === TodoStatus.COMPLETED

  todoItemType = 'item'
  showDialog = false

  get expired() {
    return this.dataSet.timestamp < Date.now()
  }

  get completed() {
    return this.dataSet.status === TodoStatus.COMPLETED
  }

  @Watch('localCompleted')
  onToggleComplete(val: boolean) {
    TodosStore.updateTodoStatus({ id: this.dataSet.id, status: val ? TodoStatus.COMPLETED : TodoStatus.NEW })
  }

  mounted() {
    if (this.dataSet.status === TodoStatus.NEW) {
      console.log('1111', this.expired)
      this.$nuxt.$on('globalMinuteTimer', () => {
        this.updateTime++
        console.log('qqqqqq', this.expired)
        if (this.expired) {
          if (this.dataSet.status === TodoStatus.NEW) {
            this.showNotification()
            TodosStore.updateTodoStatus({ id: this.dataSet.id, status: TodoStatus.EXPIRED })
          }
        }
      })
    }
  }

  destroyed() {
    this.$nuxt.$off('globalMinuteTimer')
  }

  showNotification() {
    console.log('test')
    const createNotification = () => {
      const notification = new Notification(
        this.dataSet.title + ' - ' + this.dataSet.date + ' ' + this.dataSet.time,
        { body: this.dataSet.text }
      );
    }

    if (!('Notification' in window)) {
      console.error('This browser does not support desktop notification')
    } else if (Notification.permission === 'granted') {
      createNotification()
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission((permission) => {
        if (permission === 'granted') {
          createNotification()
        }
      });
    }
  }

  openTodoItem(type = 'item') {
    this.todoItemType = type
    this.showDialog = true
    this.$nextTick(() => this.todoItem.newTodoDialog = true)
  }

  removeTodo() {
    TodosStore.removeTodo(this.dataSet.id)
  }
}
</script>

<style lang="scss">
.todo-card {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    border-radius: 4px 0 0 4px;
    left: 0;
    top: 0;
    z-index: 3;
    height: 100%;
    width: 4px;
    background-color: #4CAF50;
  }

  &--completed {
    &::after {
      background-color: #FFEB3B;
    }
  }

  &--expired {
    &::after {
      background-color: #F44336;
    }
  }
}
</style>
