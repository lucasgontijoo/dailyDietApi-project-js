import { FastifyInstance } from "fastify";
import { knex } from "../database.js";
import z from "zod";
import crypto from 'node:crypto'

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

    // Route to total update an existing meal
    app.put('/:id', async(request, reply) => {
        const updateTotalMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            in_diet: z.boolean(),
        })

        const updateMealIdSchema =  z.object({
            id: z.uuid()
        })

        const { name, description, in_diet} = updateTotalMealBodySchema.parse(request.body)
        const { id } = updateMealIdSchema.parse(request.params)

        await knex('meals').where({
            id: id
        }).update({
            name: name,
            description: description,
            in_diet: in_diet
        })
    })

    // Route to parcial update an existing meal
    app.patch('/:id', async(request, reply) => {
        const updateParcialMealBodySchema = z.object({
            name: z.string().optional(),
            description: z.string().optional(),
            in_diet: z.boolean().optional(), 
        })

        const updateMealIdSchema =  z.object({
            id: z.uuid()
        })  

        const { name, description, in_diet} = updateParcialMealBodySchema.parse(request.body)
        const { id } = updateMealIdSchema.parse(request.params)

        await knex('meals').where({
            id: id
        }).update({
            name: name,
            description: description,
            in_diet: in_diet
        })
    })

    // Route to delete an existing meal
    app.delete('/:id', async(request, reply) => {
        const deleteMealParamsSchema = z.object({
            id: z.uuid()
        })

        const { id } = deleteMealParamsSchema.parse(request.params)

        await knex('meals').where({
            id: id
        }).del()
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