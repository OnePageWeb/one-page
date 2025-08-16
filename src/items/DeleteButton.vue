<script setup>
import {nextTick, ref, toRefs, defineEmits} from 'vue'
import {Close} from "@element-plus/icons-vue"
import {ElIcon, ElPopconfirm} from "element-plus"

const emit = defineEmits(['onDelete'])
const props = defineProps({
  id: String,
  isLock: Object
})
const {id, isLock} = toRefs(props)

function deleteItem() {
  setTimeout(() => emit('onDelete', id), 300)
}
</script>

<template>
  <div v-show="!isLock" class="container">
    <el-popconfirm
        class="deleteItem"
        title="确定删除此组件"
        placement="top-start"
        confirm-button-text="确定"
        cancel-button-text="取消"
        @confirm="deleteItem"
    >
      <template #reference>
        <el-icon class="deleteItem">
          <Close/>
        </el-icon>
      </template>
    </el-popconfirm>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  pointer-events: none; /* 禁用此元素的鼠标事件 */
}

.deleteItem {
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
  pointer-events: auto;
}

.el-icon svg {
  height: unset !important;
  width: unset !important;
  border-radius: 48px;
  background-color: red;
  padding: 4px;
}
</style>