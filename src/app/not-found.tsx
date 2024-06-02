import Link from 'next/link'

export const metadata = {
  title: '404 - Tärpistö - TKO-äly ry',
  description: 'The TKO-äly ry exam archive'
}

const NotFound = () => {
  return (
    <main>
      <div
        role="alert"
        className="m-5 flex flex-col items-center gap-4 bg-gray-50 px-20 py-10"
      >
        <h2 className="mx-1 my-2 shrink font-serif text-3xl font-extrabold leading-tight">
          404 - Not Found
        </h2>
        <Link
          className="box-border bg-gray-800 p-3 font-serif lowercase text-white shadow-lg ring-inset hover:bg-gray-600 focus:ring focus:ring-gray-400"
          href="/"
        >
          Back to courselisting
        </Link>
      </div>
    </main>
  )
}

export default NotFound
