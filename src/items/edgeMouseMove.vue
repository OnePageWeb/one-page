<script setup>
import {onMounted, ref, defineEmits} from "vue"
import {debounce, throttle} from 'lodash-es'

const edgeThreshold = ref(10)
let currentEdge = ''
let startPosition = {
  x: 0,
  y: 0
}
let targetDistance = 200
let movingDistance = 0

const emit = defineEmits(['onLeftEdge', 'onRightEdge', 'onTopEdge', 'onBottomEdge'])

onMounted(() => {
  window.addEventListener('mousemove', detectEdge)
})

function detectEdge(event) {
  const { clientX, clientY } = event
  const { innerWidth, innerHeight } = window

  if (!currentEdge) {
    startPosition.x = clientX
    startPosition.y = clientY
  }
  if (clientX < edgeThreshold.value) {
    currentEdge = 'left'
  } else if (clientX > innerWidth - edgeThreshold.value) {
    currentEdge = 'right'
  } else if (clientY < edgeThreshold.value) {
    currentEdge = 'top'
  } else if (clientY > innerHeight - edgeThreshold.value) {
    currentEdge = 'bottom'
  } else {
    currentEdge = null
    movingDistance = 0
  }
  if (currentEdge) {
    movingDistance = Math.sqrt(Math.pow(clientX - startPosition.x, 2) + Math.pow(clientY - startPosition.y, 2))
  }

  // 根据currentEdge执行相应方法
  if (currentEdge && movingDistance > targetDistance) {
    emitMovingResult(currentEdge)
    currentEdge = null
    movingDistance = 0
  }
}

const emitMovingResult = debounce((currentEdge) => {
    emit(`on${currentEdge.charAt(0).toUpperCase() + currentEdge.slice(1)}Edge`)
  }, 300)
</script>

<template>
</template>

<style scoped>
</style>