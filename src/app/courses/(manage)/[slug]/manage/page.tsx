import { notFound } from 'next/navigation'

import { parseSlug } from '@lib/courses'
import { getCourseInfo } from '@services/archive'

import DeleteCourse from '@components/tools/DeleteCourse'
import RenameCourse from '@components/tools/RenameCourse'
import { validateUserRights } from '@services/tkoUserService'

const Page = async ({ params }: { params: { slug: string } }) => {
  await validateUserRights('rename', 'remove')

  const { id } = parseSlug(params.slug)

  const course = await getCourseInfo(id)

  if (!course) {
    notFound()
  }

  return (
    <div className="content-container flex flex-col gap-8 pb-5">
      <RenameCourse courseId={course.id} currentName={course.name} />
      <DeleteCourse courseId={course.id} courseName={course.name} />
    </div>
  )
}

export default Page
