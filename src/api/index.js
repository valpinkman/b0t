// Load .env variables
require('dotenv').config()

const { send, text, sendError, createError } = require('micro')
const { parse } = require('qs')
const fetch = require('node-fetch')

const SoundCloud = require('../services/soundcloud')
const Firebase = require('../services/firebase')
const { isTokenLegit } = require('../utils/slack')
const { getPreviousMonday, getSunday } = require('../utils/time')

module.exports = async (req, res) => {
  try {
    // Parses the response of the slack command request
    const txt = await text(req)
    if (!txt) throw createError(400, 'no data')

    const { token, response_url, text: weekAgo } = parse(txt) // eslint-disable-line camelcase
    res.writeHead(200, {
      'Content-Type': 'application/json',
    })

    if (!token || !isTokenLegit(token))
      throw createError(403, 'token is undefined or does not match')

    await fetch(response_url, {
      method: 'POST',
      body: JSON.stringify({ text: 'checking for favorites...', response_type: 'ephemeral' }),
    })

    const { tracks, text: textResponse } = await Firebase.getFavsFromWeek(weekAgo || 0)
    if (!tracks.size) {
      await fetch(response_url, {
        method: 'POST',
        body: JSON.stringify({
          text: textResponse,
        }),
      })
    } else {
      const weekTracks = []
      let found
      let body
      const title = `[dr0p select ${getSunday(getPreviousMonday(weekAgo))}]`
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

      await fetch(response_url, {
        method: 'POST',
        body: JSON.stringify({
          attachments: [
            {
              color,
              title: `${playlist.title}`,
              title_link: playlist.permalink_url,
              pretext: message,
              text: textResponse,
            },
          ],
        }),
      })
    }

    res.end()
  } catch (error) {
    if (error.message === 'no data') send(res, 200, 'no data to analyse')
    sendError(req, res, error)
  }
}
