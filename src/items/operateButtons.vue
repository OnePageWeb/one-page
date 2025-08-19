<script setup>
import {defineEmits, toRefs} from 'vue'
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
      <Picture/>
    </el-icon>
  </div>
</template>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  opacity: 0.4;
  pointer-events: none;
}

.container:hover {
  opacity: 1;
}

.deleteItem, .editStyle, .review {
  position: absolute;
  top: 0;
  cursor: pointer;
  width: 20px;
  pointer-events: auto;
}

.deleteItem {
  right: 0;
}

.el-icon svg {
  height: unset !important;
  width: unset !important;
  border-radius: 48px;
  background-color: #ff5050;
  padding: 4px;
}

.editStyle {
  right: 24px;

  :deep(path) {
    fill: #ffc9c9;
  }
}
</style>