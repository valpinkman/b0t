// @flow
import { send } from 'micro'

export default async (req: Request, res: Response) => {
  send(res, 200, 'like')
}
