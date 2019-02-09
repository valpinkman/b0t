// Load .env variables
require('dotenv').config()

const { text, sendError, createError } = require('micro')
const { parse } = require('qs')
const fetch = require('node-fetch')

module.exports = async (req, res) => {
  try {
    // Parses the response of the slack command request
    const txt = await text(req)
    if (!txt) throw createError(400, 'not data to check')
    const parsed = parse(txt)
    res.writeHead(200, {
      'Content-Type': 'application/json',
    })

    fetch(parsed.response_url, {
      method: 'POST',
      body: JSON.stringify({ text: 'checking for favorites...', response_type: 'ephemeral' }),
    })

    // sends data to /playlist to create playlist...
    await fetch(`http://${req.headers.host}/playlist`, {
      method: 'POST',
      body: JSON.stringify(parsed),
    })

    res.end()
  } catch (error) {
    sendError(req, res, error)
  }
}
