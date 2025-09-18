<script setup>
import {toRefs} from "vue"

const props = defineProps({
  visible: Boolean
})
const {visible} = toRefs(props)

</script>

<template>
  <div :class="['componentOperatorContainer', visible ? 'operatorContainerOnFocus' : 'operatorContainerHide']">
    <slot></slot>
  </div>
</template>

<style>
.componentOperatorContainer {
  position: absolute;
  bottom: 4px;
  left: 4px;
  opacity: 0.4;
  margin: 4px;
  padding: 2px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: white;
  border-radius: 8px;
  z-index: 10;

  &:hover {
    opacity: 0.8;
    padding: 12px;
    gap: 20px;

    .el-icon {
      scale: 2;
    }
  }

  .el-icon {
    scale: 0.6;
    cursor: pointer;

    &:hover {
      svg {
        color: orange;
      }
    }
  }
}

.operatorContainerHide {
  width: 0;
  padding: 0;
  opacity: 0;
  margin: 0;
  display: none;
}
</style>