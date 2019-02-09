// Load .env variables
require('dotenv').config()

const { send, json, createError, sendError } = require('micro')
const fetch = require('node-fetch')

const { isTokenLegit } = require('../utils/slack')

module.exports = async (req, res) => {
  try {
    const body = await json(req)
    console.log(body)

    if (!body.token || !isTokenLegit(body.token))
      throw createError(403, 'token is undefined or does not match')

    fetch(body.response_url, {
      method: 'POST',
      body: JSON.stringify({
        text: 'fuck you',
      }),
    })

    send(res, 200)
  } catch (error) {
    sendError(req, res, error)
  }
}
