import { FastifyInstance, RouteShorthandOptions, FastifyReply } from 'fastify'
import { ITodo } from '../types/todo'
import { TodoRepoImpl } from './../repo/todo-repo'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'

const TodoRouter = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  const todoRepo = TodoRepoImpl.of()

  interface IdParam {
    id: string
  }

  server.get('/todos', opts, async (request, reply) => {
    await pipe(
      todoRepo.getTodos(),
      TE.match<Error, FastifyReply, Readonly<Array<ITodo>>>(
        (error) => reply.status(500).send(`[Server Error]: ${error}`),
        (todos) => reply.status(200).send({ todos })
      )
    )()
  })

  server.post<{ Body: ITodo }>('/todos', opts, async (request, reply) => {
    const todoBody: ITodo = request.body

    await pipe(
      todoRepo.addTodo(todoBody),
      TE.match<Error, FastifyReply, Readonly<ITodo>>(
        (error) => reply.status(500).send(`[Server Error]: ${error}`),
        (todo) => reply.status(201).send({ todo })
      )
    )()
  })

  server.put<{ Params: IdParam; Body: ITodo }>('/todos/:id', opts, async (request, reply) => {
    const id = request.params.id
    const todoBody = request.body
    await pipe(
      todoRepo.updateTodo(id, todoBody),
      TE.match<Error, FastifyReply, O.Option<Readonly<ITodo>>>(
        (error) => reply.status(500).send(`[Server Error]: ${error}`),
        (r) =>
          pipe(
            r,
            O.match<Readonly<ITodo>, FastifyReply>(
              () => reply.status(404).send({ msg: `Not Found Todo:${id}` }),
              (todo) => reply.status(200).send({ todo })
            )
          )
      )
    )()
  })

  server.delete<{ Params: IdParam }>('/todos/:id', opts, async (request, reply) => {
    const id = request.params.id
    await pipe(
      todoRepo.deleteTodo(id),
      TE.match<Error, FastifyReply, O.Option<Readonly<ITodo>>>(
        (error) => reply.status(500).send(`[Server Error]: ${error}`),
        (r) =>
          pipe(
            r,
            O.match<Readonly<ITodo>, FastifyReply>(
              () => reply.status(404).send({ msg: `Not Found Todo:${id}` }),
              () => reply.status(204).send()
            )
          )
      )
    )()
  })

  done()
}

export { TodoRouter }
