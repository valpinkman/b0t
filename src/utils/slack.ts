const proofToken: string = process.env.SLACK_COMMAND_TOKEN

export const isTokenLegit = (token: string): boolean => token === proofToken
