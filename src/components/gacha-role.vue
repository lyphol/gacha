<template>
  <div class="gacha-role">
    <header>祈愿</header>

    <main>
      <img
        class="gacha-banner"
        src="https://sdk-webstatic.mihoyo.com/upload/ann/2024/03/22/3b9fac6681831058d44e05ec9aac306e_6715383311887256227.jpg"
      />
    </main>

    <footer>
      <button class="gacha-history" @click="showHistory = true">历史记录</button>
      <div class="gacha-action">
        <button @click="handleSingleClick">祈愿 1 次</button>
        <button @click="handleTenClick">祈愿 10 次</button>
      </div>
    </footer>
    <GachaStage :items="items" />
    <GachaHistory :history="state.gacha_history" v-model="showHistory" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useGacha, type GachaItem } from '@/hooks/use-gacha'
import GachaStage from './gacha-stage.vue'
import GachaHistory from './gacha-history.vue'

const items = ref<GachaItem[]>([])

const { state, singleRoleGacha, tenRoleGacha } = useGacha()

const handleSingleClick = () => {
  const res = singleRoleGacha()
  items.value = [{ ...res }]
}

const handleTenClick = () => {
  const res = tenRoleGacha()
  items.value = [...res]
}

const showHistory = ref(false)
</script>

<style lang="scss" scoped>
.gacha-role {
  display: grid;
  grid-template-rows: 80px 1fr 80px;
  height: 100vh;
  padding: 0 20px;
  background: url('@/assets/imgs/gacha-bg.png') no-repeat center;
  background-size: cover;
  header,
  footer {
    display: flex;
    align-items: center;
  }

  header {
    color: #fff;
  }
  footer {
    justify-content: space-between;
    button {
      border: 0;
      font-weight: 700;
    }
    .gacha-history {
      padding: 0 30px;
      background-color: #e3e0d6;
      color: #333;
      height: 30px;
      border-radius: 999px;
      font-size: 16px;
      filter: drop-shadow(0px 0px 2px #00000033);
    }
    .gacha-action > button {
      height: 60px;
      aspect-ratio: 355 / 88;
      background: url('@/assets/imgs/icon-wish.png') center;
      background-size: contain;
      color: #a49176;
      font-size: 16px;
    }
  }

  main {
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    > img {
      height: 96%;
    }
  }
}
</style>
