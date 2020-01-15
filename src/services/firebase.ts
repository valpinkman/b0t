import app from 'firebase/app'
import 'firebase/firestore'

import { getPreviousMonday } from '../utils/time'

const credentials = {
  apiKey: process.env.FIRE_API_KEY,
  authDomain: process.env.FIRE_AUTH_DOMAIN,
  databaseURL: process.env.FIRE_DB_URL,
  projectId: process.env.FIRE_PROJECT_ID,
  storageBucket: process.env.FIRE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIRE_MESSAGING_SENDER_ID,
}

if (app.apps.length === 0) {
  app.initializeApp(credentials)
}

const db = app.firestore()

export const addFavorite = async (track: Object) => {
  const monday = getPreviousMonday()
  const ref = db.collection('favorites-test').doc(monday)
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

export const getFavsFromWeek = async (weekAgo = 0) => {
  const monday = getPreviousMonday(weekAgo)
  const ref = db.collection('favorites-test').doc(monday)
  const doc = await ref.get()
  const weekTracks = new Map()

  if (!doc.exists)
    return { text: `no favorites found for the week of ${monday}`, tracks: weekTracks }

  const { tracks } = doc.data()
  tracks.forEach(snap => {
    weekTracks.set(snap.id, snap)
  })
  return {
    text: `${weekTracks.size} favorite${
      weekTracks.size > 1 ? 's' : ''
    } found for the week of ${monday}`,
    tracks: weekTracks,
  }
}
