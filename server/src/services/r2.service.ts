import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'

import fs from 'fs'

const client = new S3Client({
  region: 'auto',

  endpoint: process.env.R2_ENDPOINT,

  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

class R2Service {
  async upload(caminhoArquivo: string, key: string, contentType: string) {
    const body = fs.readFileSync(caminhoArquivo)

    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    )

    fs.unlinkSync(caminhoArquivo)

    return key
  }

  async remover(key: string) {
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      }),
    )
  }

  url(key: string) {
    const base = process.env.R2_PUBLIC_URL ?? process.env.R2_ENDPOINT

    return `${base}/${process.env.R2_BUCKET_NAME}/${key}`
  }
}

export default new R2Service()
