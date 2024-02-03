import { redirect } from 'next/navigation'

import { parseSlug } from '@lib/courses'
import { getCourseInfo } from '@services/archive'

import Modal from '@components/Modal'
import UploadFiles from '@components/tools/UploadFiles'
import { validateRights } from '@services/tkoUserService'

const Page = async ({ params }: any) => {
  const isRights = await validateRights('upload')

  if (!isRights) {
    redirect('/')
  }

  const { id } = parseSlug(params.slug)

  const course = await getCourseInfo(id)

  return (
    <Modal title={`Upload files to "${course.name}"`}>
      <div
        aria-label={`Upload files to "${course.name}"`}
        className="flex flex-col gap-8"
        data-course-id={course.id}
        data-course-name={course.name}
      >
        <UploadFiles courseId={id} />
      </div>
    </Modal>
  )
}

export default Page
