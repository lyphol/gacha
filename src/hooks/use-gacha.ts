import { reactive } from 'vue'
import { roleWish, type GachaItem } from '@/data'
export { type GachaItem } from '@/data'

const CACHE_KEY = '__gacha__'

/**
 * 得到随机数
 * @param min 最小值
 * @param max 最大值
 * @returns
 */
export function getRandomNum(min = 1, max = 10000) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 *
 * @param list 从列表中随机抽取 1 个
 * @returns
 */
export function getRandomFromList<T>(list: T[]) {
  return list[getRandomNum(0, list.length - 1)]
}

export function useGacha() {
  const state = reactive<{
    no_r5_count: number // 距上次未出5星的次数
    no_r4_count: number // 距上次未出4星的次数
    gacha_history: GachaItem[] // 抽卡历史
    r5_noup: boolean // 是否歪了
  }>({
    no_r5_count: 0,
    no_r4_count: 0,
    gacha_history: [],
    r5_noup: false
  })

  init()

  function init() {
    const localGacha = sessionStorage.getItem(CACHE_KEY)
    if (localGacha) {
      Object.assign(state, JSON.parse(localGacha))
    } else {
      state.no_r5_count = 0
      state.no_r4_count = 0
      state.gacha_history = []
      state.r5_noup = false
    }
  }
  function setCache() {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(state))
  }
  /**
   * 获取对应星级角色的权重
   * @param rank 星级
   * @param count 距上次未出对应星级的次数
   * @returns 权重
   */
  function getRoleWeight(rank: number, count: number) {
    let res = 0
    count += 1
    if (rank === 5 && count <= 73) {
      res = 60
    } else if (rank === 5 && count >= 74) {
      res = 60 + 600 * (count - 73)
    } else if (rank === 4 && count <= 8) {
      res = 510
    } else if (rank === 4 && count >= 9) {
      res = 510 + 5100 * (count - 8)
    }
    return res
  }

  /**
   * 获取此次抽到的角色星级
   * @returns 3 ｜ 4 ｜ 5
   */
  function getRoleRank() {
    const weight = getRandomNum()
    const weight5 = getRoleWeight(5, state.no_r5_count)
    const weight4 = getRoleWeight(4, state.no_r4_count) + weight5

    if (weight <= weight5) {
      return 5
    } else if (weight <= weight4) {
      return 4
    }
    return 3
  }

  /**
   * 角色抽卡-单次
   */
  function singleRoleGacha() {
    const rank = getRoleRank()
    // 记录抽数
    state.no_r5_count = rank === 5 ? 0 : state.no_r5_count + 1
    state.no_r4_count = rank === 4 ? 0 : state.no_r4_count + 1

    // 处理抽卡
    let res: GachaItem
    // <= 5000 为 up，否则歪常驻
    const is_up_wish = getRandomNum() <= 5000
    if (rank === 5) {
      if (is_up_wish || state.r5_noup) {
        res = getRandomFromList(roleWish.r5_up_list)
        state.r5_noup = false
      } else {
        res = getRandomFromList(roleWish.r5_prob_list)
        state.r5_noup = true
      }
    } else if (rank === 4) {
      res = is_up_wish
        ? getRandomFromList(roleWish.r4_up_list)
        : getRandomFromList(roleWish.r4_prob_list)
    } else {
      res = getRandomFromList(roleWish.r3_prob_list)
    }

    // 记录抽卡历史
    state.gacha_history.push({ ...res })
    setCache()
    return { ...res }
  }

  /**
   * 角色抽卡
   */
  function tenRoleGacha() {
    const res: GachaItem[] = []
    for (let i = 0; i < 10; i++) {
      res.push(singleRoleGacha())
    }
    return res
  }

  return {
    state,
    getRoleWeight,
    getRoleRank,
    singleRoleGacha,
    tenRoleGacha
  }
}
