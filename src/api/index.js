// Load .env variables
require('dotenv').config()

const { send, text, sendError, createError } = require('micro')
const { parse } = require('qs')
const fetch = require('node-fetch')

module.exports = async (req, res) => {
  try {
    // Parses the response of the slack command request
    const txt = await text(req)
    if (!txt) throw createError(400, 'not data to check')
    const parsed = parse(txt)

    // sends data to /playlist to create playlist...
    fetch(`http://${req.headers.host}/playlist`, {
      method: 'POST',
      body: JSON.stringify(parsed),
    })

    // ... and sends an immediate response without waiting for fetch to finish
    send(res, 200, { text: 'creating playlist...' })
  } catch (error) {
    sendError(req, res, error)
  }
}
