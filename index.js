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


app.use(cors({origin: [keys.FRONT_END_HOST]}))
app.use(express.json({limit: '15mb'}))
app.use(express.urlencoded({ extended: true, limit: '15mb'}))

const allowedExtensions = ['jpg', 'jpeg', 'png', 'bmp']
app.get('/', (req, res)=> {
    res.json({message: "hello world"})
})

app.post('/api/upload', upload.single('photo'), async (req, res) => {
    const maxSize = 1024 * 1024 * 15;
    try {
    if(req.file.size>maxSize) return res.status(406).json({message: "the max size is 15 megabytes"})
        
        const fileExtension = req.file.mimetype.split('/')[1]
    if (!allowedExtensions.includes(fileExtension)) return res.status(415).json({ ok: false, message: 'unsupported format' })

        const imagenCompressed = await sharp(req.file.buffer)
            .jpeg({ quality: 30 })
            .resize({ width: 1080, height: 1350, fit: 'cover', position: 'center' })
            .toBuffer()

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
