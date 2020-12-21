import { getModule, Module, VuexAction, VuexModule, VuexMutation } from 'nuxt-property-decorator'
import { TodoStatus } from '~/enums/TodoStatus';
import { Todo, TodoDto } from '~/interfaces/Todo';
import { COOKIES_TODOS_KEY, store } from '~/store/index';

@Module({
  name: 'TodosStore',
  namespaced: true,
  dynamic: true,
  store
})
class TodosStore extends VuexModule {
  _todos: Todo[] = []

  @VuexMutation
  setTodos(payload: Todo[]) {
    this._todos = payload
  }

  @VuexAction
  addTodo(newTodo: TodoDto) {
    const todo: Todo = {
      ...newTodo,
      id: Date.now(),
      status: TodoStatus.NEW,
      timestamp: Date.parse(newTodo.date + ' ' + newTodo.time + ':00')
    }

    this.setTodos([...this._todos, todo])
    this.updateCookies()
  }

  @VuexAction
  updateTodo(newTodo: Todo) {
    newTodo.timestamp = Date.parse(newTodo.date + ' ' + newTodo.time + ':00')
    newTodo.status = TodoStatus.NEW

    const todos = [...this._todos]
    todos[todos.findIndex(todo => todo.id === newTodo.id)] = newTodo
    this.setTodos(todos)
    this.updateCookies()
  }

  @VuexAction
  updateTodoStatus(payload: { id: number, status: TodoStatus }) {
    const todos = [ ...this._todos ]
    const todoIndex = todos.findIndex(todo => todo.id === payload.id)

    todos[todoIndex].status = payload.status

    this.setTodos(todos)
    this.updateCookies()
  }

  @VuexAction
  removeTodo(id: number) {
    this.setTodos(this._todos.filter(todo => todo.id !== id))
    this.updateCookies()
  }

  @VuexAction
  updateCookies() {
    store.$cookiz.set(COOKIES_TODOS_KEY, [...this._todos], { path: '/' })
  }

  get dashboardTodos() {
    const overdue: Todo[] = []
    const upcoming: Todo[] = []
    const other: Todo[] = []
    const completed: Todo[] = []

    this._todos.sort((a, b) => a.timestamp - b.timestamp).forEach(todo => {
      if (todo.status === TodoStatus.COMPLETED) {
        completed.push(todo)
      } else {
        if (todo.timestamp < Date.now()) {
          overdue.push(todo)
        } else if (todo.timestamp < Date.now() + 1000 * 60 * 60 * 24) {
          upcoming.push(todo)
        } else {
          other.push(todo)
        }
      }
    })

    return { overdue, upcoming, other, completed }
  }
}

export default getModule(TodosStore)
