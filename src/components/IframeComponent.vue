<script setup>
import {computed, nextTick, onMounted, ref, toRefs, watch} from "vue"
import {ElButton, ElIcon, ElInput} from "element-plus";
import {ChromeFilled, Search} from "@element-plus/icons-vue";
import {loadData, saveData} from "@/js/data.js";

const props = defineProps({
  id: String,
  defaultUrl: String,
  enableEdit: Object
})
const {defaultUrl, enableEdit} = toRefs(props)

// 默认文本内容
let url = ref(defaultUrl.value || '')
let isEditing = ref(false)

watch(enableEdit, (newValue) => {
  isEditing.value = newValue
})

// iframe
let changeTime = ref(Date.now())
const iframeUrl = computed(() => url.value ? (url.value + `?t=${changeTime.value}`) : '');

function loadIframe() {
  nextTick(() => {
    changeTime.value = Date.now()
  })
}

function saveEdit() {
  save()
  loadIframe()
}

function save() {
  saveData(props.id, JSON.stringify({url: url.value}))
}

watch(isEditing, (newValue) => {
  if (!newValue) {
    save()
  }
})

onMounted(() => {
  load()
  isEditing.value = enableEdit.value
  setTimeout(() => {
    loadIframe()
  }, 1000)
})

function load(data) {
  const save = data || loadData(props.id)
  if (save) {
    const parse = JSON.parse(save)
    url.value = parse.url
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="iframeContent">
    <div :class="['urlEdit', isEditing ? 'editing' : 'hide']">
      <el-input v-model="url" placeholder="请输入网址" clearable @blur="saveEdit">
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
      <iframe :src="iframeUrl" :class="['iframe']" border="none" width="100%" height="100%"></iframe>
    </div>
  </div>
</template>

<style scoped>
.iframeContent {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .hide {
    height: 0;

    .el-input-group {
      opacity: 0;
    }
  }

  .editing {
    height: 40px;
  }
}

.urlEdit {
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: center;

  :deep(.el-input-group__append, .el-input-group__prepend) {
    padding: 0 !important;
  }

  :deep(.el-input-group__append button.el-button) {
    padding: 0 30px !important;
    cursor: pointer;
  }
}

.iframeContainer {
  height: 100%;
  width: 100%;
}

.iframe {
  border: none;
}

</style>
