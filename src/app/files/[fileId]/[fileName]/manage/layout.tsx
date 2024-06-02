import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { urlForCourse } from '@lib/courses'
import { getFileNameById } from '@services/archive'

import ListingNavigation from '@components/Navigation'

export const generateMetadata = async ({
  params
}: {
  params: { fileId: string; fileName: string }
}): Promise<Metadata> => {
  const fileId = parseInt(params.fileId, 10)

  const file = await getFileNameById(fileId)

  if (!file) {
    notFound()
  }

  return {
    title: `Manage file ${file.fileName} - Tärpistö - TKO-äly ry`,
    description: 'The TKO-äly ry exam archive'
  }
}

const Layout = async ({
  children,
  params
}: {
  children: React.ReactNode
  params: { fileId: string; fileName: string }
}) => {
  const fileId = parseInt(params.fileId, 10)

  const file = await getFileNameById(fileId)

  if (!file) {
    notFound()
  }

  return (
    <div className="page-container bg-gray-50 shadow-lg">
      <ListingNavigation
        title={`Manage file "${file.fileName.replace(/_/g, '_\u200b')}"`}
        label={`Back to course "${file.courseName}"`}
        backButtonHref={urlForCourse(file.courseId, file.courseName)}
      ></ListingNavigation>
      <main>{children}</main>
    </div>
  )
}

export default Layout
