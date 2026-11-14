
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
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
  // =====================================================
  // UPLOAD ANTIGO - MANTIDO PARA COMPATIBILIDADE
  // =====================================================

  async upload(caminhoArquivo: string, key: string, contentType: string) {
    const body = fs.readFileSync(caminhoArquivo)

    console.log('========================')
    console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME)
    console.log('R2_ENDPOINT:', process.env.R2_ENDPOINT)
    console.log('KEY:', key)
    console.log('CONTENT TYPE:', contentType)
    console.log('========================')

    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    )

    console.log('UPLOAD REALIZADO COM SUCESSO')

    fs.unlinkSync(caminhoArquivo)

    return key
  }

  // =====================================================
  // NOVO UPLOAD DIRETO DO NAVEGADOR PARA O R2
  // =====================================================

  async gerarUrlUpload(
    key: string,
    contentType: string,
    expiresIn = 300,
  ) {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    })

    return getSignedUrl(client, command, {
      expiresIn,
    })
  }

  // =====================================================
  // VERIFICA SE O ARQUIVO CHEGOU AO R2
  // =====================================================

  async verificarUpload(key: string) {
    const resultado = await client.send(
      new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      }),
    )

    return {
      tamanho: resultado.ContentLength,
      contentType: resultado.ContentType,
    }
  }

  // =====================================================
  // REMOÇÃO - COMPORTAMENTO ORIGINAL
  // =====================================================

  async remover(key: string) {
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
      }),
    )
  }

  // =====================================================
  // URL PÚBLICA - COMPORTAMENTO ORIGINAL
  // =====================================================

  url(key: string) {
    return `https://midia.acaiecompanhia.com.br/${key}`
  }
}

export default new R2Service()
