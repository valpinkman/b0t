import SC from 'soundcloud-nodejs-api-wrapper';

const credentials = {
  client_id: process.env.SNDCLD_CLIENT_ID, // eslint-disable-line @typescript-eslint/camelcase
  client_secret: process.env.SNDCLD_CLIENT_SECRET, // eslint-disable-line @typescript-eslint/camelcase
  username: process.env.SNDCLD_USERNAME,
  password: process.env.SNDCLD_PSSWRD,
};

const connection = new SC(credentials);
const client = connection.client();

let user = null;

const getId = (url: string): string =>
  url
    .split('?')[0]
    .split('/')
    .pop();

const asyncGetToken = async (): Promise<any> =>
  new Promise((resolve, reject) =>
    client.exchange_token((err, result) => {
      if (err) return reject(err);

      return resolve(result);
    }),
  );

const login = async (): Promise<any> => {
  if (user) return user;

  const token = await asyncGetToken();
  user = connection.client({ access_token: token }); // eslint-disable-line @typescript-eslint/camelcase
  return user;
};

const resolveUrl = async (url: string) => {
  await login();

  return new Promise(resolve =>
    user.get('/resolve', { url }, (err, result) => {
      if (err) return resolve(null);

      return resolve(result);
    }),
  );
};

// get track infos from it's internal id
const getTrack = async (id: string) => {
  await login();

  return new Promise(resolve => {
    user.get(`/tracks/${id}`, (err, result) => {
      if (err) return resolve(null);

      return resolve(result);
    });
  });
};

// get track infos from it's public url
const getTrackFromUrl = async (url: string) => {
  await login();

  const res: any = await resolveUrl(url);
  if (res) {
    if (res.statusCode && res.statusCode === 404) return null;

    const trackId = getId(res.location);
    const track = await getTrack(trackId);
    return track;
  }

  return null;
};

export type PlaylistType = {
  id: string;
  title: string;
};

// retrieve all playlists from user
export const getPlaylists = async (): Promise<PlaylistType[]> => {
  await login();

  return new Promise(resolve => {
    user.get('/me/playlists', { limit: 500 }, (err, result) => {
      if (err) return resolve(null);

      return resolve(result);
    });
  });
};

// create or add sounds to playlist
export const createOrUpdatePlaylist = async (data, previous): Promise<any> => {
  await login();

  return new Promise(resolve => {
    const handler = (err, result): any => {
      if (err) {
        console.log('oops we got an error :/');
        console.log(err);
        return resolve(null);
      }

      return resolve(result);
    };

    if (previous) {
      user.put(`/playlists/${previous.id}`, JSON.stringify(data), handler);
    } else {
      user.post('/playlists', JSON.stringify(data), handler);
    }
  });
};

// like a track using it's internal id
export const like = async (trackId: string): Promise<any> => {
  await login();

  return new Promise(resolve => {
    user.put(`/me/favorites/${trackId}`, null, (err, result) => {
      if (err) resolve(null);

      resolve(result);
    });
  });
};

export const likeFromIFTTT = async (url: string): Promise<any> => {
  const track: any = await getTrackFromUrl(url);
  if (track) {
    await like(track.id);
  }

  return track;
};
