import { FastifyReply, FastifyRequest } from "fastify"
import jwt from 'jsonwebtoken'
import { env } from '../env/index'
import { JWTUser } from "../@types/jwt"

export async function authenticate(request: FastifyRequest, reply:FastifyReply) {
    try {
        const token = request.headers.authorization

        if(!token) {
            throw new Error("Token not provided.")
        }   

        const decodedJwt = jwt.verify(token, env.JWT_KEY) as JWTUser
        request.user = decodedJwt
        
    } catch(error) {
        reply.status(401).send({
            error: "Authenticated fail."
        })
    }
}