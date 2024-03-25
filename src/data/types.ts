export interface GachaItem {
  is_up: 0 | 1
  item_id: number
  item_name: string
  item_type: '角色' | '武器'
  order_value?: number
  rank: 3 | 4 | 5
}

export type GachaWishKeys =
  | 'r5_up_list'
  | 'r4_up_list'
  | 'r5_prob_list'
  | 'r4_prob_list'
  | 'r3_prob_list'

export type GachaWish = {
  [keyof in GachaWishKeys]: GachaItem[]
}
