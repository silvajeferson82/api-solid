import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { randomUUID } from 'node:crypto'
import { ValidateCheckInUseCase } from './validate-check-in'
import { ResourceNotFoundError } from './errors/resource-not-found-error'

let checkInRepository: InMemoryCheckInsRepository
let sut: ValidateCheckInUseCase

describe('Validate CheckIn Use Case', () => {
  const gymUUID = randomUUID()
  const userUUID = randomUUID()
  beforeEach(() => {
    checkInRepository = new InMemoryCheckInsRepository()
    sut = new ValidateCheckInUseCase(checkInRepository)
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to validate check-in', async () => {
    const createdCheckIn = await checkInRepository.create({
      gym_id: gymUUID,
      user_id: userUUID,
    })

    const { checkIn } = await sut.execute({
      checkInId: createdCheckIn.id,
    })

    expect(checkIn.validated_at).toEqual(expect.any(Date))
    expect(checkInRepository.items[0]?.validated_at).toEqual(expect.any(Date))
  })

  it('should be able to validate an inexistent check-in', async () => {
    await expect(() =>
      sut.execute({
        checkInId: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ResourceNotFoundError)
  })

  it('should be able to validate the check-in after 20 minutes of its creation', async () => {
    vi.setSystemTime(new Date(2023, 0, 13, 40))

    const createdCheckIn = await checkInRepository.create({
      gym_id: gymUUID,
      user_id: userUUID,
    })

    const twentyOneMinutesInMs = 1000 * 60 * 21

    vi.advanceTimersByTime(twentyOneMinutesInMs)

    await expect(() =>
      sut.execute({
        checkInId: createdCheckIn.id,
      }),
    ).rejects.toBeInstanceOf(Error)
  })
})
