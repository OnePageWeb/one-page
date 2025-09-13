<script setup>
import {ElDialog} from "element-plus"
import {defineEmits} from "vue"

const emit = defineEmits(['opened', 'closed'])

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '50%'
  },
  visible: {
    type: Boolean,
    default: false
  }
})

const onOpened = () => {
  emit('opened')
}

const onClosed = () => {
  emit('closed')
}
</script>

<template>
  <!-- 组件样式弹窗 -->
  <el-dialog
      :title="title"
      :model-value="visible"
      :width="width"
      class="commonDialog"
      align-center
      :close-on-press-escape="false"
      :append-to-body="true"
      @opened="onOpened"
      @closed="onClosed"
  >
    <template #title>
      <slot name="title"></slot>
    </template>
    <slot></slot>
    <template #footer>
      <slot name="footer"></slot>
    </template>
  </el-dialog>
</template>

<style>
</style>