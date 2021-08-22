import { ITodo } from './../types/todo'
import Todo from './../models/todo'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import { pipe } from 'fp-ts/lib/function'

interface TodoRepo {
  getTodos(): TE.TaskEither<Error, Readonly<Array<ITodo>>>
  addTodo(todoBody: ITodo): TE.TaskEither<Error, Readonly<ITodo>>
  updateTodo(id: string, todoBody: ITodo): TE.TaskEither<Error, O.Option<Readonly<ITodo>>>
  deleteTodo(id: string): TE.TaskEither<Error, O.Option<Readonly<ITodo>>>
}

class TodoRepoImpl implements TodoRepo {
  private constructor() {}

  static of(): TodoRepoImpl {
    return new TodoRepoImpl()
  }

  getTodos(): TE.TaskEither<Error, Readonly<Array<ITodo>>> {
    return TE.tryCatch(
      () => Todo.find().exec(),
      (error) => new Error(`Failed to get todos: ${error}`)
    )
  }

  addTodo(todoBody: ITodo): TE.TaskEither<Error, Readonly<ITodo>> {
    return pipe(
      TE.tryCatch(
        () => Todo.create(todoBody),
        (error) => new Error(`Failed to add todo: ${error}`)
      )
    )
  }

  updateTodo(id: string, todoBody: ITodo): TE.TaskEither<Error, O.Option<Readonly<ITodo>>> {
    return pipe(
      TE.tryCatch(
        () => Todo.findByIdAndUpdate(id, todoBody, { new: true }).exec(),
        (error) => new Error(`Failed to update todo: ${error}`)
      ),
      TE.map((r) => (r ? O.some(r) : O.none))
    )
  }

  deleteTodo(id: string): TE.TaskEither<Error, O.Option<Readonly<ITodo>>> {
    return pipe(
      TE.tryCatch(
        () => Todo.findByIdAndRemove(id).exec(),
        (error) => new Error(`Failed to delete todo: ${error}`)
      ),
      TE.map((r) => (r ? O.some(r) : O.none))
    )
  }
}

export { TodoRepoImpl }
