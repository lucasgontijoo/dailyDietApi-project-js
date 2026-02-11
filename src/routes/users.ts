import { FastifyInstance } from 'fastify';
import { z } from 'zod'
import { app } from '../app' 

export async function usersRoutes(app: FastifyInstance) {

    // Route to create a new user
    app.post('/user', (request, reply) => {
        const createUserBodySchema = z.object({
            
        })
    })
}