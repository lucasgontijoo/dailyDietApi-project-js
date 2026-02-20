import { FastifyInstance } from 'fastify';
import { knex } from '../database.js';
import { z } from 'zod'
import crypto from 'node:crypto'      

export async function usersRoutes(app: FastifyInstance) {

    // Route to create a new user
    app.post('/', async(request, reply) => {
        const createUserBodySchema = z.object({
            name: z.string(),
            email: z.string()
        })

        const { name, email } = createUserBodySchema.parse(request.body)

        await knex('users').insert({
            name,
            email,
            id: crypto.randomUUID()
        })

        return reply.status(201).send()
    })

    app.get('/', async() => {
        const users = await knex('users').select('*')
        
        return { users }
    })
}