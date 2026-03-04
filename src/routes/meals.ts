import { FastifyInstance } from "fastify";
import { knex } from "../database.js";
import z from "zod";
import crypto from 'node:crypto'
import { checkSessionIdExists } from "../middlewares/check-session-id-exists.js";

export async function mealsRoutes(app: FastifyInstance) {

    // Route to create a new meal
    app.post('/', async(request, reply) => {
        const createMealBodySchema = z.object({
            name: z.string(),
            description: z.string(),
            in_diet: z.boolean()
        })

        const { name, description, in_diet } = createMealBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if(!sessionId) {
            sessionId = crypto.randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 days 
            })
        }

        await knex('meals').insert({
            id: crypto.randomUUID(),
            name,
            description,
            in_diet,
            session_id: sessionId
        })

        return reply.status(201).send()
    })

    // Route to total update an existing meal
    app.put('/:id', {
        preHandler: [checkSessionIdExists]
    }, async(request) => {
        const { sessionId } = request.cookies

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
            id: id,
            session_id: sessionId
        }).update({
            name: name,
            description: description,
            in_diet: in_diet
        })
    })

    // Route to parcial update an existing meal
    app.patch('/:id', {
        preHandler: [checkSessionIdExists]
    }, async(request) => {
        const { sessionId } = request.cookies

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
            id: id,
            session_id: sessionId
        }).update({
            name: name,
            description: description,
            in_diet: in_diet
        })
    })

    // Route to delete an existing meal
    app.delete('/:id', {
        preHandler: [checkSessionIdExists]
    }, async(request) => {
        const { sessionId } = request.cookies

        const deleteMealParamsSchema = z.object({
            id: z.uuid()
        })

        const { id } = deleteMealParamsSchema.parse(request.params)

        await knex('meals').where({
            id: id,
            session_id: sessionId
        }).del()
    }) 

    // List all meals of an user
    app.get('/', {
        preHandler: [checkSessionIdExists]
    }, async(request) => {
        const { sessionId } = request.cookies

        const meals = await knex('meals').select('*').where({
            session_id: sessionId
        })

        return { meals }
    })

    // List a specific meal according to id
    app.get('/:id', {
        preHandler: [checkSessionIdExists]
    }, async(request) => {
        const { sessionId } = request.cookies

        const getMealParamsSchema = z.object({
            id: z.uuid()
        })
        
        const { id } = getMealParamsSchema.parse(request.params)

        const meal = await knex('meals').where({
            id: id,
            session_id: sessionId
        }).first()

        return { meal }
    })
}