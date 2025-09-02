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

  &:hover {
    opacity: 0.8;
    padding: 8px;
    gap: 16px;

    .el-icon {
      scale: 1.4;
    }
  }

  .el-icon {
    scale: 0.4;
    cursor: pointer;
    &:hover {
      scale: 1.8;
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