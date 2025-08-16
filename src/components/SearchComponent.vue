<script setup>
import {ElIcon, ElInput, ElOption, ElSelect, ElDialog, ElButton} from "element-plus"
import {onMounted, ref, toRefs, watch} from "vue"
import {Tools} from "@element-plus/icons-vue";

const props = defineProps({
  id: String,
  text: String,
  isLock: Object
})
const {text, isLock} = toRefs(props)

// 默认搜索引擎
const defaultSearchEngine = [
  {
    name: 'Google',
    url: 'https://www.google.com/search?q={query}'
  },
  {
    name: 'Bing',
    url: 'https://www.bing.com/search?q={query}'
  },
  {
    name: 'Baidu',
    url: 'https://www.baidu.com/s?wd={query}'
  }
]

// 搜索引擎列表
let searchEngineMap = ref({})
let searchEngineList = ref([])
let nowSearchEngine = ref('')
let searchContent = ref(text.value)
let isEditing = ref(false)

// 搜索
function search() {
  const searchUrl = searchEngineMap.value[nowSearchEngine.value].url
  window.open(searchUrl.replace('{query}', searchContent.value), '_blank')
}

watch(isLock, (newValue) => {
  isEditing.value = !newValue
})

// 编辑搜索引擎
const dialogVisible = ref(false)

function editSearchEngine() {
  dialogVisible.value = true
}

function save() {
  window.localStorage.setItem(props.id, JSON.stringify({
    searchEngineMap: searchEngineMap.value,
    nowSearchEngine: nowSearchEngine.value,
  }))
}

watch(isEditing, (newValue) => {
  if (!newValue) {
    save()
  }
})

onMounted(() => {
  load()
  console.log(isLock.value)
  isEditing.value = !isLock.value
})

function load(data) {
  const save = data || window.localStorage.getItem(props.id)
  if (save) {
    const parse = JSON.parse(save)
    searchEngineMap.value = parse.searchEngineMap
    nowSearchEngine.value = parse.nowSearchEngine
  }
  if (!searchEngineMap.value || Object.keys(searchEngineMap.value).length === 0) {
    // 将默认搜索引擎转换为Map，key是name，value是自身
    searchEngineMap.value = defaultSearchEngine.reduce((prev, cur) => {
      prev[cur.name] = cur
      return prev
    }, {})
  }
  if (!nowSearchEngine.value) {
    nowSearchEngine.value = defaultSearchEngine[0].name
  }
  searchEngineList.value = Object.keys(searchEngineMap.value)
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="container">
    <div class="searchContent">
      <el-select
          v-model="nowSearchEngine"
          placeholder="搜索引擎"
          class="searchEngine"
          @change="save"
      >
        <el-option
            v-for="item in searchEngineList"
            :key="item"
            :label="item"
            :value="item"
        />
      </el-select>
      <el-input
          v-model="searchContent"
          class="input"
          :rows="2"
          placeholder="Please input"
          @keydown.enter="search"
      >
        <template v-if="isEditing" #prepend>
          <el-icon class="editIcon" @click="editSearchEngine">
            <Tools/>
          </el-icon>
        </template>
      </el-input>
    </div>
  </div>

  <!-- 编辑搜索引擎弹窗 -->
  <el-dialog
      v-model="dialogVisible"
      title="编辑搜索引擎"
      width="500"
  >
    <span>This is a message</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style>
.container {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
}

.searchContent {
  height: 50%;
  width: 100%;
  display: flex;
  align-items: center;
}

.searchEngine {
  height: 100%;
  width: 200px;
  border-radius: 48px 0 0 48px !important;
}

.searchContent .el-select {
  width: 20% !important;
  min-width: 100px;
  max-width: 160px;
}

.searchContent .el-select__wrapper {
  height: 100%;
  border-radius: 48px 0 0 48px !important;
  box-shadow: unset !important;
  background-color: #000000 !important;
  padding: 0 8px !important;
  min-height: unset !important;
}

.searchContent .el-input__inner {
  font-weight: bold;
}

.searchContent .el-select__selected-item {
  color: white !important;
  font-weight: bolder;
  font-size: large;
}

.searchContent .el-select__placeholder {
  display: flex !important;
  justify-content: space-around;
}

.searchContent .input {
  height: 100%;
  width: 100%;
  font-size: 18px;
  border-radius: 0 48px 48px 0 !important;
}

.searchContent .input .el-input__wrapper {
  width: 100%;
  height: 100%;
  border-radius: 0 48px 48px 0 !important;
  box-shadow: unset !important;
}

.searchContent .el-input-group__prepend {
  box-shadow: unset !important;
  cursor: pointer;
}

.searchContent .el-input-group__prepend {
  padding: unset !important;
}

.searchContent .el-icon.editIcon {
  height: 100% !important;
  width: 100% !important;
  padding: 0 20px;
}
</style>