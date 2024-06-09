import express from 'express';
import { config } from 'dotenv'
const sharp = require('@img/sharp-win32-x64/sharp.node')
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import cors from 'cors'
import ServerlessHttp from 'serverless-http';


config()

cloudinary.config(
    {
        cloud_name: process.env.cloudinary_cloud_name,
        api_key: process.env.cloudinary_api_key,
        api_secret: process.env.cloudinary_api_secret
    }
)

const app = express()
const upload = multer()

app.use(cors({ origin: [process.env.frontend_host] }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const allowedExtensions = ['jpg', 'jpeg', 'png', 'bmp']

app.get('/api', (req, res) => {
    return res.json({
        messages: "hello world!"
    })
})

app.post('/api/upload', upload.single('photo'), async (req, res) => {
    let pasos = '';
    const maxSize = 1024 * 1024 * 15;
    if (req.file.size > maxSize) return res.status(406).json({ message: "the max size is 15 megabytes" })

    const fileExtension = req.file.mimetype.split('/')[1]
    if (!allowedExtensions.includes(fileExtension)) return res.status(415).json({ ok: false, message: 'unsupported format' })
    pasos = 'paso uno terminado'
    try {
        
        const imagenCompressed = await sharp(req.file.buffer)
            .jpeg({ quality: 30 })
            .resize({ width: 1080, height: 1350, fit: 'cover', position: 'center' })
            .toBuffer()
        pasos = 'paso 2 terminado'
        const response = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({}, (err, result) => {
                if (err) {
                    return reject(err)
                }
                return resolve(result)
            }).end(imagenCompressed)
        })
        pasos = 'paso 3 terminado'
        res.json({ ok: true, message: "photo uploaded", url: response.secure_url })
    } catch (error) {
        const newError = error.message;
        return res.send({newError ,error, pasos})
    }
});

const handler = ServerlessHttp(app);

module.exports.handler = async (event, context) => {
    const result = await handler(event, context)
    return result
}