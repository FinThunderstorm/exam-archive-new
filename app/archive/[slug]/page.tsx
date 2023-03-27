import Footer from '@components/Footer'
import FlashMessage from '@components/FlashMessage'
import ListingNavigation from '@components/Navigation'
import ExamList from '@components/ExamList'
import { ControlsBox, Logout } from '@components/Controls'
import UploadExamForm from '@components/forms/UploadExamForm'

import { slugifyCourseName } from '@utilities/courses'
import { examDownloadUrl } from '@utilities/exams'

import RenameCourse from '@components/tools/RenameCourse'
import DeleteCourse from '@components/tools/DeleteCourse'

import { getSession } from '@services/tkoUserService'
import { getCourseInfo } from '@services/archive'

export const metadata = {
  title: 'placeholder - Tärpistö - TKO-äly ry'
}

const Page = async ({ params }: any) => {
  const { user, rights } = await getSession()

  const flash = {
    msg: 'toot',
    type: 'info'
  }

  const parsedParams = params.slug.match(/(?<id>\d+)-(?<courseSlug>.*)/)
  const { id: unparsedId, courseSlug } = parsedParams.groups

  const id = parseInt(unparsedId, 10)
  if (isNaN(id)) {
    return <></>
  }

  const course = await getCourseInfo(id)

  if (!course) {
    return <></>
  }

  if (courseSlug !== slugifyCourseName(course.name)) {
    // return res.redirect(302, urlForCourse(course.id, course.name))
  }

  const exams = course.exams.map(exam => ({
    ...exam,
    downloadUrl: examDownloadUrl(exam.id, exam.fileName)
  }))

  return (
    <>
      <ListingNavigation title={course.name} backButtonHref="/" />
      <div className="page-container">
        <FlashMessage flash={flash} />
        <main>
          <ExamList courseId={course.id} exams={exams} rights={rights} />

          <ControlsBox>
            {rights.upload && <UploadExamForm courseId={course.id} />}
            {rights.rename && (
              <RenameCourse currentName={course.name} courseId={course.id} />
            )}
            {rights.remove && <DeleteCourse courseId={course.id} />}
            <Logout username={user.username} />
          </ControlsBox>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Page
