require('dotenv').config()

const { send, sendError, json } = require('micro')

const Soundcloud = require('../services/soundcloud')
const Firebase = require('../services/firebase')

module.exports = async (req, res) => {
  try {
    const { url } = await json(req)

    const {
      id,
      title,
      user: { id: userId, username },
    } = await Soundcloud.likeFromIFTTT(url)

    await Firebase.addFavorite({
      id,
      title,
      user: {
        id: userId,
        username,
      },
    })

    send(res, 200)
  } catch (error) {
    console.log(`${req.method} - /add: error`, error) // eslint-disable-line no-console
    sendError(req, res, error)
  }
}
