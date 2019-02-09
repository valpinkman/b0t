/**
 * SOUNDCLOUD SERVICE
 * Loads and create a Soundcloud client
 * All API needed to use Soundcloud services MUST be declared here
 */

const SC = require('soundcloud-nodejs-api-wrapper')

const credentials = {
  client_id: process.env.SNDCLD_CLIENT_ID,
  client_secret: process.env.SNDCLD_CLIENT_SECRET,
  username: process.env.SNDCLD_USERNAME,
  password: process.env.SNDCLD_PSSWRD,
}

class SoundCloud {
  constructor() {
    const connectection = new SC(credentials)
    const client = connectection.client()

    this.connectection = connectection
    this.client = client
    this.user = null
  }

  static getId(url) {
    return url
      .split('?')[0]
      .split('/')
      .pop()
  }

  // retrieve token from soundcloud
  static asyncGetToken(client) {
    return new Promise((resolve, reject) =>
      client.exchange_token((err, result) => {
        if (err) return reject(err)

        return resolve(result)
      }),
    )
  }

  // check if this.user is loaded or loads it
  async log() {
    if (this.user) return this.user

    const token = await SoundCloud.asyncGetToken(this.client)
    this.user = this.connectection.client({ access_token: token })
    return this.user
  }

  // this.user will like the song provided by IFTTT hook
  async likeFromIFTTT(url) {
    const track = await this.getTrackFromUrl(url)

    await this.like(track.id)
    return track
  }

  // get track infos from it's public url
  async getTrackFromUrl(url) {
    await this.log()

    const res = await this.resolveUrl(url)
    if (res) {
      if (res.statusCode && res.statusCode === 404) return null

      const trackId = SoundCloud.getId(res.location)
      const track = await this.getTrack(trackId)
      return track
    }

    return null
  }

  // get track infos from it's internal id
  async getTrack(id) {
    await this.log()

    const p = new Promise(resolve => {
      this.user.get(`/tracks/${id}`, (err, result) => {
        if (err) resolve(null)

        resolve(result)
      })
    })

    return p
  }

  // like a track using it's internal id
  async like(trackId) {
    await this.log()

    const p = new Promise(resolve => {
      this.user.put(`/me/favorites/${trackId}`, null, (err, result) => {
        if (err) resolve(null)

        resolve(result)
      })
    })

    return p
  }

  // gets information about a public soundcloud url
  async resolveUrl(url) {
    await this.log()

    const p = new Promise(resolve =>
      this.user.get('/resolve', { url }, (err, result) => {
        if (err) resolve(null)

        resolve(result)
      }),
    )
    return p
  }
}

const soundcloud = new SoundCloud()

module.exports = soundcloud
