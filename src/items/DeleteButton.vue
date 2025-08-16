<script setup>
import { ref } from 'vue'

const props = defineProps({
  id: String,
  isLock: Object
})


</script>

<template>
  <div class="container">
    <div class="deleteItem" @click="$emit('onDelete', id)">x</div>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
  width: 100%;
}

.deleteItem {
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
}
</style>