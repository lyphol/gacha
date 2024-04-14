<template>
  <div class="page-chart">
    <div class="chart" v-for="item in state.charts" :key="item.title">
      <div :class="['chart-el', `${item.el}`]"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick } from 'vue'
import { useChart } from '@/hooks/use-chart'

const { state, drawChart } = useChart()

nextTick(() => {
  drawChart()
})
</script>

<style lang="scss" scoped>
.page-chart {
  display: grid;
  grid-template-columns: 1fr 1fr;
  .chart-el {
    width: 100%;
    aspect-ratio: 1 / 1;
  }
}
</style>
