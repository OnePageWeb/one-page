<script setup>
import { ref } from 'vue'
import {ElTooltip} from "element-plus";

const props = defineProps({
  text: {
    type: String,
    default: ''
  }
})

const text = ref(props.text)

</script>

<template>
  <div class="h5tagContainer">
    <span>{{text}}</span>
    <el-tooltip
      class="box-item"
      effect="light"
      content="支持H5标签"
      placement="top-start"
      :show-after="200"
    >
      <div class="h5tag">h5</div>
    </el-tooltip>
  </div>
</template>

<style scoped>
.h5tagContainer {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.h5tag {
  font-size: 10px;
  top: 0;
  right: 0;
  color: #a8ff6c;
  height: 32px;
  line-height: 12px;
  user-select: none;
}
</style>