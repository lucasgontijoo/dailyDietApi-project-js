import { Knex } from 'knex'

declare module 'knex/types/tables' {
    export interface Tables {
        meals: {
            id: string
            name: string
            description: string
            created_at: string
            in_diet: boolean
            session_id: string
        }

        users: {
            id: string
            name: string
            email: string
            password: string
            created_at: string
        }
    }
}