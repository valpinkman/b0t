/**
 * Slack utils
 */

const proofToken =
  process.env.NODE_ENV === 'development'
    ? process.env.SLACK_COMMAND_TOKEN_TEST
    : process.env.SLACK_COMMAND_TOKEN

const isTokenLegit = token => token === proofToken

module.exports.isTokenLegit = isTokenLegit
