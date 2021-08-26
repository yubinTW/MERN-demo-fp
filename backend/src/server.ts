import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import FastifyStatic from 'fastify-static'
import { Server, IncomingMessage, ServerResponse } from 'http'
import path from 'path'
import { establishConnection } from './plugins/mongodb'
import { TodoRouter } from './routes/todo'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
  logger: { prettyPrint: true }
})

const startFastify: (port: number) => FastifyInstance<Server, IncomingMessage, ServerResponse> = (port) => {
  server.register(require('fastify-cors'), {})

  server.listen(port, (err, _) => {
    pipe(
      err,
      E.fromPredicate(
        (err) => err !== null,
        () => establishConnection()
      ),
      E.map((r) => console.error(r))
    )
  })

  server.register(FastifyStatic, {
    root: path.join(__dirname, '../../frontend/build'),
    prefix: '/'
  })

  server.get('/ping', async (request, reply) => {
    return reply.status(200).send({ msg: 'pong' })
  })

  server.register(TodoRouter, { prefix: '/api' })

  return server
}

export { startFastify }
