import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { randomUUID } from 'node:crypto'
import { GetUserMetricsUseCaseUseCase } from './get-user-metrics'

let checkInRepository: InMemoryCheckInsRepository
let sut: GetUserMetricsUseCaseUseCase

describe('Get User Metric Use Case', () => {
  const userId = randomUUID()
  const gymId1 = randomUUID()
  const gymId2 = randomUUID()
  beforeEach(() => {
    checkInRepository = new InMemoryCheckInsRepository()
    sut = new GetUserMetricsUseCaseUseCase(checkInRepository)
  })

  it('should be able to get check-ins count from metrics', async () => {
    await checkInRepository.create({
      gym_id: gymId1,
      user_id: userId,
    })

    await checkInRepository.create({
      gym_id: gymId2,
      user_id: userId,
    })

    const { checkInsCount } = await sut.execute({
      userId,
    })

    expect(checkInsCount).toEqual(2)
  })
})
