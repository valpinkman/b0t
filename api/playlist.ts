import { NowRequest, NowResponse } from '@now/node'
import fetch from 'node-fetch'
import { isTokenLegit } from '../src/utils/slack'
import { getFavsFromWeek } from '../src/services/firebase'
import { createOrUpdatePlaylist, getPlaylists } from '../src/services/soundcloud'
import { getSunday, getPreviousMonday } from '../src/utils/time'

const Playlist = async (req: NowRequest, res: NowResponse) => {
  const { token, response_url, text: weekAgo } = req.body
  try {
    if (!token || !isTokenLegit(token)) {
      res.status(403)
      res.send('token is not correct')
    }

    await fetch(response_url, {
      method: 'POST',
      body: JSON.stringify({
        text: 'checking for favorites...',
        response_type: 'ephemeral',
      }),
    })

    const { tracks, text: textResponse } = await getFavsFromWeek(weekAgo || 0)
    if (!tracks.size) {
      await fetch(response_url, {
        method: 'POST',
        body: JSON.stringify({
          text: textResponse,
          response_type: 'ephemeral',
        }),
      })
    } else {
      const weekTracks = []
      let found
      let body
      const title = `[dr0p select ${getSunday(new Date(getPreviousMonday(weekAgo)))}]`
      const playlists: any[] = await getPlaylists()

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

      const playlist: any = await createOrUpdatePlaylist(body, found)

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

    await fetch(response_url, {
      method: 'POST',
      body: JSON.stringify({
        delete_original: true,
      }),
    })

    res.end()
  } catch (error) {
    await fetch(response_url, {
      method: 'POST',
      body: JSON.stringify({
        attachments: [
          {
            title: 'error',
            text: JSON.stringify(error),
          },
        ],
      }),
    })

    res.status(400)
    res.end()
  }
}

export default Playlist
