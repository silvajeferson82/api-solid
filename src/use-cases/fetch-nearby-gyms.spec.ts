import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { FetchNearbyGymsUseCase } from './fetch-nearby-gyms'

let gymsRepository: InMemoryGymsRepository
let sut: FetchNearbyGymsUseCase

describe('Fetch nearby Gyms Use Case', () => {
  const gym_title_1 = 'Near Gym'
  const gym_title_2 = 'Far Gym'
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository()
    sut = new FetchNearbyGymsUseCase(gymsRepository)
  })

  it('should be able to fetch nearby gyms', async () => {
    await gymsRepository.create({
      title: gym_title_1,
      description: null,
      phone: null,
      latitude: -1.3879936,
      longitude: -48.4306512,
    })

    await gymsRepository.create({
      title: gym_title_2,
      description: null,
      phone: null,
      latitude: -1.4378927,
      longitude: -48.4759985,
    })

    const { gyms } = await sut.execute({
      userLatitude: -1.386013,
      userLongitude: -48.427318,
    })

    expect(gyms).toHaveLength(1)
    expect(gyms).toEqual([expect.objectContaining({ title: gym_title_1 })])
  })
})
