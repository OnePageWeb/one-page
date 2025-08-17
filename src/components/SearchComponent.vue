<script setup>
import {ElButton, ElDialog, ElForm, ElFormItem, ElIcon, ElInput, ElOption, ElSelect} from "element-plus"
import {onMounted, ref, toRefs, watch} from "vue"
import {Close, Plus, Tools} from "@element-plus/icons-vue";

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
let tempSearchEngineList = ref([])

function editSearchEngine() {
  dialogVisible.value = true
  tempSearchEngineList.value = searchEngineList.value
}

function saveEdit() {
  // 去除空格，并去除无效项
  tempSearchEngineList.value = tempSearchEngineList.value
      .map(item => ({
        name: item.name.trim(),
        url: item.url.trim(),
      }))
      .filter(item => item.name.trim() !== '' && item.url.trim() !== '')
  // 映射到Map
  searchEngineMap.value = tempSearchEngineList.value.reduce((prev, cur) => {
    prev[cur.name] = cur
    return prev
  }, {})
  save()
  dialogVisible.value = false
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
  searchEngineList.value = Object.values(searchEngineMap.value)
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
            :key="item.name"
            :label="item.name"
            :value="item.name"
        />
      </el-select>
      <el-input
          v-model="searchContent"
          class="input"
          :rows="2"
          placeholder="Please input"
          @keydown.enter="search"
      >
        <template #prepend>
          <el-icon class="editIcon" :class="{'hide': !isEditing}" @click="editSearchEngine">
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
      width="40%"
  >
    <el-form ref="formRef" label-width="100px" class="searchForm">
      <template v-for="(item, index) in tempSearchEngineList">
        <div class="searchItem">
          <el-form-item label="搜索引擎名称" prop="name" class="searchName">
            <el-input v-model="item.name" placeholder="请输入搜索引擎名称"/>
          </el-form-item>
          <el-form-item label="搜索引擎URL" prop="url" class="searchUrl">
            <el-input v-model="item.url" placeholder="请输入搜索引擎URL"/>
          </el-form-item>
          <el-form-item>
            <el-icon class="deleteItem">
              <Close/>
            </el-icon>
          </el-form-item>
        </div>
      </template>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="() => tempSearchEngineList.push({name: '', url: ''})">
          <el-icon>
            <Plus/>
          </el-icon>
        </el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveEdit">
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
  transition: all 0.3s ease-in-out;
}

.searchContent .el-icon.editIcon.hide {
  height: 100% !important;
  width: 0 !important;
  padding: 0;
}

.searchForm .searchItem {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px dashed #aaaaaa;
  /* 最后一个不添加 */

  &:last-child {
    padding-bottom: 0;
    border-bottom: unset;
  }

  /* 第一个不添加 */

  &:first-child {
    padding-top: 0;
  }
}

.searchForm .searchName {
  display: block !important;
  width: 160px !important;
}

.searchForm .searchUrl {
  display: block !important;
  width: calc(100% - 180px) !important;
}

.deleteItem {
  cursor: pointer;
  pointer-events: auto;
  height: 20px;
  width: 20px;
}
</style>