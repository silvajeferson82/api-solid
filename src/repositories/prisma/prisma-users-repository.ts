import { prisma } from '@/lib/prisma'
import { Prisma, type User } from '@prisma/client'
import type { UsersRepository } from '../users-repository'

export class PrismaUsersRepository implements UsersRepository {
  findById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.')
  }

  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })

    return user
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    })
  }
}
