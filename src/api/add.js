require('dotenv').config()

const { send, sendError, json } = require('micro')

const Soundcloud = require('../services/soundcloud')
const Firebase = require('../services/firebase')

module.exports = async (req, res) => {
  try {
    // parses url from request body
    const { url } = await json(req)

    // soundcloud user will favorite track
    const {
      id,
      title,
      user: { id: userId, username },
    } = await Soundcloud.likeFromIFTTT(url)

    // saving track in db for the current monday of the week
    await Firebase.addFavorite({
      id,
      title,
      user: {
        id: userId,
        username,
      },
    })

    // sends response
    send(res, 200)
  } catch (error) {
    console.log(`${req.method} - /add: error`, error) // eslint-disable-line no-console
    sendError(req, res, error)
  }
}
