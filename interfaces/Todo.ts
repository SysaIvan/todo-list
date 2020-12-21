import { TodoStatus } from '~/enums/TodoStatus';

export interface Todo {
  id: number,
  title: string,
  date: string,
  time: string,
  text?: string,
  timestamp: number,
  status: TodoStatus
}

export interface TodoDto {
  title: string,
  date: string,
  time: string,
  text?: string
}
