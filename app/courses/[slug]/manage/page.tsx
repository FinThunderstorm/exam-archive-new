import { notFound, redirect } from 'next/navigation'

// import { slugifyCourseName, urlForCourse } from '@lib/courses'
import { getSession } from '@lib/sessions'
import { getCourseInfo } from '@services/archive'

import DeleteCourse from '@components/tools/DeleteCourse'
import RenameCourse from '@components/tools/RenameCourse'

const parseSlug = (slug: string) => {
  const parsedSlug = slug.match(/(?<id>\d+)-(?<courseSlug>.*)/)
  if (!parsedSlug || !parsedSlug.groups) {
    notFound()
  }

  const id = parseInt(parsedSlug.groups.id, 10)

  if (isNaN(id)) {
    notFound()
  }

  return {
    id,
    courseSlug: parsedSlug.groups.courseSlug
  }
}

const Page = async ({ params }: any) => {
  const { rights } = await getSession()

  if (!rights.rename || !rights.remove) {
    redirect('/')
  }

  const { id, courseSlug } = parseSlug(params.slug)

  const course = await getCourseInfo(id)
  if (!course) {
    notFound()
  }

  // if (courseSlug !== slugifyCourseName(course.name)) {
  //   return redirect(urlForCourse(course.id, course.name))
  // }

  return (
    <div className="flex flex-col gap-8 pb-5">
      <RenameCourse courseId={course.id} currentName={course.name} />
      <DeleteCourse courseId={course.id} courseName={course.name} />
    </div>
  )
}

export default Page
