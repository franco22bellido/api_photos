import express from 'express';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import cors from 'cors'
import { keys } from './entorn_variables.js';


cloudinary.config(
    {
        cloud_name: keys.CLOUDINARY_CLOUD_NAME,
        api_key: keys.CLOUDINARY_API_KEY,
        api_secret: keys.CLOUDINARY_API_SECRET
    }
)

const app = express()
const upload = multer()


app.use(cors({ origin: [keys.FRONT_END_HOST] }))
app.use(express.json({ limit: '15mb' }))
app.use(express.urlencoded({ extended: true, limit: '15mb' }))

const allowedExtensions = ['jpg', 'jpeg', 'png', 'bmp']
app.get('/', (req, res) => {
    res.json({ message: "hello world" })
})

app.delete('/api/photo/:public_id', async (req, res) => {
    try {
        const { public_id } = req.params
        const result = await new Promise((resolve, reject)=> {
            cloudinary.uploader.destroy(public_id, {}, (err, response)=> {
                if(err) {
                    return reject(err)
                }
                return resolve(response)
            })
        })

        return res.status(204).json(result)
    } catch (error) {
        return res.status(500).json(error)
    }

})

app.post('/api/photo', upload.single('photo'), async (req, res) => {
    const maxSize = 1024 * 1024 * 15;
    try {
        if (req.file.size > maxSize) return res.status(413).json({ message: "the max size is 15 megabytes" })


        const { width, height } = await sharp(req.file.buffer).metadata();


        let newWidth, newHeight;

        if (width > height) {
            newWidth = 1080;
            newHeight = Math.round((height / width) * newWidth);
        } else {
            newHeight = 1350;
            newWidth = Math.round((width / height) * newHeight);
        }

        const imagenCompressed = await sharp(req.file.buffer)
            .jpeg({ quality: 30 })
            .resize({ width: newWidth, height: newHeight, fit: 'cover', position: 'center' })
            .toBuffer();

        const response = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({}, (err, result) => {
                if (err) {
                    return reject(err)
                }
                return resolve(result)
            }).end(imagenCompressed)
        })

        res.json({ ok: true, message: "photo uploaded", url: response.secure_url })
    } catch (error) {
        return res.status(400).send(error)
    }
});

app.listen(keys.PORT, () => {
    console.log(`SERVER ON PORT ${keys.PORT}`)
})
