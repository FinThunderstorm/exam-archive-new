import React from 'react'
import { redirect } from 'next/navigation'
import { Anybody, Josefin_Sans } from 'next/font/google'

import { validateRights } from '@services/tkoUserService'

import Header from '@components/Header'
import Footer from '@components/Footer'
import Providers from './Providers'

import '@styles/main.scss'

export const metadata = {
  title: 'Tärpistö - TKO-äly ry',
  description: 'The TKO-äly ry exam archive'
}

const josefinSans = Josefin_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-josefinSans'
})

const anybody = Anybody({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-anybody'
})

const RootLayout = async ({
  children,
  modal
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) => {
  const isAccess = await validateRights('access')

  if (!isAccess) {
    redirect('/auth/signin')
  }

  return (
    <html
      lang="en"
      className={`${anybody.variable} ${josefinSans.variable} bg-gray-800`}
    >
      <Providers>
        <body className="layout-container bg-yellow-500">
          <Header />
          {modal}
          {children}
          <Footer />
        </body>
      </Providers>
    </html>
  )
}

export default RootLayout
