import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { randomUUID } from 'node:crypto'
import { FetchUserCheckInsHistoryUseCase } from './fetch-user-check-ins-history'

let checkInRepository: InMemoryCheckInsRepository
let sut: FetchUserCheckInsHistoryUseCase

describe('Fetch User Check-in history Use Case', () => {
  const userId = randomUUID()
  const gymId1 = randomUUID()
  const gymId2 = randomUUID()
  beforeEach(() => {
    checkInRepository = new InMemoryCheckInsRepository()
    sut = new FetchUserCheckInsHistoryUseCase(checkInRepository)
  })

  it('should be able to fetch check-in history', async () => {
    await checkInRepository.create({
      gym_id: gymId1,
      user_id: userId,
    })

    await checkInRepository.create({
      gym_id: gymId2,
      user_id: userId,
    })

    const { checkIns } = await sut.execute({
      userId,
      page: 1,
    })

    expect(checkIns).toHaveLength(2)
    expect(checkIns).toEqual([
      expect.objectContaining({ gym_id: gymId1 }),
      expect.objectContaining({ gym_id: gymId2 }),
    ])
  })
  it('should be able to fetch paginated check-in history', async () => {
    for (let i = 1; i <= 22; i++) {
      await checkInRepository.create({
        gym_id: `gym-${i}`,
        user_id: userId,
      })
    }

    const { checkIns } = await sut.execute({
      userId,
      page: 2,
    })

    expect(checkIns).toHaveLength(2)
    expect(checkIns).toEqual([
      expect.objectContaining({ gym_id: 'gym-21' }),
      expect.objectContaining({ gym_id: 'gym-22' }),
    ])
  })
})
