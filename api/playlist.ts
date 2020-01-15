import { NowRequest, NowResponse } from '@now/node';
import fetch from 'node-fetch';
import { isTokenLegit } from '../src/utils/slack';
import { getFavsFromWeek } from '../src/services/firebase';
import { createOrUpdatePlaylist, getPlaylists, PlaylistType } from '../src/services/soundcloud';
import { getSunday, getPreviousMonday } from '../src/utils/time';

const Playlist = async (req: NowRequest, res: NowResponse): Promise<void> => {
  const { token, response_url, text: weekAgo } = req.body; // eslint-disable-line @typescript-eslint/camelcase
  try {
    if (!token || !isTokenLegit(token)) {
      res.status(403);
      res.send('token is not correct');
    }

    await fetch(response_url, {
      method: 'POST',
      body: JSON.stringify({
        text: 'checking for favorites...',
        response_type: 'ephemeral', // eslint-disable-line @typescript-eslint/camelcase
      }),
    });

    const { tracks, text: textResponse } = await getFavsFromWeek(weekAgo || 0);
    if (!tracks.size) {
      await fetch(response_url, {
        method: 'POST',
        body: JSON.stringify({
          text: textResponse,
          response_type: 'ephemeral', // eslint-disable-line @typescript-eslint/camelcase
        }),
      });
    } else {
      const weekTracks = [];
      let found: null | PlaylistType;
      let body;
      const title = `[dr0p select ${getSunday(new Date(getPreviousMonday(weekAgo)))}]`;
      const playlists = await getPlaylists();

      tracks.forEach((_, id) => {
        weekTracks.push({ id });
      });

      playlists.forEach(playlist => {
        if (playlist.title === title) {
          found = playlist;
        }
      });

      if (found) {
        body = {
          playlist: {
            tracks: weekTracks,
          },
        };
      } else {
        body = {
          playlist: {
            title,
            tracks: weekTracks,
            sharing: 'private',
          },
        };
      }

      const playlist: any = await createOrUpdatePlaylist(body, found);

      const message = found ? 'playlist updated!' : 'playlist created!';
      const color = found ? '#FF6C02' : '#0088ff';

      await fetch(response_url, {
        method: 'POST',
        body: JSON.stringify({
          attachments: [
            {
              color,
              title: `${playlist.title}`,
              title_link: playlist.permalink_url, // eslint-disable-line @typescript-eslint/camelcase
              pretext: message,
              text: textResponse,
            },
          ],
        }),
      });
    }

    res.end();
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
    });

    res.status(400);
    res.end();
  }
};

export default Playlist;
