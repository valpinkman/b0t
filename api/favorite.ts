import { NowRequest, NowResponse } from '@now/node'
import { likeFromIFTTT } from '../src/services/soundcloud'
import { addFavorite } from '../src/services/firebase'

const Favorite = async (req: NowRequest, res: NowResponse) => {
  try {
    const { url } = req.body

    const {
      id,
      title,
      user: { id: userId, username },
    } = await likeFromIFTTT(url)

    await addFavorite({
      id,
      title,
      user: {
        id: userId,
        username,
      },
    })

    res.status(200)
    res.end()
  } catch (error) {
    console.log(`${req.method} - /add: error`, error)
    res.status(500)
    res.end()
  }
}

export default Favorite
