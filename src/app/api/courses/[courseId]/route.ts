import { getCourseInfo } from '@services/archive'
import { validateRights } from '@services/tkoUserService'
import { NextResponse } from 'next/server'

export const GET = async (
  req: Request,
  {
    params
  }: {
    params: { courseId: string }
  }
) => {
  try {
    const isRights = await validateRights('access')
    if (!isRights) {
      return NextResponse.json(
        { error: '401 Unauthorized' },
        {
          status: 401
        }
      )
    }

    const courseId = parseInt(params.courseId, 10)

    const course = await getCourseInfo(courseId)

    if (!course) {
      return NextResponse.json({ error: '404 Not found' }, { status: 400 })
    }

    return NextResponse.json(course)
  } catch (e) {
    console.error('Error while getting courses', e)
    return NextResponse.json(
      { error: '500 Internal Server Error' },
      {
        status: 500
      }
    )
  }
}
