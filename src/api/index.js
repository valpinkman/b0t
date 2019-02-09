// Load .env variables
require('dotenv').config()

const { send, text } = require('micro')
const { parse } = require('qs')
const fetch = require('node-fetch')

const soundcloud = require('../services/soundcloud')
const Firebase = require('../services/firebase')

module.exports = async (req, res) => {
  try {
    // Parse the response of the slack command request
    const txt = parse(await text(req))
    console.log(txt)
    // const result = await fetch(`http://${req.headers.host}/add`)
    // const text = await result.text()
    // console.log(text)
    // const user = await soundcloud()

    send(res, 200, 'hello')
  } catch (error) {
    send(res, 200, 'oops somehting did not work as expected')
  }
}
