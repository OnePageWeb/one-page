<script setup>
import {nextTick, onMounted, ref, toRefs, watch} from "vue"
import {ElIcon, ElInput} from "element-plus";
import {ChromeFilled, Search} from "@element-plus/icons-vue";

const props = defineProps({
  id: String,
  defaultUrl: String,
  isLock: Object
})
const {defaultUrl, isLock} = toRefs(props)

// 默认文本内容
let url = ref(defaultUrl.value)
let isEditing = ref(false)

watch(isLock, (newValue) => {
  isEditing.value = !newValue
})

function loadIframe() {
  const iframe = document.querySelector('.iframeContainer iframe')
  iframe.contentWindow.location.reload()
  console.log('刷新iframe')
}

function save() {
  window.localStorage.setItem(props.id, JSON.stringify({url: url.value}))
}

watch(isEditing, (newValue) => {
  // 编辑结束后刷新iframe
  nextTick(() => {
    loadIframe()
  })
  if (!newValue) {
    save()
  }
})

onMounted(() => {
  load()
  isEditing.value = !isLock.value
  loadIframe()
})

function load(data) {
  const save = data || window.localStorage.getItem(props.id)
  if (save) {
    url.value = JSON.parse(save).url
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="content">
    <div class="urlEdit" v-if="isEditing">
      <el-input v-model="url" placeholder="请输入网址" clearable @blur="save">
        <template #prepend>
          <el-icon>
            <ChromeFilled/>
          </el-icon>
        </template>
        <template #append>
          <el-button @click="loadIframe">
            <el-icon>
              <Search/>
            </el-icon>
          </el-button>
        </template>
      </el-input>
    </div>
    <div class="iframeContainer">
      <iframe :src="url" class="iframe" frameborder="0" width="100%" height="100%"></iframe>
    </div>
  </div>
</template>

<style scoped>
.content {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.urlEdit {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 2;
}

.iframeContainer {
  height: 100%;
  width: 100%;
  z-index: 1;
}

.urlEdit :deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0 !important;
}
.urlEdit :deep(el-button) {
  padding: 0 20px !important;
  cursor: pointer;
}
</style>
