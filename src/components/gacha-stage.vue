<template>
  <div :class="['gacha-stage', { none: state.step === Step.init }]" @click="stageClick">
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
      :controls="false"
      :src="animationUrl"
      @ended="state.step = Step.cover"
    ></video>

    <div v-if="state.step === Step.cover" :class="['gacha-cover', { mask: state.showMask }]">
      <img class="gacha-cover-bg" v-if="state.showMask" :style="{ '--bg': curRankColor }" />
      <img class="gacha-cover-img" :src="getImgUrl(props.items[state.index])" />
    </div>

    <div v-if="state.step === Step.result" class="gacha-result">
      <TransitionGroup name="slide-item">
        <div
          class="gacha-result-item"
          v-for="(item, index) in state.items"
          :key="item.item_name + index"
          :style="{ backgroundImage: `url(${getImgUrl(item, 'result')})` }"
        >
          <div class="gacha-result-item-text">{{ item.item_name }}</div>
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

const animationUrl = computed(() => {
  const rank = props.items.reduce((acc, cur) => Math.max(acc, cur.rank), 0)
  if (!rank) return ''

  const act = props.items.length > 1 ? 'ten' : 'single'
  return `/videos/r${rank}-${act}.mp4`
})

const curRankColor = computed(() => {
  const r = props.items[state.index]?.rank
  return { 3: '#74ade9', 4: '#c666d8', 5: '#f1c40f' }[r]
})

const getImgUrl = (item: GachaItem, type: 'cover' | 'result' = 'cover') => {
  if (!item || !type) return ''
  if (item.item_type === '武器') {
    return `/imgs/gacha_weapon/${item.item_name}.png`
  }
  return `/imgs/gacha_${type}/${item.item_name}.png`
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

watch(
  () => props.items,
  () => {
    start()
  }
)
watch(
  () => state.step,
  async (val) => {
    if (val === Step.result) {
      for (const item of props.items) {
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
  background-color: rgba($color: #000, $alpha: 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  &.none {
    display: none;
  }
  .gacha-skip {
    position: absolute;
    right: 20px;
    top: 20px;
    color: #fff;
    font-size: 18px;
    font-weight: 700;
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
      animation: mask 0.2s ease-out;
      @keyframes mask {
        0% {
          transform: scale(200%);
        }
        100% {
          transform: scale(100%);
        }
      }
      .gacha-cover-img {
        filter: brightness(0);
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
      backdrop-filter: blur(15px);
      background: radial-gradient(
        circle at center,
        var(--bg) 0,
        var(--bg) 30%,
        transparent 40%,
        transparent 50%,
        var(--bg) 60%,
        transparent 100%
      );
      opacity: 0.5;
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
      margin-left: 30px;
      width: 120px;
      flex-grow: none;
      height: 70%;
      background-color: #2d313b;
      background-size: cover;
    }
  }
}
</style>
