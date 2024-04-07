<template>
  <div class="gacha-history" v-if="modelValue">
    <div class="gacha-history-content">
      <div class="history-close" @click="$emit('update:modelValue', false)">X</div>
      <div class="history-title">祈愿历史记录</div>
      <table class="history-table">
        <thead>
          <td>类型</td>
          <td>名称</td>
          <td>祈愿时间</td>
        </thead>
        <tbody>
          <tr v-for="(item, index) in list" :key="`${index}-${item.item_name}`">
            <td>{{ item.item_type }}</td>
            <td :class="`rank-${item.rank}`">{{ item.item_name }}</td>
            <td>{{ fTime(item.wish_time) }}</td>
          </tr>
        </tbody>
      </table>
      <div class="history-page">
        <button :disabled="pageIndex === 0" @click="pageIndex--">&lt;</button>
        <div class="history-page-index">{{ pageIndex + 1 }}</div>
        <button :disabled="pageIndex >= totalPage - 1" @click="pageIndex++">&gt;</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, type PropType } from 'vue'
import { type GachaItem } from '@/data'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  history: {
    type: Array as PropType<GachaItem[]>,
    default: () => []
  }
})
defineEmits(['update:modelValue'])

const fTime = (time?: number) => {
  if (!time) return '--'
  return new Date(time).toLocaleString().replace(/\//g, '-')
}

const PAGE_COUNT = 10
const pageIndex = ref(0)
const totalPage = computed(() => Math.ceil(props.history.length / PAGE_COUNT))

const list = computed(() =>
  props.history.slice(pageIndex.value * PAGE_COUNT, (pageIndex.value + 1) * PAGE_COUNT)
)
</script>

<style lang="scss" scoped>
.gacha-history {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('@/assets/imgs/gacha-bg.png');
  background-size: cover;

  &-content {
    position: relative;
    width: 80%;
    height: 700px;
    background-color: #e7e3dc;
    border: 8px solid #515774;
    padding: 10px 20px;
    color: #5a5453;
    font-weight: 700;
  }
  .history-close {
    width: 40px;
    height: 40px;
    line-height: 40px;
    position: absolute;
    top: -8px;
    right: -48px;
    background-color: #ac844e;
    text-align: center;
    font-size: 30px;
    color: #e6d6b3;
  }
  .history-title {
    text-align: center;
    padding: 5px 0;
    font-size: 24px;
  }
  .history-page {
    height: 66px;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    &-index {
      width: 100px;
      text-align: center;
    }
    > button {
      width: 30px;
      height: 30px;
      border: 1px solid #ded4c7;
      border-radius: 50%;
      color: #585252;
      font-size: inherit;
      font-weight: inherit;
    }
  }
  .history-table {
    margin-top: 10px;
    width: 100%;
    border-collapse: collapse;
    background-color: #f5f1e8;
    color: #8e8e8e;
    font-size: 20px;
    thead {
      background-color: #ebe1cc;
    }
    td {
      height: 50px;
      width: 33.33%;
      padding: 0;
      text-align: center;
      border: 1px solid #dcceae;
      &.rank-5 {
        color: #b26d3e;
      }
      &.rank-4 {
        color: #985ada;
      }
    }
  }
}
</style>
