import { reactive } from 'vue'
import * as echarts from 'echarts/core'
import { GridComponent, TitleComponent, type GridComponentOption } from 'echarts/components'
import { ScatterChart, type ScatterSeriesOption } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([GridComponent, TitleComponent, ScatterChart, CanvasRenderer, UniversalTransition])

type EChartsOption = echarts.ComposeOption<GridComponentOption | ScatterSeriesOption>
type Matrix = number[][]

function initChart(el: string, option: EChartsOption) {
  const chart = echarts.init(document.querySelector(el) as HTMLElement)
  chart.setOption(option)
}

// 矩阵乘法的辅助函数
function matrixMultiply(a: Matrix, b: Matrix): Matrix {
  const result: Matrix = new Array(a.length).fill(null).map(() => new Array(b[0].length).fill(0))
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b[0].length; j++) {
      for (let k = 0; k < b.length; k++) {
        result[i][j] += a[i][k] * b[k][j]
      }
    }
  }
  return result
}

// 矩阵幂运算的辅助函数
function matrixPower(m: Matrix, power: number): Matrix {
  let result: Matrix = m
  for (let p = 1; p < power; p++) {
    result = matrixMultiply(result, m)
  }
  return result
}

/**
 * 计算追加的数学期望
 * @param matrix 概率转移矩阵
 */
function computeMatrix(matrix: Matrix) {
  // 初始分布
  const initState: Matrix = [[1, 0, 0, 0, 0, 0, 0, 0]]

  // 记录成本的数学期望
  const x: number[] = []
  // 记录获取碎片数的数学期望
  const y: number[] = []
  // 记录最少花费
  let minCost = 10000
  // 记录最少花费的追加的次数
  let minCostCount = 0

  // 花6元开始游戏
  x[0] = 6
  y[0] = 16.5

  // 散点图数据
  const scatterData: Matrix = []
  // i 为追加的次数
  for (let i = 2; i <= 100; i++) {
    // i次追加后星星数的概率分布
    const m = matrixMultiply(initState, matrixPower(matrix, i))
    // i-1次追加后星星数的概率分布
    const n = matrixMultiply(initState, matrixPower(matrix, i - 1))
    // index
    const j = i - 1
    // 计算每次追加的成本
    x[j] = x[j - 1] + 6 * n[0][0]

    // 循环计算多次追加的情况
    y[j] =
      m[0][0] * n[0][1] * 2 +
      m[0][0] * n[0][2] * 4 +
      m[0][1] * 12 +
      m[0][2] * 36 +
      m[0][3] * 54 +
      m[0][4] * 160 +
      m[0][5] * 480 +
      m[0][6] * 2880 +
      m[0][7] * 2880 * 3

    const cost = 2880 * (x[j] / y[j]) // 计算收集 2880 个碎片的成本

    // 散点数据信息
    scatterData.push([i, cost])
    // 如果当前成本低于之前的最低成本，则更新成本和追加次数
    if (cost < minCost) {
      minCost = cost
      minCostCount = i
    }
  }
  return { minCost, minCostCount, scatterData }
}

export const useChart = () => {
  const state = reactive<{
    charts: {
      title: string
      el: string
      matrix: Matrix
      minCost: number
      minCostCount: number
      scatterData: Matrix
    }[]
  }>({
    charts: [
      {
        title: '全部普通追加',
        el: 'chart-el-1',
        matrix: [
          [0, 0.82, 0.17, 0.01, 0, 0, 0, 0],
          [0.8, 0, 0.164, 0.034, 0.002, 0, 0, 0],
          [0.2, 0.6, 0, 0.164, 0.034, 0.002, 0, 0],
          [0, 0.2, 0.6, 0, 0.164, 0.034, 0.002, 0],
          [0, 0, 0.2, 0.6, 0, 0.164, 0.034, 0.002],
          [0, 0, 0, 0.2, 0.6, 0, 0.164, 0.036],
          [0, 0, 0, 0, 0, 0, 1, 0],
          [0, 0, 0, 0, 0, 0, 0, 1]
        ],
        minCost: 0,
        minCostCount: 0,
        scatterData: []
      },
      {
        title: '全部保护追加',
        el: 'chart-el-2',
        matrix: [
          [0, 0.82, 0.17, 0.01, 0, 0, 0, 0],
          [0, 0, 0.82, 0.17, 0.01, 0, 0, 0],
          [0, 0, 0, 0.82, 0.17, 0.01, 0, 0],
          [0, 0, 0, 0, 0.82, 0.17, 0.01, 0],
          [0, 0, 0, 0, 0, 0.82, 0.17, 0.01],
          [0, 0, 0, 0, 0, 0, 0.82, 0.18],
          [0, 0, 0, 0, 0, 0, 1, 0],
          [0, 0, 0, 0, 0, 0, 0, 1]
        ],
        minCost: 0,
        minCostCount: 0,
        scatterData: []
      }
    ]
  })

  const drawChart = () => {
    state.charts.forEach((item) => {
      const { minCost, minCostCount, scatterData } = computeMatrix(item.matrix)
      item.minCost = minCost
      item.minCostCount = minCostCount
      item.scatterData = scatterData
      const options: EChartsOption = {
        title: {
          text: item.title,
          textAlign: 'left'
        },
        xAxis: {},
        yAxis: {},
        series: [
          {
            data: scatterData,
            type: 'scatter',
            symbolSize: 5
          }
        ]
      }
      initChart(`.${item.el}`, options)
    })
  }

  return {
    state,
    drawChart
  }
}
