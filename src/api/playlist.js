// Load .env variables
require('dotenv').config()

const { send, json, createError, sendError } = require('micro')
const fetch = require('node-fetch')

const SoundCloud = require('../services/soundcloud')
const Firebase = require('../services/firebase')
const { isTokenLegit } = require('../utils/slack')
const { getPreviousMonday } = require('../utils/time')

module.exports = async (req, res) => {
  try {
    const { token, response_url, text: weekAgo } = await json(req) // eslint-disable-line camelcase

    if (!token || !isTokenLegit(token))
      throw createError(403, 'token is undefined or does not match')

    const { tracks } = await Firebase.getFavsFromWeek(weekAgo || 0)

    if (!tracks.size) {
      await fetch(response_url, {
        method: 'POST',
        body: JSON.stringify({
          text: 'no tracks favorited yet this week',
        }),
      })
    } else {
      const weekTracks = []
      let found
      let body
      const title = `[dr0p select ${getPreviousMonday(weekAgo)}]`
      const playlists = await SoundCloud.getPlaylists()

      tracks.forEach((_, id) => {
        weekTracks.push({ id })
      })

      playlists.forEach(playlist => {
        if (playlist.title === title) {
          found = playlist
        }
      })

      if (found) {
        body = {
          playlist: {
            tracks: weekTracks,
          },
        }
      } else {
        body = {
          playlist: {
            title,
            tracks: weekTracks,
            sharing: 'private',
          },
        }
      }

      const playlist = await SoundCloud.createOrUpdatePlaylist(body, found)
      const message = found ? 'playlist updated!' : 'playlist created!'
      const color = found ? '#FF6C02' : '#0088ff'

      fetch(response_url, {
        method: 'POST',
        body: JSON.stringify({
          attachments: [
            {
              color,
              title: `${playlist.title}`,
              text: message,
            },
          ],
        }),
      })
    }

    send(res, 200)
  } catch (error) {
    sendError(req, res, error)
  }
}
