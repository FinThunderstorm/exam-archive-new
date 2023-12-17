import { notFound, redirect } from 'next/navigation'

import { getSessionUser } from '@services/tkoUserService'
import { getCourseInfo } from '@services/archive'

import ExamListHeader from '@components/ExamList/ExamListHeader'
import NoExamsFound from '@components/ExamList/NoExamsFound'
import ExamListItem from '@components/ExamList/ExamListItem'

// import { slugifyCourseName, urlForCourse } from '@lib/courses'

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
  const { rights } = await getSessionUser()
  const { id: courseId, courseSlug } = parseSlug(params.slug)

  // if (courseSlug !== slugifyCourseName(course.name)) {
  //   return redirect(urlForCourse(course.id, course.name))
  // }

  const course = await getCourseInfo(courseId)
  if (!course) {
    notFound()
  }

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-1 divide-y divide-yellow-500">
        <h3 className="px-2 font-serif text-xl font-bold lowercase leading-tight">
          Exams
        </h3>
        <div
          role="table"
          aria-label="Exams"
          className="list-container divide-y"
          data-course-id={course.id}
          data-course-name={course.name}
        >
          <ExamListHeader showManage={rights.remove || rights.rename} />
          {course.exams.length === 0 && <NoExamsFound />}
          {course.exams.map(exam => (
            <ExamListItem
              exam={exam}
              showManage={rights.remove || rights.rename}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1 divide-y divide-yellow-500">
        <h3 className="px-2 font-serif text-xl font-bold lowercase leading-tight">
          Lecture notes
        </h3>
        <div
          role="table"
          aria-label="Lecture notes"
          className="list-container divide-y"
          data-course-id={course.id}
          data-course-name={course.name}
        >
          <ExamListHeader showManage={rights.remove || rights.rename} />
          {course.notes.length === 0 && <NoExamsFound />}
          {course.notes.map(exam => (
            <ExamListItem
              exam={exam}
              showManage={rights.remove || rights.rename}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1 divide-y divide-yellow-500">
        <h3 className="px-2 font-serif text-xl font-bold lowercase leading-tight">
          Exercises
        </h3>
        <div
          role="table"
          aria-label="Exercises"
          className="list-container divide-y"
          data-course-id={course.id}
          data-course-name={course.name}
        >
          <ExamListHeader showManage={rights.remove || rights.rename} />
          {course.exercises.length === 0 && <NoExamsFound />}
          {course.exercises.map(exam => (
            <ExamListItem
              exam={exam}
              showManage={rights.remove || rights.rename}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1 divide-y divide-yellow-500">
        <h3 className="px-2 font-serif text-xl font-bold lowercase leading-tight">
          Others
        </h3>
        <div
          role="table"
          aria-label="Others"
          className="list-container divide-y"
          data-course-id={course.id}
          data-course-name={course.name}
        >
          <ExamListHeader showManage={rights.remove || rights.rename} />
          {course.others.length === 0 && <NoExamsFound />}
          {course.others.map(exam => (
            <ExamListItem
              exam={exam}
              showManage={rights.remove || rights.rename}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

export default Page
