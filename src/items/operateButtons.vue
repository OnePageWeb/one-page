<script setup>
import {nextTick, ref, toRefs, defineEmits} from 'vue'
import {Close, Picture} from "@element-plus/icons-vue"
import {ElIcon, ElPopconfirm} from "element-plus"

const emit = defineEmits(['onDelete', 'onStyleEdit'])
const props = defineProps({
  id: String,
  isLock: Object
})
const {id, isLock} = toRefs(props)

function deleteItem() {
  setTimeout(() => emit('onDelete', id), 300)
}

function editStyle() {
  emit('onStyleEdit', id)
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
    <el-icon class="editStyle" @click="editStyle">
      <Picture />
    </el-icon>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  opacity: 0.4;
  pointer-events: none; /* 禁用此元素的鼠标事件 */
}
.container:hover {
  opacity: 1;
}

.deleteItem {
  position: absolute;
  right: 0;
  top: 0;
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease-in-out;
}

.deleteItem.el-icon svg {
  height: unset !important;
  width: unset !important;
  border-radius: 48px;
  background-color: #b6b6b6;
  padding: 4px;
}

.editStyle {
  position: absolute;
  left: 0;
  top: 10px;
  cursor: pointer;
  pointer-events: auto;
  width: 30px;
  transition: all 0.3s ease-in-out;
}

.editStyle :deep(path) {
  fill: #ff5050;
}

.editStyle.el-icon svg {
  height: unset !important;
  width: unset !important;
  border-radius: 48px;
  background-color: #ffffff;
  padding: 4px;
}

</style>