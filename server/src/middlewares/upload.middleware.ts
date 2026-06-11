import multer from 'multer'
import { Request } from 'express'
import path from 'path'
import fs from 'fs'

const pastaUploads = path.resolve(process.cwd(), 'uploads', 'propagandas')

if (!fs.existsSync(pastaUploads)) {
  fs.mkdirSync(pastaUploads, {
    recursive: true,
  })
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: any, cb: any) => {
    cb(null, pastaUploads)
  },
  filename: (_req: Request, file: any, cb: any) => {
    const nomeLimpo = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^\w.-]/g, '')

    cb(null, `${Date.now()}-${nomeLimpo}`)
  },
})

const fileFilter = (_req: Request, file: any, cb: any) => {
  console.log('MIME:', file.mimetype)

  const permitido =
    file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')

  if (!permitido) {
    return cb(new Error('Somente imagens e vídeos são permitidos.'))
  }

  cb(null, true)
}
export const uploadPropaganda = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
})
