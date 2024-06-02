import { notFound } from 'next/navigation'
import { dbPool } from '@lib/db'
import {
  Course,
  CourseListItem,
  CourseInfo,
  CourseId,
  FileId,
  File,
  CourseLI,
  FileLI,
  CreateFile,
  CreateCourse,
  Count,
  FileInfo
} from '@lib/types'

export class CourseNotFoundError extends Error {
  constructor(message?: string) {
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
    super(message) // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
  }
}

export class CannotDeleteError extends Error {
  constructor(message?: string) {
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#example
    super(message) // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
  }
}

/**
 * Deletes a course by ID and returns the deleted course.
 * @throws {CourseNotFoundError} if course is not found
 * @throws {CannotDeleteError} if course still has non-deleted exams
 */
export const deleteCourse = async (courseId: CourseId) => {
  const course = await dbPool.query(
    `
      SELECT
        COUNT(c.name)::INTEGER AS count
      FROM courses c
      WHERE c.id = $1 AND c.removed_at IS NULL
      LIMIT 1
    `,
    [courseId]
  )

  if (Count.parse(course.rows[0]) === 0) {
    throw new CourseNotFoundError('Course not found.')
  }

  const nonDeletedFiles = await dbPool.query(
    `
    SELECT
      COUNT(e.id)::INTEGER AS count
    FROM exams e
    WHERE e.course_id = $1 AND e.removed_at IS NULL
  `,
    [courseId]
  )

  if (Count.parse(nonDeletedFiles.rows[0]) > 0) {
    throw new CannotDeleteError('Cannot delete a course with documents.')
  }

  const result = await dbPool.query(
    `
    UPDATE courses
    SET removed_at = NOW()
    WHERE id = $1 AND removed_at IS NULL
    RETURNING
      id, name, (SELECT MAX(e.upload_date) FROM exams e WHERE e.course_id = id AND removed_at IS NULL) AS last_modified
  `,
    [courseId]
  )
  const deletedCourse = CourseLI.parse(result.rows[0])

  return deletedCourse
}

export const deleteFile = async (fileId: FileId) =>
  await dbPool.query(
    `
    UPDATE exams
    SET removed_at = NOW()
    WHERE id = $1 AND removed_at IS NULL
  `,
    [fileId]
  )

export const renameCourse = async (
  id: CourseId,
  newName: string
): Promise<CourseListItem> => {
  const result = await dbPool.query(
    `
    UPDATE courses
    SET name = $2
    WHERE id = $1 AND removed_at IS NULL
    RETURNING
      id, name, (SELECT MAX(e.upload_date) FROM exams e WHERE e.course_id = id AND removed_at IS NULL) AS last_modified
  `,
    [id, newName]
  )
  const renamedCourse = CourseLI.parse(result.rows[0])

  return renamedCourse
}

export const getCourseListing = async (): Promise<CourseListItem[]> => {
  const results = await dbPool.query(`
    SELECT
      c.id,
      c.name,
      max(e.upload_date) as last_modified
    FROM courses c
    LEFT JOIN exams e ON e.course_id = c.id AND e.removed_at IS NULL
    WHERE c.removed_at IS NULL
    GROUP BY c.id
    ORDER BY LOWER(c.name) ASC
  `)
  const courses = results.rows.map(course => CourseLI.parse(course))

  return courses
}

export const getCourseInfo = async (
  courseId: number
): Promise<CourseInfo | null> => {
  const course = await findCourseById(courseId)

  if (!course) {
    return null
  }

  const filesResult = await dbPool.query(
    `
    SELECT
      e.id,
      e.type,
      e.course_id,
      e.file_name,
      e.mime_type,
      e.upload_date,
      e.file_path
    FROM exams e
    WHERE e.course_id = $1 AND e.removed_at IS NULL
    ORDER BY LOWER(e.file_name) DESC
    `,
    [courseId]
  )

  const files = filesResult.rows.map(file => FileLI.parse(file))
  const exams = files.filter(file => file.type === 'exam')
  const notes = files.filter(file => file.type === 'notes')
  const exercises = files.filter(file => file.type === 'exercise')
  const others = files.filter(file => file.type === 'other')

  return {
    ...course,
    exams,
    notes,
    exercises,
    others
  }
}

