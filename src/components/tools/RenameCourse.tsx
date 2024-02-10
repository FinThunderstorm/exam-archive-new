import { redirect } from 'next/navigation'

import { urlForCourseListing } from '@lib/courses'
import { CourseName } from '@lib/types'
import {
  findCourseByName,
  getCourseInfo,
  renameCourse
} from '@services/archive'
import { validateRights } from '@services/tkoUserService'

import Button from '@components/Button'
import Input from '@components/Input'

interface RenameCourseProps {
  currentName: string
  courseId: number
}

const RenameCourse = async ({ currentName, courseId }: RenameCourseProps) => {
  const handleRenameCourse = async (formData: FormData) => {
    'use server'
    const isRights = await validateRights('rename')
    if (!isRights) {
      throw new Error('Unauthorized')
    }

    const body = CourseName.safeParse(formData.get('courseName'))
    if (!body.success) {
      return 'Invalid course name'
    }

    const courseId = parseInt(formData.get('courseId') as unknown as string, 10) // TODO: make better type check
    const course = await getCourseInfo(courseId)
    if (!course) {
      return 'Course not found'
    }

    if (body.data === course.name) {
      return 'No changes needed'
    }

    const existingCourse = await findCourseByName(body.data.trim())
    if (existingCourse) {
      return `Course ${existingCourse.name} already exists!`
    }

    const renamedCourse = await renameCourse(course.id, body.data)

    redirect(urlForCourseListing())
  }

  const isRights = await validateRights('rename')

  if (!isRights) {
    return null
  }

  return (
    <form action={handleRenameCourse} aria-labelledby="renameCourseTitle">
      <div className="flex flex-col gap-2">
        <h3
          id="renameCourseTitle"
          className="font-serif text-xl font-bold leading-tight"
        >
          Rename course
        </h3>
        <Input
          name="courseName"
          title={`Give new name for course "${currentName}"`}
          defaultValue={currentName}
          className="w-full lg:w-1/2"
        />
        <input hidden name="courseId" defaultValue={courseId} />
        <Button
          type="submit"
          name="renameCourse"
          title={`Rename course "${currentName}"`}
          text={`Rename course`}
          className="w-fit text-left"
        />
      </div>
    </form>
  )
}

export default RenameCourse
