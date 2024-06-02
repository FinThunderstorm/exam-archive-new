import { notFound } from 'next/navigation'

import { getFileNameById } from '@services/archive'

import UpdateFile from '@components/tools/UpdateFile'
import DeleteFile from '@components/tools/DeleteFile'
import { validateUserRights } from '@services/tkoUserService'

const Page = async ({
  params
}: {
  params: { fileId: string; fileName: string }
}) => {
  await validateUserRights('rename', 'remove')

  const fileId = parseInt(params.fileId, 10)

  const file = await getFileNameById(parseInt(params.fileId))

  if (!file) {
    notFound()
  }

  return (
    <div className="content-container flex flex-col gap-8 pb-5">
      <UpdateFile
        fileId={fileId}
        currentName={file.fileName}
        currentType={file.type}
      />
      <DeleteFile fileId={fileId} fileName={file.fileName} />
    </div>
  )
}

export default Page
