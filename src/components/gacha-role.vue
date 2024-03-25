<template>
  <div class="gacha-role">
    <header>祈愿</header>

    <main>
      <img
        class="gacha-banner"
        src="https://upload-bbs.miyoushe.com/upload/2024/03/08/75276539/a8a7c4e258ab06b740c30894ef349bed_4719338358654233357.jpg"
      />
    </main>

    <footer>
      <button @click="handleSingleClick">祈愿 1 次</button>
      <button @click="handleTenClick">祈愿 10 次</button>
    </footer>
    <GachaStage v-if="items.length" :items="items" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useGacha, type GachaItem } from '@/hooks/use-gacha'
import GachaStage from './gacha-stage.vue'

const items = ref<GachaItem[]>([])

const { singleRoleGacha, tenRoleGacha } = useGacha()

const handleSingleClick = () => {
  const res = singleRoleGacha()
  items.value = [{ ...res }]
}

const handleTenClick = () => {
  const res = tenRoleGacha()
  items.value = [...res]
}
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
    justify-content: end;
    > button {
      border: 0;
      height: 60px;
      aspect-ratio: 355 / 88;
      background: url('@/assets/imgs/icon-wish.png') center;
      background-size: contain;
      color: #a49176;
      font-size: 16px;
      font-weight: bold;
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
