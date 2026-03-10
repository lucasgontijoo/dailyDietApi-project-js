import { FastifyInstance } from 'fastify';
import { knex } from '../database.js';
import { boolean, int, number, z } from 'zod'
import crypto from 'node:crypto' 
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../env/index'
import { authenticate } from '../middlewares/authenticate.js';

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
            message: "A user with this email address is already registered."
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
          message: "User successfully registered."
        })
    })

    // Route to list all users - PARA CONTROLE DO DEV
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
          message: "There is no registered user with the provided credentials."
        })
      }

      const passwordToCompare = user.password

      const isCorrectPassword = await bcrypt.compare(password, passwordToCompare)

      if(!isCorrectPassword) {
        return reply.status(401).send({
          message: "There is no registered user with the provided credentials."
        })
      }

      const token = jwt.sign({id: user.id, email: user.email}, env.JWT_KEY, {
        expiresIn: "6h"
      })

      return { token }
    })

    // Overview 
    app.get('/overview', {
      onRequest: [authenticate]
    }, async(request, reply) => {
      const userId = request.user?.id

      const totalMeals = await knex('meals').count('*', {as: 'Total meals: '}).where({
        session_id: userId
      }).first()

      const totalMealsInDiet = await knex('meals').count('*', {as: 'Total meals in diet: '}).where({
        session_id: userId,
        in_diet: true
      }).first()

      const totalMealsOutDiet = await knex('meals').count('*', {as: 'Total meals out diet: '}).where({
        session_id: userId,
        in_diet: false
      }).first()

      const meals = await knex('meals').select('*').where({
        session_id: userId
      })

      const bestSequence = meals.reduce<{currentSequence: number, bestSequence: number}>((acc, meal) => {
        if(meal.in_diet) {
          acc.currentSequence += 1
        } else {
          acc.currentSequence = 0
        }

        if(acc.currentSequence > acc.bestSequence) {
          acc.bestSequence = acc.currentSequence
        }

        return acc
      }, {bestSequence: 0, currentSequence: 0})

      return reply.send({
        totalMeals, 
        totalMealsInDiet, 
        totalMealsOutDiet, 
        bestSequence
      })
    })
}