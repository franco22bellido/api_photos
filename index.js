import express from 'express';
import * as formidable from 'formidable';
import sharp from 'sharp';
import fs from 'fs/promises'

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.post('/api/upload', async (req, res, next) => {
    const form = new formidable.IncomingForm()

    try {
        const [fields, files] = await form.parse(req);
        const file = files.myfile[0]
        console.log(file.filepath)
        sharp.cache(false)
        
        const imagenCompressed = await sharp(file.filepath)
        .jpeg({quality : 30})
        .resize({width: 1080, height: 1350, fit: 'cover', position: 'center'})
        .toBuffer()
        fs.writeFile(file.filepath, imagenCompressed)
        res.json({ok: true, message: "photo uploaded"})
    } catch (error) {
        console.log(error)
    }
  });

app.listen(3000, ()=> {
    console.log("server on port 3000")
})