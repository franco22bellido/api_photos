import { config } from "dotenv"
config()
const {env} = process;
let development = env.NODE_ENV === 'DEV'

export const keys = {
    CLOUDINARY_CLOUD_NAME : env.cloudinary_cloud_name,
    CLOUDINARY_API_KEY : env.cloudinary_api_key,
    CLOUDINARY_API_SECRET : env.cloudinary_api_secret,
    FRONT_END_HOST : development ? env.frontend_host_dev : env.frontend_host,
    PORT : development ? 4000 : env.port
}