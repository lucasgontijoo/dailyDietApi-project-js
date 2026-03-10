import { FastifyInstance } from "fastify";
import { knex } from "../database.js";
import z from "zod";
import crypto from 'node:crypto'
import { authenticate } from "../middlewares/authenticate.js";

export async function mealsRoutes(app: FastifyInstance) {

    // Route to create a new meal
    app.post('/', {
        onRequest: [authenticate]
    }, async(request, reply) => {
        const userId = request.user?.id

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
            in_diet,
            session_id: userId
        })

        return reply.status(201).send()
    })

    // Route to total update an existing meal
    app.put('/:id', {
        onRequest: [authenticate]
    }, async(request, reply) => {
        const userId = request.user?.id

        const updateTotalMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            in_diet: z.boolean(),
        })

        // O id está separado pois é recebido na URL e não no body
        const updateMealIdSchema =  z.object({
            id: z.uuid()
        })

        const { name, description, in_diet} = updateTotalMealBodySchema.parse(request.body)
        const { id } = updateMealIdSchema.parse(request.params)

        const meal = await knex('meals').where({
            id: id,
            session_id: userId
        }).update({
            name: name,
            description: description,
            in_diet: in_diet
        })

        if(!meal) {
            return reply.status(401).send({
                message: "Unauthorized"
            })
        }
    })

    // Route to parcial update an existing meal
    app.patch('/:id', {
        onRequest: [authenticate]
    }, async(request, reply) => {
        const userId = request.user?.id

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

        const meal = await knex('meals').where({
            id: id,
            session_id: userId
        }).update({
            name: name,
            description: description,
            in_diet: in_diet
        })

        if(!meal) {
            return reply.status(401).send({
                message: "Unauthorized"
            })
        }
    })

    // Route to delete an existing meal
    app.delete('/:id', {
        onRequest: [authenticate]
    }, async(request, reply) => {
        const userId = request.user?.id

        const deleteMealParamsSchema = z.object({
            id: z.uuid()
        })

        const { id } = deleteMealParamsSchema.parse(request.params)

        const meal = await knex('meals').where({
            id: id,
            session_id: userId
        }).del()

        if(!meal) {
            return reply.status(401).send({
                message: "Unauthorized"
            })
        }
    }) 

    // List all meals of an user
    app.get('/', {
        onRequest: [authenticate]
    }, async(request) => {
        const userId = request.user?.id

        const meals = await knex('meals').select('*').where({
            session_id: userId
        })

        return { meals }
    })

    // List a specific meal according to id
    app.get('/:id', {
        onRequest: [authenticate]
    }, async(request) => {
        const userId = request.user?.id

        const getMealParamsSchema = z.object({
            id: z.uuid()
        })
        
        const { id } = getMealParamsSchema.parse(request.params)

        const meal = await knex('meals').where({
            id: id,
            session_id: userId
        }).first()

        return { meal }
    })
}