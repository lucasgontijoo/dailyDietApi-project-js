import { FastifyInstance } from 'fastify';
import { app } from '../app' 

export async function usersRoutes(app: FastifyInstance) {
    // Route to create a new user
    app.post('/user', () => {
        
    })
}