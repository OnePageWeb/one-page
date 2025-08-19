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
  tempSearchEngineList.value.length = 0
  tempSearchEngineList.value.push(...searchEngineList.value)
}

function cancelEdit() {
  dialogVisible.value = false
  tempSearchEngineList.value = []
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

function deleteSearch(index) {
  tempSearchEngineList.value.splice(index, 1)
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
        placeholder="输入搜索内容"
        @keydown.enter="search"
        clearable
      >
        <template #prepend>
          <el-icon class="editIcon" :class="{'hide': !isEditing}" @click="editSearchEngine">
            <Tools/>
          </el-icon>
        </template>
      </el-input>
    </div>

    <!-- 编辑搜索引擎弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑搜索引擎"
      width="60%"
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
            <el-form-item class="deleteIcon" @click="deleteSearch(index)">
              <el-icon>
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
          <el-button @click="cancelEdit">取消</el-button>
          <el-button type="primary" @click="saveEdit">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
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

  .el-select {
    width: 20% !important;
    min-width: 100px;
    max-width: 160px;
  }

  .el-select__wrapper {
    height: 100%;
    border-radius: 48px 0 0 48px !important;
    box-shadow: unset !important;
    background-color: #000000 !important;
    padding: 0 8px !important;
    min-height: unset !important;
  }

  .el-input__inner {
    font-weight: bold;
  }

  .el-select__selected-item {
    color: white !important;
    font-weight: bolder;
    font-size: large;
  }

  .el-select__placeholder {
    display: flex !important;
    justify-content: space-around;
  }

  .input {
    height: 100%;
    width: 100%;
    font-size: 18px;
    border-radius: 0 48px 48px 0 !important;

    &:hover {
      width: 140%;
    }

    .el-input__wrapper {
      width: 100%;
      height: 100%;
      border-radius: 0 48px 48px 0 !important;
      box-shadow: unset !important;
      padding: 0 11px;
    }
  }

  .el-input-group__prepend {
    box-shadow: unset !important;
    cursor: pointer;
    padding: unset !important;
    border-radius: unset !important;
  }

  .el-icon.editIcon {
    height: 100% !important;
    width: 100% !important;
    padding: 0 20px;
  }

  .el-icon.editIcon.hide {
    height: 100% !important;
    width: 0 !important;
    padding: 0;
  }
}

.searchEngine {
  height: 100%;
  width: 200px;
  border-radius: 48px 0 0 48px !important;
}

.searchForm {
  .searchItem {
    display: flex;
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

    .searchName {
      display: block !important;
      width: 160px !important;
    }

    .searchUrl {
      display: block !important;
      width: calc(100% - 180px) !important;
    }
  }

}
</style>