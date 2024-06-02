import { format } from 'date-fns'
import { fi as fiLocale } from 'date-fns/locale'

import Link from 'next/link'
import { FolderIcon, PencilSquareIcon } from '@heroicons/react/24/solid'

import { urlForCourse } from '@lib/courses'
import type { CourseListItem as CourseListItemType } from '@lib/types'

interface CourseListItemProps {
  course: CourseListItemType
  showManage: boolean
}

const CourseListItem = ({ course, showManage }: CourseListItemProps) => {
  const { id, name, url, lastModified } = course

  return (
    <div
      role="row"
      className="list-row py-2 hover:bg-slate-100"
      data-course-id={id}
      data-course-name={name}
    >
      <FolderIcon
        role="cell"
        className="list-row-icon mx-2 h-6 w-6 fill-cyan-500"
      />
      <div role="cell" className="list-row-name">
        <Link
          href={url}
          title={`Open course "${name}"`}
          arial-label={`Open course "${name}"`}
          className="hover:underline hover:decoration-cyan-500"
        >
          {name}
        </Link>
      </div>
      {lastModified && (
        <time
          role="cell"
          className="list-row-date font-mono text-xs text-gray-600"
          title={`Last modified on ${format(lastModified, 'yyyy-MM-dd', {
            locale: fiLocale
          })}`}
          dateTime={lastModified.toISOString()}
          data-test-id="last-modified-time"
        >
          {format(lastModified, 'yyyy-MM-dd', { locale: fiLocale })}
        </time>
      )}
      {showManage && (
        <div role="cell" className="list-row-manage">
          <Link
            aria-label={`Manage course "${name}"`}
            title={`Manage course "${name}"`}
            href={`${urlForCourse(id, name)}/manage`}
            className="mx-2 flex w-10 flex-row bg-gray-800 px-3 py-1 font-serif lowercase text-white ring-inset hover:bg-gray-600 focus:ring focus:ring-gray-400"
          >
            <PencilSquareIcon className="h-4 w-4 self-center" />{' '}
            <span className="sr-only">{`Manage course "${name}"`}</span>
          </Link>
        </div>
      )}
    </div>
  )
}

export default CourseListItem