export const findCourseByName = async (
  courseName: string
): Promise<Course | null> => {
  const result = await dbPool.query(
    `
    SELECT
      c.id,
      c.name,
      max(e.upload_date) as last_modified
    FROM courses c
    LEFT JOIN exams e ON e.course_id = c.id AND e.removed_at IS NULL
    WHERE c.name = $1 AND c.removed_at IS NULL
    GROUP BY c.id
    LIMIT 1
  `,
    [courseName]
  )

  const course = CourseLI.safeParse(result.rows[0])

  if (!course.success) {
    return null
  }

  return course.data
}

export const findCourseById = async (
  courseId: CourseId
): Promise<Course | null> => {
  const result = await dbPool.query(
    `
    SELECT
      c.id,
      c.name,
      max(e.upload_date) as last_modified
    FROM courses c
    LEFT JOIN exams e ON e.course_id = c.id AND e.removed_at IS NULL
    WHERE c.id = $1 AND c.removed_at IS NULL
    GROUP BY c.id
    LIMIT 1
  `,
    [courseId]
  )
  const course = CourseLI.safeParse(result.rows[0])

  if (!course.success) {
    return null
  }

  return course.data
}

export const findCourseByFileId = async (
  fileId: FileId
): Promise<Course | null> => {
  const result = await dbPool.query(
    `
    SELECT
      c.id,
      c.name,
      max(e.upload_date) as last_modified
    FROM courses c
    LEFT JOIN exams e ON e.course_id = c.id AND e.removed_at IS NULL
    WHERE
      c.id = (SELECT e.course_id FROM exams e WHERE e.id = $1 AND e.removed_at IS NULL LIMIT 1)
      AND c.removed_at IS NULL
    GROUP BY c.id
    LIMIT 1
  `,
    [fileId]
  )

  const course = CourseLI.safeParse(result.rows[0])

  if (!course.success) {
    return null
  }

  return course.data
}

export const getFileNameById = async (
  fileId: FileId
): Promise<FileInfo | null> => {
  const result = await dbPool.query(
    `
    SELECT
      e.file_name,
      e.type,
      e.course_id,
      c.name
    FROM exams e
    LEFT JOIN courses c ON c.id = e.course_id
    WHERE e.id = $1 AND e.removed_at IS NULL
    LIMIT 1
  `,
    [fileId]
  )

  const info = FileInfo.safeParse(result.rows[0])

  if (!info.success) {
    return null
  }

  return info.data
}

export const updateFile = async (
  fileId: FileId,
  newType: string,
  newFilename: string
): Promise<File | null> => {
  const updatedRows = await dbPool.query(
    `
    UPDATE exams
    SET file_name = $2,
        type = $3
    WHERE id = $1 AND removed_at IS NULL
    RETURNING
      id, type, course_id, file_name, mime_type, upload_date, file_path
  `,
    [fileId, newFilename, newType]
  )

  const updatedFile = FileLI.parse(updatedRows.rows[0])
  return updatedFile
}

export const createCourse = async (course: CreateCourse) => {
  const result = await dbPool.query(
    `
    INSERT INTO courses
      (name)
    VALUES
      ($1)
    RETURNING
      id, name, created_at AS last_modified
  `,
    [course.name]
  )
  const createdCourse = CourseLI.parse(result.rows[0])
  return createdCourse
}

export const createFile = async (file: CreateFile) => {
  const result = await dbPool.query(
    `
    INSERT INTO exams
      (type, course_id, file_name, mime_type, file_path, upload_date)
    VALUES
      ($1, $2, $3, $4, $5, NOW())
    RETURNING
      id, type, course_id, file_name, mime_type, upload_date, file_path
  `,
    [
      file.type || 'exam',
      file.courseId,
      file.fileName,
      file.mimeType,
      file.filePath
    ]
  )

  const createdFile = FileLI.parse(result.rows[0])

  return createdFile
}

export const getAllFiles = async () => {
  const results = await dbPool.query(
    `
    SELECT
      e.id,
      e.type,
      e.course_id,
      e.file_name,
      e.mime_type,
      e.upload_date,
      e.file_path
    FROM exams e
    WHERE e.removed_at IS NULL
  `
  )

  const files = results.rows.map(file => FileLI.parse(file))

  return files
}

export const findFileById = async (fileId: number) => {
  const result = await dbPool.query(
    `
    SELECT
      e.id,
      e.type,
      e.course_id,
      e.file_name,
      e.mime_type,
      e.upload_date,
      e.file_path
    FROM exams e
    WHERE e.id = $1 AND e.removed_at IS NULL
    LIMIT 1
  `,
    [fileId]
  )

  const file = FileLI.safeParse(result.rows[0])

  if (!file.success) {
    return null
  }

  return file.data
}
