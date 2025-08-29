<script setup>
import {ElButton, ElDialog, ElForm, ElFormItem, ElIcon, ElInput, ElOption, ElSelect} from "element-plus"
import {onMounted, ref, toRefs, watch} from "vue"
import {Close, Plus, Tools} from "@element-plus/icons-vue";
import {loadData, saveData} from "@/js/data.js"

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {text, enableEdit} = toRefs(props)

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
  },
  {
    name: 'BiliBili',
    url: 'https://www.bilibili.com/search?keyword={query}'
  },
  {
    name: 'Yahoo',
    url: 'https://search.yahoo.com/search?p={query}'
  },
  {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q={query}'
  }
]

// 搜索引擎列表
let searchEngineMap = {}
const searchEngineList = ref([])
// 当前搜索引擎
const nowSearchEngine = ref('')
// 搜索内容
const searchContent = ref(text.value)

// 搜索
function search(event) {
  let target = '_blank'
  if (event.shiftKey) {
    target = '_self'
  }
  const searchUrl = searchEngineMap[nowSearchEngine.value].url
  window.open(prefix.value || '' + searchUrl.replace('{query}', searchContent.value) + suffix.value || '', target)
}
// 上一个搜索引擎
function previousSearchEngine() {
  const index = searchEngineList.value.map(item => item.name).indexOf(nowSearchEngine.value)
  // 切换搜索引擎
  if (index - 1 < 0) {
    nowSearchEngine.value = searchEngineList.value[searchEngineList.value.length - 1].name
  } else {
    nowSearchEngine.value = searchEngineList.value[index - 1].name
  }
}
// 下一个搜索引擎
function nextSearchEngine(event) {
  if (event.shiftKey) {
    previousSearchEngine()
    save()
    return
  }
  const index = searchEngineList.value.map(item => item.name).indexOf(nowSearchEngine.value)
  // 切换搜索引擎
  if (index + 1 >= searchEngineList.value.length) {
    nowSearchEngine.value = searchEngineList.value[0].name
  } else {
    nowSearchEngine.value = searchEngineList.value[index + 1].name
  }
  save()
}

// 前后置
const prefix = ref('')
const suffix = ref('')

// 编辑搜索引擎
const dialogVisible = ref(false)
const tempSearchEngineList = ref([])

watch(dialogVisible, b => {
  if (!b) {
    // 重新加载
    const save = loadData(props.id)
    if (save) {
      const parse = JSON.parse(save)
      prefix.value = parse.prefix
      suffix.value = parse.suffix
    }
  }
})

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
  searchEngineMap = tempSearchEngineList.value.reduce((prev, cur) => {
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
  saveData(props.id, JSON.stringify({
    searchEngineMap: searchEngineMap,
    nowSearchEngine: nowSearchEngine.value,
    prefix: prefix.value,
    suffix: suffix.value
  }))
}

onMounted(() => {
  load()
})

function load(data) {
  const save = data || loadData(props.id)
  if (save) {
    const parse = JSON.parse(save)
    searchEngineMap = parse.searchEngineMap
    nowSearchEngine.value = parse.nowSearchEngine
    prefix.value = parse.prefix
    suffix.value = parse.suffix
  }
  if (!searchEngineMap || Object.keys(searchEngineMap).length === 0) {
    // 将默认搜索引擎转换为Map，key是name，value是自身
    searchEngineMap = defaultSearchEngine.reduce((prev, cur) => {
      prev[cur.name] = cur
      return prev
    }, {})
  }
  if (!nowSearchEngine.value) {
    nowSearchEngine.value = defaultSearchEngine[0].name
  }
  searchEngineList.value = Object.values(searchEngineMap)
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="searchContainer">
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
        >
          <div v-html="item.name" />
        </el-option>
        <template #label="{ value }">
          <div v-html="value" />
        </template>
      </el-select>
      <el-input
          v-model="searchContent"
          class="input"
          placeholder="输入搜索内容"
          @keydown.enter.prevent.stop="search"
          @keydown.tab.prevent="nextSearchEngine"
          clearable
      >
        <template #prepend>
          <el-icon class="editIcon" :class="{'hide': !enableEdit}" @click="editSearchEngine">
            <Tools/>
          </el-icon>
        </template>
      </el-input>
    </div>

    <!-- 编辑搜索引擎弹窗 -->
    <el-dialog
        class="commonDialog"
        v-model="dialogVisible"
        title="编辑搜索引擎"
        width="60%"
        align-center
        destroy-on-close
    >
      <el-form ref="formRef" label-width="100px" label-position="left" class="searchForm">
        <div class="appendContainer">
          <el-form-item label="前置内容" prop="prefix" class="prefix">
            <el-input v-model="prefix" placeholder="在链接前的内容，通常是空"/>
          </el-form-item>
          <el-form-item label="后置内容" prop="suffix" class="suffix">
            <el-input v-model="suffix" placeholder="在链接后的内容，通常是高级搜索"/>
          </el-form-item>
        </div>
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
.searchContainer {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;

  .searchContent {
    height: 50%;
    max-height: 240px;
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
      border-radius: 120px 0 0 120px !important;
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
      font-size: 20px;
      caret-color: #8e8e8e;
      border-radius: 0 120px 120px 0 !important;

      .el-input__inner::placeholder {
        text-indent: 8px;
      }

      &:hover {
        font-size: 20px;
        line-height: 1;
      }

      .el-input__wrapper {
        width: 100%;
        height: 100%;
        border-radius: 0 120px 120px 0 !important;
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

    .appendContainer {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed #aaaaaa;

      .prefix {
        width: 45%;
      }

      .suffix {
        width: 45%;
      }

      .el-form-item__label {
        border-left: 8px solid #1bc3b3;
      }

      .el-form-item {
        flex-direction: column;
      }
    }

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

}
</style>