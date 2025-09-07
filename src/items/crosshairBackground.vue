<script setup>

</script>

<template>
  <div style="height: 100%; width: 100%; position: absolute; top: 0; left: 0;">
    <div class="crosshair crosshair-horizontal1"></div>
    <div class="crosshair crosshair-horizontal2"></div>
    <div class="crosshair crosshair-horizontal3"></div>
    <div class="crosshair crosshair-vertical1"></div>
    <div class="crosshair crosshair-vertical2"></div>
    <div class="crosshair crosshair-vertical3"></div>
  </div>
</template>

<style scoped>
.crosshair {
  position: absolute;
  background: repeating-linear-gradient(
      45deg,
      rgba(150, 150, 150, 0.3),
      rgba(150, 150, 150, 0.3) 40px,
      rgba(255, 255, 255, 0.1) 40px,
      rgba(255, 255, 255, 0.1) 80px
  );
}
.crosshair-horizontal1 {
  top: calc(25% - 2px);
  left: 0;
  width: 100%;
  height: 4px;
  transform: translateY(-50%);
}
.crosshair-horizontal2 {
  top: calc(50% - 2px);
  left: 0;
  width: 100%;
  height: 4px;
  transform: translateY(-50%);
}
.crosshair-horizontal3 {
  top: calc(75% - 2px);
  left: 0;
  width: 100%;
  height: 4px;
  transform: translateY(-50%);
}
.crosshair-vertical1 {
  top: 0;
  left: calc(25% - 2px);
  width: 4px;
  height: 100%;
}
.crosshair-vertical2 {
  top: 0;
  left: calc(50% - 2px);
  width: 4px;
  height: 100%;
}
.crosshair-vertical3 {
  top: 0;
  left: calc(75% - 2px);
  width: 4px;
  height: 100%;
}
</style>