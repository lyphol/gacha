import { readFileSync, writeFileSync } from 'node:fs'
import { resolvePath } from './utils'

const dataEn = JSON.parse(readFileSync(resolvePath('../src/data/en-us.json'), 'utf-8'))
const dataZh = JSON.parse(readFileSync(resolvePath('../src/data/zh-cn.json'), 'utf-8'))

const reverseData = Object.fromEntries(Object.entries(dataZh).map(([k, v]) => [v, k]))

const res = Object.keys(dataEn).reduce((acc, cur) => {
  const id = dataEn[cur]
  acc[cur] = {
    id,
    name: reverseData[id]
  }
  return acc
}, {} as any)

writeFileSync(resolvePath('../src/data/raw.json'), JSON.stringify(res, null, 2), 'utf-8')
