import { FastifyInstance } from 'fastify';
import { knex } from '../database.js';
import { z } from 'zod'
import crypto from 'node:crypto' 
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../env/index'

export async function usersRoutes(app: FastifyInstance) {

    // Route to create a new user
    app.post('/', async(request, reply) => {
        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string(),
            password: z.string()
        })

        const { name, email, password } = createUserBodySchema.parse(request.body)

        const user = await knex('users').select('*').where({
          email
        })

        if(user.length != 0) {
          return reply.status(409).send({
            message: "Já existe um usuário com este email cadastrado."
          })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await knex('users').insert({
            name,
            email,
            password: hashedPassword,
            id: crypto.randomUUID()
        })

        return reply.status(201).send({
          message: "Usuário cadastrado com sucesso."
        })
    })

    // Route to list all users
    app.get('/', async() => {
        const users = await knex('users').select('*')
        
        return { users }
    })

    // Route to log in
    app.post('/login', async(request, reply) => {
      const loginUserBodySchema = z.object({
        email: z.string(),
        password: z.string()
      })

      const { email, password } = loginUserBodySchema.parse(request.body)

      const user = await knex('users').select('*').where({
        email
      }).first()

      if(!user) {
        return reply.status(401).send({
          message: "Não existe usuário cadastrado com as credenciais informadas."
        })
      }

      const passwordToCompare = user.password

      const isCorrectPassword = await bcrypt.compare(password, passwordToCompare)

      if(!isCorrectPassword) {
        return reply.status(401).send({
          message: "Não existe usuário cadastrado com as credenciais informadas."
        })
      }

      const token = jwt.sign({id: user.id, email: user.email}, env.JWT_KEY, {
        expiresIn: "1h"
      })

      return { token }
    })
}