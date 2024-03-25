<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Scene, WebGLRenderer, PerspectiveCamera } from 'three'

const canvas = ref<HTMLCanvasElement>()

const init = () => {
  const scene = new Scene()
  const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.set(0, 10, 15)

  const renderer = new WebGLRenderer({ canvas: canvas.value, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
}

onMounted(() => {
  init()
})
</script>

<template>
  <canvas ref="canvas"></canvas>
</template>

<style scoped></style>
