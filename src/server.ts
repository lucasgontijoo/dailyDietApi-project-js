import { app } from '../src/app'
import { env } from './env'

app.listen({
    port: env.PORT,
}).then(() => {
    console.log('HTTP Server Running...')
})