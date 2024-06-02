import { redirect } from 'next/navigation'

export const fileDownloadUrl = (fileId: number, fileName: string) =>
  `/files/${fileId}/${fileName}`

export const verifyFileName = (id: number, name: string, slug: string) => {
  if (slug !== name) {
    redirect(fileDownloadUrl(id, name))
  }
}
