import { NextResponse } from 'next/server'

import config from '@lib/config'
import { findFileById } from '@services/archive'
import s3 from '@services/s3'
import { validateRights } from '@services/tkoUserService'
import { verifyFileName } from '@lib/files'

export const GET = async (
  req: Request,
  { params }: { params: { fileId: string; fileName: string } }
) => {
  const isRights = await validateRights('access')

  if (!isRights) {
    return new NextResponse('401 Unauthorized', { status: 401 })
  }

  const fileId = parseInt(params.fileId, 10)
  if (isNaN(fileId)) {
    return new NextResponse('404 File not found', { status: 404 })
  }
  const file = await findFileById(fileId)
  if (!file) {
    return new NextResponse('404 File not found', { status: 404 })
  }

  verifyFileName(fileId, file.fileName, params.fileName)

  const stream = await s3.getObject({
    Bucket: config.AWS_S3_BUCKET_ID,
    Key: file.filePath
  })

  if (!stream || !stream.Body) {
    return new NextResponse('404 File not found', { status: 404 })
  }

  return new NextResponse(stream.Body.transformToWebStream(), {
    headers: { 'Content-Type': file.mimeType }
  })
}
