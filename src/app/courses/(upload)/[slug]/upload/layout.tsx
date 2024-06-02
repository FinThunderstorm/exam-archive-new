import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { urlForCourse, parseSlug, verifyCourseSlug } from '@lib/courses'
import { getCourseInfo } from '@services/archive'

import ListingNavigation from '@components/Navigation'

export const generateMetadata = async ({
  params
}: {
  params: { slug: string }
}): Promise<Metadata> => {
  const { id } = parseSlug(params.slug)
  const course = await getCourseInfo(id)

  if (!course) {
    notFound()
  }

  return {
    title: `Upload files - ${course.name} - Tärpistö - TKO-äly ry`,
    description: 'The TKO-äly ry exam archive'
  }
}

const Layout = async ({
  children,
  params
}: {
  children: React.ReactNode
  params: { slug: string }
}) => {
  const { id, courseSlug } = parseSlug(params.slug)
  const course = await getCourseInfo(id)

  if (!course) {
    notFound()
  }

  verifyCourseSlug(course.id, course.name, courseSlug)

  return (
    <div className="page-container bg-gray-50 shadow-lg">
      <ListingNavigation
        title={`Upload files to "${course.name}"`}
        label={`Back to course "${course.name}"`}
        backButtonHref={urlForCourse(course.id, course.name)}
      ></ListingNavigation>
      <main>{children}</main>
    </div>
  )
}

export default Layout
