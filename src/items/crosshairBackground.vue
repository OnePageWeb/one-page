<script setup>

</script>

<template>
  <div style="height: 100%; width: 100%; position: absolute; top: 0; left: 0;">
    <div class="crosshair-horizontal"></div>
    <div class="crosshair-vertical"></div>
  </div>
</template>

<style scoped>
.crosshair-horizontal {
  position: absolute;
  top: calc(50% - 2px);
  left: 0;
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-50%);
}
.crosshair-vertical {
  position: absolute;
  top: 0;
  left: calc(50% - 2px);
  width: 4px;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateX(-50%);
}
</style>