import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { CheckInUseCase } from './check-in'
import { randomUUID } from 'node:crypto'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'
import { MaxDistanceError } from './errors/max-distance-error'

let checkInRepository: InMemoryCheckInsRepository
let gymRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('CheckIn Use Case', () => {
  const gymUUID = randomUUID()
  beforeEach(() => {
    checkInRepository = new InMemoryCheckInsRepository()
    gymRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInRepository, gymRepository)

    gymRepository.items.push({
      id: gymUUID,
      title: 'Javascript Academy',
      description: '',
      phone: '',
      latitude: new Decimal(0),
      longitude: new Decimal(0),
      created_at: new Date(),
    })

    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: gymUUID,
      userId: randomUUID(),
      userLatitude: 0,
      userLongitude: 0,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2026, 0, 20, 8, 0, 0))

    const user_id = randomUUID()
    await sut.execute({
      gymId: gymUUID,
      userId: user_id,
      userLatitude: 0,
      userLongitude: 0,
    })

    await expect(() =>
      sut.execute({
        gymId: gymUUID,
        userId: user_id,
        userLatitude: 0,
        userLongitude: 0,
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })

  it('should not be able to check in twice but in different day', async () => {
    vi.setSystemTime(new Date(2026, 0, 20, 8, 0, 0))
    const user_id = randomUUID()
    await sut.execute({
      gymId: gymUUID,
      userId: user_id,
      userLatitude: 0,
      userLongitude: 0,
    })

    vi.setSystemTime(new Date(2026, 0, 21, 8, 0, 0))
    await expect(
      sut.execute({
        gymId: gymUUID,
        userId: user_id,
        userLatitude: 0,
        userLongitude: 0,
      }),
    ).resolves.toBeTruthy()
  })

  it('should not be able to check in distant gym', async () => {
    const gymUUID2 = randomUUID()
    gymRepository.items.push({
      id: gymUUID2,
      title: 'Javascript Academy',
      description: '',
      phone: '',
      latitude: new Decimal(-27.2092052),
      longitude: new Decimal(-49.4889672),
      created_at: new Date(),
    })

    await expect(
      sut.execute({
        gymId: gymUUID2,
        userId: randomUUID(),
        userLatitude: -27.2092052,
        userLongitude: -49.6401091,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError)
  })
})
