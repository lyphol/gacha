import { writeFileSync } from 'node:fs'
import { resolvePath } from './utils'

const BASE_URL = 'https://operation-webstatic.mihoyo.com/gacha_info/hk4e/cn_gf01'

export const apiGetGachaList = () => {
  return fetch(`${BASE_URL}/gacha/list.json`).then((r) => r.json())
}

export const apiGetGachaInfo = (id: string) => {
  return fetch(`${BASE_URL}/${id}/zh-cn.json`).then((r) => r.json())
}

type WishData = {
  begin_time: string
  end_time: string
  gacha_id: string
  gacha_name: string
  gacha_type: number
}

const getWishData = async () => {
  const {
    data: { list }
  } = (await apiGetGachaList()) as { data: { list: WishData[] } }
  const wish = list
    .filter((x) => x.gacha_type === 301)
    .toSorted((x, y) => new Date(y.end_time).getTime() - new Date(x.end_time).getTime())[0]
  if (!wish) return

  const data: any = await apiGetGachaInfo(wish.gacha_id)
  const res = {
    r5_up_list: data.r5_prob_list.filter((x: any) => x.is_up === 1),
    r5_prob_list: data.r5_prob_list.filter((x: any) => x.is_up !== 1),
    r4_up_list: data.r4_prob_list.filter((x: any) => x.is_up === 1),
    r4_prob_list: data.r4_prob_list.filter((x: any) => x.is_up !== 1),
    r3_prob_list: data.r3_prob_list
  }
  writeFileSync(resolvePath('../src/data/role.json'), JSON.stringify(res, null, 2), 'utf-8')
}

getWishData()
