<template>
  <div
    v-if="items.length"
    :class="['gacha-stage', { none: state.step === Step.init }]"
    @click="stageClick"
  >
    <div
      v-if="state.step === Step.cover || state.step === Step.result"
      class="gacha-skip"
      @click.stop="skip"
    >
      跳过
    </div>

    <video
      v-if="state.step === Step.animation && animationUrl"
      class="gacha-video"
      :autoplay="true"
      :muted="true"
      :controls="false"
      :src="animationUrl"
      @ended="state.step = Step.cover"
    ></video>

    <div v-if="state.step === Step.cover" :class="['gacha-cover', { mask: state.showMask }]">
      <div
        class="gacha-cover-bg"
        v-if="state.showMask"
        :style="{ '--bg': rankColorMap[curItem.rank] }"
      ></div>
      <div class="gacha-cover-name" v-else :style="{ '--r': curItem.rank }">
        {{ curItem.item_name }}
        <div>{{ '★'.repeat(curItem.rank) }}</div>
      </div>
      <img class="gacha-cover-img" :src="getImgUrl(curItem)" />
    </div>

    <div v-if="state.step === Step.result" class="gacha-result">
      <TransitionGroup name="slide-item">
        <div
          class="gacha-result-item"
          v-for="(item, index) in state.items"
          :key="item.item_name + index"
          :style="{ '--c': rankColorMap[item.rank], '--r': item.rank }"
        >
          <img class="gacha-result-item-img" :src="getImgUrl(item, 'result')" />
          <div class="gacha-result-item-text">{{ '★'.repeat(item.rank) }}</div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed, watch, type PropType } from 'vue'
import { type GachaItem } from '@/data'
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

enum Step {
  init = 0,
  animation = 1,
  cover = 2,
  result = 3
}

const props = defineProps({
  items: {
    type: Array as PropType<GachaItem[]>,
    default: () => []
  }
})

const state = reactive<{ step: Step; index: number; showMask: boolean; items: GachaItem[] }>({
  step: Step.init,
  index: 0,
  showMask: true,
  items: []
})

const rankColorMap = {
  3: '#004cff',
  4: '#c666d8',
  5: '#f6ca52'
}

const animationUrl = computed(() => {
  const rank = props.items.reduce((acc, cur) => Math.max(acc, cur.rank), 0)
  if (!rank) return ''

  const act = props.items.length > 1 ? 'ten' : 'single'
  return getVideoUrl(rank, act)
})

const curItem = computed(() => props.items[state.index])

const getVideoUrl = (rank: number, act: 'single' | 'ten') => {
  return new URL(`../assets/videos/r${rank}-${act}.mp4`, import.meta.url).href
}
const getImgUrl = (item: GachaItem, type: 'cover' | 'result' = 'cover') => {
  if (!item || !type) return ''
  if (item.item_type === '武器') {
    return new URL(`../assets/imgs/gacha_weapon/${item.item_name}.png`, import.meta.url).href
  }
  return new URL(`../assets/imgs/gacha_${type}/${item.item_name}.png`, import.meta.url).href
}

const stageClick = () => {
  if (state.step === Step.animation) {
    state.step = Step.cover
    return
  }

  if (state.step === Step.cover) {
    if (state.showMask) {
      state.showMask = false
      return
    }
    state.showMask = true
    // 单抽直接结束
    if (props.items.length === 1) {
      end()
      return
    }
    // 最后一抽展示结果
    if (state.index >= props.items.length - 1) {
      state.step++
      return
    }
    state.index++
  }

  if (state.step === Step.result) {
    state.step = Step.init
  }
}

const skip = () => {
  state.step = state.step >= Step.result ? Step.init : state.step + 1
}

const start = () => {
  if (!props.items?.length) return
  state.index = 0
  state.showMask = true
  state.step = Step.animation
}

const end = () => {
  state.step = Step.init
}

