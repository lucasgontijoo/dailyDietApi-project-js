import { FastifyInstance } from "fastify";
import { knex } from "../database.js";
import z from "zod";
import crypto from 'node:crypto'
import { request } from "node:http";

export async function mealsRoutes(app: FastifyInstance) {

    // Route to create a new meal
    app.post('/', async(request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            in_diet: z.boolean()
        })

        const { name, description, in_diet } = createMealBodySchema.parse(request.body)

        await knex('meals').insert({
            id: crypto.randomUUID(),
            name,
            description,
            in_diet
        })

        return reply.status(201).send()
    })

    // Route to update an existing meal
    app.put('/', async(request, reply) => {

    })

    // Route to delete an existing meal
    app.delete('/', async(request, reply) => {

    }) 

    // List all meals of an user
    app.get('/', async(request, reply) => {
        const meals = await knex('meals').select('*')

        return { meals }
    })

    // List a specific meal according to id
    app.get('/:id', async(request, reply) => {

        const getMealParamsSchema = z.object({
            id: z.uuid()
        })
        
        const { id } = getMealParamsSchema.parse(request.params)

        const meal = await knex('meals').where({
            id: id
        }).first()

        return { meal }
    })
}