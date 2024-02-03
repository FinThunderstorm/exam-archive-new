import { UserRole, UserMembership, AccessRight } from '@lib/types'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { AuthOptions } from 'next-auth'
import config from '@lib/config'

export const authConfig: AuthOptions = {
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.membership = user.membership
        token.rights = user.rights
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role
        session.user.membership = token.membership
        session.user.rights = token.rights
      }
      return session
    }
  },
  providers: [
    {
      id: 'tkoaly',
      name: 'TKO-äly Member Account',
      type: 'oauth',
      profile: async profile => {
        return {
          id: profile.sub,
          name: profile.nickname,
          role: profile.role,
          membership: profile.membership,
          rights: roleRights[profile.role as UserRole]
        }
      },
      wellKnown: `${config.USER_SERVICE_URL}/.well-known/openid-configuration`,
      clientId: config.USER_SERVICE_SERVICE_ID,
      clientSecret: config.USER_SERVICE_SECRET,
      authorization: {
        params: { scope: 'openid role profile membership' }
      }
    }
  ]
}

export const isActiveMember = (membership: UserMembership) =>
  membership === UserMembership.Jasen ||
  membership === UserMembership.Kannatusjasen ||
  membership === UserMembership.Kunniajasen ||
  membership === UserMembership.Ulkojasen

export const roleRights: {
  [role in UserRole]: { [right in AccessRight]: boolean }
} = {
  [UserRole.Kayttaja]: {
    access: true,
    upload: true,
    remove: false,
    rename: false
  },
  [UserRole.Tenttiarkistovirkailija]: {
    access: true,
    upload: true,
    remove: true,
    rename: true
  },
  [UserRole.Jasenvirkailija]: {
    access: true,
    upload: true,
    remove: false,
    rename: true
  },
  [UserRole.Virkailija]: {
    access: true,
    upload: true,
    remove: false,
    rename: true
  },
  [UserRole.Yllapitaja]: {
    access: true,
    upload: true,
    remove: true,
    rename: true
  }
}

export const getSessionUser = async () => {
  const session = await getServerSession(authConfig)

  if (!session || !session.user) {
    if (config.APP_ENV === 'development') {
      return {
        id: 1,
        name: 'dev',
        role: UserRole.Yllapitaja,
        membership: UserMembership.Jasen,
        rights: roleRights[UserRole.Yllapitaja]
      }
    }
    redirect('/auth/signin')
  }

  return session.user
}

export const validateRights = async (...neededRights: AccessRight[]) => {
  const user = await getSessionUser()

  if (!user) {
    return false
  }
  if (!user.rights) return false
  if (!user.membership) return false
  if (!isActiveMember(user.membership)) return false

  return neededRights.every(right => user.rights[right])
}

export const validateUserRights = async (...neededRights: AccessRight[]) => {
  const isRights = await validateRights(...neededRights)

  if (!isRights) {
    redirect('/')
  }
}
