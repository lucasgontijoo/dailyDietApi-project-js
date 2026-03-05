import { FastifyRequest } from 'fastify'
import { JWTUser } from './jwt';

declare module 'fastify' {
    export interface FastifyRequest {
        user?: JWTUser
    }
}