import { notFound, redirect } from 'next/navigation'

import { getFileNameById } from '@services/archive'

import Modal from '@components/Modal'
import DeleteFile from '@components/tools/DeleteFile'
import UpdateFile from '@components/tools/UpdateFile'
import { validateRights } from '@services/tkoUserService'

const Page = async ({
  params
}: {
  params: { fileId: string; fileName: string }
}) => {
  const isRights = await validateRights('rename', 'remove')

  if (!isRights) {
    redirect('/')
  }

  const fileId = parseInt(params.fileId, 10)

  const file = await getFileNameById(fileId)

  if (!file) {
    notFound()
  }

  return (
    <Modal title={`Manage file "${file.fileName}"`}>
      <div
        aria-label={`Manage file "${file.fileName}"`}
        className="flex flex-col gap-8"
      >
        <UpdateFile
          fileId={fileId}
          currentType={file.type}
          currentName={file.fileName}
        />
        <DeleteFile fileId={fileId} fileName={file.fileName} />
      </div>
    </Modal>
  )
}

export default Page
