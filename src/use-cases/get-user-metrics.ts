import type { CheckInsRepository } from '@/repositories/check-ins-repository'

interface GetUserMetricsUseCaseUseCaseRequest {
  userId: string
}

interface GetUserMetricsUseCaseUseCaseResponse {
  checkInsCount: number
}

export class GetUserMetricsUseCaseUseCase {
  constructor(private checkInsRepository: CheckInsRepository) {}

  async execute({
    userId,
  }: GetUserMetricsUseCaseUseCaseRequest): Promise<GetUserMetricsUseCaseUseCaseResponse> {
    const checkInsCount = await this.checkInsRepository.countByUserId(userId)

    return {
      checkInsCount,
    }
  }
}
