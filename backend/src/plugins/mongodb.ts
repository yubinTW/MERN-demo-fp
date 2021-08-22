import mongoose from 'mongoose'
import * as dotEnv from 'dotenv'
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as E from 'fp-ts/Either'

dotEnv.config()
const host = process.env.MONGO_HOST || 'localhost'
const port = process.env.MONGO_PORT || 27017
const database = process.env.MONGO_DATABASE || 'fastify'

const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
}

const establishConnection = () =>
  pipe(
    !process.env.JEST_WORKER_ID && mongoose.connection.readyState === 0,
    E.fromPredicate(
      (b) => b,
      () => console.log('Mongo had connected or running test cases')
    ),
    E.map((_) => {
      mongoose.connect(`mongodb://${host}:${port}/${database}`, mongoOptions, (err) =>
        pipe(
          err,
          O.fromNullable,
          O.match(
            () => console.log('MongoDB connection successful.'),
            () => console.log('Error in DB connection : ' + JSON.stringify(err, undefined, 2))
          )
        )
      )
    })
  )

export { establishConnection }
