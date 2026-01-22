import { z } from 'zod'
import 'dotenv/config' 

// Valida as variáveis de ambiente
const envSchema = z.object({
    PORT: z.number().default(3333),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
    DATABASE_URL: z.string()
})

const _env = envSchema.safeParse(process.env)

if (_env.success == false) {
    const tree = z.treeifyError(_env.error)

    throw new Error(`⚠️  Invalid environment variables! \n ${JSON.stringify(tree, null, 2)}`,)
}

export const env = _env.data