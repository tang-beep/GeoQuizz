export interface CountryAnswer {
  countryCode: string

  countryAnswer?: string

  capitalAnswer?: string

  flagAnswer?: string

  mapAnswer?: string
}

export interface GameSubmission {
  sessionId: string

  answers: CountryAnswer[]
}