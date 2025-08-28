<script setup>
import {ElButton, ElDialog, ElInput} from "element-plus"
import {onMounted, ref, toRefs, watch} from "vue"
import {loadData, removeData, saveData} from "@/js/data.js"

const emit = defineEmits(['loadStyle'])
const visible = ref(false)

// 当前全局样式
const globalStyle = ref('')
// 恢复样式
const style = loadData('globalStyle')
if (style !== null) {
  globalStyle.value = style
}

onMounted(() => {
  refreshGlobalStyle()
})

function refreshGlobalStyle() {
  loadStyle('globalStyle', globalStyle.value)
  // 保存全局样式
  saveData('globalStyle', globalStyle.value)
  visible.value = false
}

function loadStyle(id, styleConfig) {
  emit('loadStyle', id, styleConfig)
}

function fetchAllStyleConfig() {
  return globalStyle.value
}

function clearStyle() {
  globalStyle.value = ''
  removeData('globalStyle')
}

function open() {
  visible.value = true
}

defineExpose({
  fetchAllStyleConfig, loadStyle, clearStyle, open
})
</script>

<template>
  <!-- 全局样式弹窗 -->
  <el-dialog
    title="全局样式"
    v-model="visible"
    width="50%"
    class="globeStyleDialog commonDialog"
    align-center
  >
    <el-input
      v-model="globalStyle"
      class="globeStyleInput"
      type="textarea"
      resize="none"
      placeholder="请输入全局样式"
    />
    <template #footer>
      <el-button type="primary" @click="refreshGlobalStyle">保存并刷新</el-button>
    </template>
  </el-dialog>

</template>

<style scoped>

</style>