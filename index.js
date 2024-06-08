import express from 'express';
import * as formidable from 'formidable';
import sharp from 'sharp';
import fs from 'fs/promises'
import { config } from 'dotenv'
import { v2 as cloudinary } from 'cloudinary'
config()

cloudinary.config(
    {
        cloud_name: process.env.cloudinary_cloud_name,
        api_key: process.env.cloudinary_api_key,
        api_secret: process.env.cloudinary_api_secret
    }
)

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/api/upload', async (req, res, next) => {
    const form = new formidable.IncomingForm()

    try {
        const [fields, files] = await form.parse(req);
        const file = files.myfile[0]
        console.log(file.filepath)
        sharp.cache(false)

        const imagenCompressed = await sharp(file.filepath)
            .jpeg({ quality: 30 })
            .resize({ width: 1080, height: 1350, fit: 'cover', position: 'center' })
            .toBuffer()
        
        const response = await new Promise((resolve, reject)=> {
            cloudinary.uploader.upload_stream({}, (err, result)=> {
                if(err) {
                    return reject(err)
                }
                return resolve(result)
            }).end(imagenCompressed)
        })
        
        res.json({ ok: true, message: "photo uploaded", url: response.secure_url })
    } catch (error) {
        console.log(error)
        return res.json(error)
    }
});

app.listen(3000, () => {
    console.log("server on port 3000")
})