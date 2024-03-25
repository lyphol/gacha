<template>
  <div class="page-hello-lottie">
    <div class="cv" ref="cv"></div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import lottie from 'lottie-web'
import Star from '@/assets/star-mini.json'
console.log(Star)
const cv = ref<HTMLElement>()

onMounted(() => {
  const p = lottie.loadAnimation({
    container: cv.value as HTMLElement, // the dom element that will contain the animation
    renderer: 'canvas',
    loop: false,
    autoplay: true,
    animationData: Star,
    // path: '@/assets/star.json' // the path to the animation json
  })
  // setTimeout(() => {
  //   p.pause()
  // }, 2000)
})
</script>

<style lang="scss" scoped></style>