const preLoadResources = (srcs: string[], type: 'image' | 'video') => {
  for (const src of srcs) {
    if (type === 'video') {
      const video = document.createElement('video')
      video.src = src
      video.preload = 'auto'
      video.muted = true
    } else if (type === 'image') {
      const img = document.createElement('img')
      img.src = src
    }
  }
}
const preloadVideo = () => {
  const videoUrls = [
    getVideoUrl(3, 'single'),
    getVideoUrl(4, 'single'),
    getVideoUrl(5, 'single'),
    getVideoUrl(4, 'ten'),
    getVideoUrl(5, 'ten')
  ]
  preLoadResources(videoUrls, 'video')
}
preloadVideo()
watch(
  () => props.items,
  () => {
    preLoadResources(
      props.items.map((item) => getImgUrl(item, 'cover')),
      'image'
    )
    preLoadResources(
      props.items.map((item) => getImgUrl(item, 'result')),
      'image'
    )
    start()
  },
  { immediate: true }
)
watch(
  () => state.step,
  async (val) => {
    if (val === Step.result) {
      for (const item of [...props.items].sort((a, b) => b.rank - a.rank)) {
        state.items.push(item)
        await sleep(50)
      }
    } else {
      state.items = []
    }
  }
)

defineExpose({
  start,
  end
})
</script>

<style lang="scss" scoped>
.gacha-stage {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  @keyframes mask {
    0% {
      transform: scale(200%);
    }
    100% {
      transform: scale(100%);
    }
  }
  @keyframes typing {
    0% {
      width: 0;
    }
  }

  &::after {
    position: absolute;
    content: '';
    inset: 0;
    background-image: url('@/assets/imgs/gacha-bg.png');
    background-size: cover;
    filter: blur(10px);
    opacity: 0.2;
    z-index: -1;
  }
  &.none {
    display: none;
  }
  .gacha-skip {
    position: absolute;
    right: 20px;
    top: 20px;
    color: #fff;
    font-size: 18px;
    z-index: 100;
  }

  .gacha-cover,
  .gacha-result,
  .gacha-video {
    width: 100%;
    height: 100%;
  }
  .gacha-video {
    object-fit: cover;
  }

  .gacha-cover {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    &.mask {
      object-fit: contain;
      animation: mask 0.2s ease-out 1;
      .gacha-cover-img {
        filter: brightness(0);
      }
    }

    &-name {
      position: absolute;
      left: 10%;
      top: 60%;
      color: #fff;
      font-size: 30px;
      font-weight: 700;
      > div {
        color: gold;
        width: calc(var(--r) * 1.2em);
        height: 1.5em;
        line-height: 1.5;
        overflow-x: hidden;
        letter-spacing: 0.2em;
        text-shadow:
          0 0 2px #fff,
          0 0 2px gold,
          0 0 5px gold,
          0 0 10px gold;
        animation: typing calc(var(--r) * 0.2s) steps(var(--r));
        text-indent: 0.1em;
      }
    }

    &-img,
    &-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    &-bg {
      background: radial-gradient(
        circle closest-side at center,
        var(--bg) 0,
        var(--bg) 50%,
        transparent 100%,
        var(--bg) 140%,
        transparent 180%
      );
      opacity: 0.1;
    }
  }

  .gacha-result {
    display: flex;
    justify-content: center;
    align-items: center;
    .slide-item-enter-active,
    .slide-item-leave-active {
      transition: all 0.8s ease;
    }
    .slide-item-enter-from,
    .slide-item-leave-to {
      opacity: 0.3;
      transform: translateX(2000px);
    }
    &-item {
      margin-left: 6px;
      width: 8%;
      flex-grow: 0;
      aspect-ratio: 100 / 438;
      background: url('@/assets/imgs/card-bg.png') no-repeat center;
      background-size: cover;
      filter: drop-shadow(0 0 0.5px #fff) drop-shadow(0 0 calc(0.5px * var(--r)) var(--c))
        drop-shadow(0 0 calc(5px * var(--r)) var(--c));
      &-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        mask: url('@/assets/imgs/card-bg.png') no-repeat center;
        mask-size: cover;
      }
      &-text {
        position: absolute;
        bottom: 12%;
        left: 0;
        right: 0;
        color: gold;
        font-size: 16px;
        text-align: center;
      }
    }
  }
}
</style>
