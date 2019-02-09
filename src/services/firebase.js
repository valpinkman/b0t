/**
 * FIREBASE SERVICE
 * Loads and create a Firebase client
 * All API needed to use Firebase services MUST be declared here
 */

const app = require('firebase/app')
require('firebase/firestore')

const { getPreviousMonday } = require('../utils/time')

const credentials = {
  apiKey: process.env.FIRE_API_KEY,
  authDomain: process.env.FIRE_AUTH_DOMAIN,
  databaseURL: process.env.FIRE_DB_URL,
  projectId: process.env.FIRE_PROJECT_ID,
  storageBucket: process.env.FIRE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIRE_MESSAGING_SENDER_ID,
}

/**
 * @class Firebase
 */
class Firebase {
  constructor() {
    app.initializeApp(credentials)

    this.db = app.firestore()
  }

  /**
   * addFavorite
   * stores a new track in the current week db
   * @param {Object} track
   */
  async addFavorite(track) {
    const monday = getPreviousMonday()
    const ref = this.db.collection('favorites').doc(monday)
    const doc = await ref.get()

    if (!doc.exists) {
      await ref.set({ tracks: [track] })
    } else {
      const { tracks } = doc.data()
      let newTracks = [track]
      if (tracks) {
        newTracks = [...tracks, track]
      }

      await ref.set({ tracks: newTracks })
    }
  }

  /**
   * getFavsFromWeek
   * returns a list of favorites from the current week or weeksAgo if specified
   * @param {number} weekAgo
   */
  async getFavsFromWeek(weekAgo = 0) {
    const monday = getPreviousMonday(weekAgo)
    const ref = this.db.collection('favorites').doc(monday)

    if (ref.empty) return { text: `no favorites found for the week of ${monday}`, tracks: [] }

    const tracks = new Map()
    ref.forEach(snap => {
      tracks.set(snap.id, snap)
    })
    return { text: `${tracks.length} favortites found for the week of ${monday}`, tracks }
  }
}

const firebase = new Firebase()

module.exports = firebase
