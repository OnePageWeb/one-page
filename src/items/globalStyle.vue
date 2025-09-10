<script setup>
import {ElButton, ElDialog, ElInput, ElMessage, ElTag, ElIcon} from "element-plus"
import {nextTick, onMounted, ref} from "vue"
import {loadData, removeData, saveData} from "@/js/data.js"
import {CircleCheckFilled} from "@element-plus/icons-vue"
import cssEditor from "@/items/cssEditor.vue"
import {useI18n} from 'vue-i18n'
const { t, locale } = useI18n()

const emit = defineEmits(['loadStyle'])
const visible = ref(false)

// 当前全局样式
const globalStyle = ref('')
const styleTags = ref([])
const selectTags = ref([])
const cssEditorRef = ref(null)

onMounted(() => {
  // 加载样式标签
  const tags = loadData('globalStyle-tags')
  if (tags) {
    styleTags.value = JSON.parse(tags) || []
  }
  // 加载选中的样式标签
  const select = loadData('globalStyle-selectTags')
  if (select) {
    selectTags.value = JSON.parse(select) || []
  }

  // 从地址栏尝试获取config参数
  const urlParams = new URLSearchParams(window.location.search)
  const style = urlParams.get('style')
  if (style) {
    // selectTags的值为style列表，并且值需要在selectTags中存在
    const validStyle = style.split(',').filter(item => styleTags.value.includes(item))
    selectTags.value = [...validStyle]
    save()
  }
  loadSelectedStyle()
})

const selectedTagIndex = ref(-1)
const curTagName = ref('')

function showTagStyle(index) {
  selectedTagIndex.value = index
  curTagName.value = styleTags.value[index]
  // 加载样式
  globalStyle.value = loadData('globalStyle-tag-' + styleTags.value[index]) || ''
  cssEditorRef.value.load(globalStyle.value)
}

function selectTag(tag) {
  if (selectTags.value.indexOf(tag) > -1) {
    // 已选择则取消选择
    selectTags.value = selectTags.value.filter(item => item !== tag)
    ElMessage({
      message: t('style.inactive_') + tag,
      type: 'warning'
    })
  } else {
    selectTags.value.push(tag)
    ElMessage({
      message: t('style.active_') + tag,
      type: 'success'
    })
  }
  loadSelectedStyle()
  save()
}

const tagNameDialogVisible = ref(false)

function addTag() {
  selectedTagIndex.value = -1
  curTagName.value = ''
  tagNameDialogVisible.value = true
}

function editTagName() {
  if (curTagName.value.trim() === '') {
    ElMessage({
      message: t('error.noName'),
      type: 'warning'
    })
    return
  }
  // 检查是否已存在
  if (styleTags.value.includes(curTagName.value)) {
    ElMessage({
      message: t('error.nameExist'),
      type: 'warning'
    })
    return
  }
  styleTags.value.push(curTagName.value)
  curTagName.value = ''
  tagNameDialogVisible.value = false
  save()
}

const deleteConfirm = ref(false)
const deleteTagName = ref('')

function showDeleteConfirm(tag) {
  deleteTagName.value = tag
  deleteConfirm.value = true
}

function deleteItem(tag) {
  // 删除selectTags
  selectTags.value = selectTags.value.filter(item => item !== tag)
  // 删除styleTags
  styleTags.value = styleTags.value.filter(item => item !== tag)
  removeData('globalStyle-tag-' + tag)
  save()
  deleteConfirm.value = false
}

function refreshGlobalStyle() {
  loadSelectedStyle()
  save()
  visible.value = false
}

function saveTagStyle(value) {
  if (selectedTagIndex.value === -1) {
    ElMessage({
      message: t('error.noSelectStyle'),
      type: 'warning'
    })
    return
  }
  globalStyle.value = value
  // 保存样式
  saveData('globalStyle-tag-' + styleTags.value[selectedTagIndex.value], globalStyle.value)
  ElMessage({
    message: t('success.save'),
    type: 'success'
  })
}

function save() {
  // 保存全局样式
  saveData('globalStyle-tags', JSON.stringify(styleTags.value))
  // 保存选中的样式
  saveData('globalStyle-selectTags', JSON.stringify(selectTags.value))
}

function loadSelectedStyle() {
  let selectedStyle = ''
  selectTags.value.forEach(tag => {
    selectedStyle += loadData('globalStyle-tag-' + tag) || '' + '\n'
  })
  loadStyle('globalStyle', selectedStyle)
}

// 加载样式，覆盖本地样式，styleConfig与fetchAllStyleConfig()的返回值一致
function initStyleConfig(styleConfig) {
  styleTags.value = styleConfig['globalStyle-tags'] || []
  // 加载选中的样式标签
  selectTags.value = styleConfig['globalStyle-selectTags'] || []
  save()
  // 遍历选中的样式标签，加载样式
  Object.keys(styleConfig).forEach(key => {
    if (key.startsWith('globalStyle-tag-')) {
      // 保存样式
      saveData(key, styleConfig[key])
    }
  })
}

function loadStyle(id, styleConfig) {
  emit('loadStyle', id, styleConfig)
}

function generateStyleConfig() {
  const styleConfig = {}
  styleTags.value.forEach(tag => {
    styleConfig['globalStyle-tag-' + tag] = loadData('globalStyle-tag-' + tag)
  })
  // 保存所有的样式标签
  styleConfig['globalStyle-tags'] = styleTags.value
  // 保存选中的样式标签
  styleConfig['globalStyle-selectTags'] = selectTags.value
  return styleConfig
}

// 清空所有样式
function clearStyle() {
  globalStyle.value = ''
  // 遍历styleTags，删除所有样式
  styleTags.value.forEach(tag => {
    removeData('globalStyle-tag-' + tag)
  })
  // 清空styleTags
  styleTags.value.length = 0
  // 清空selectTags
  selectTags.value.length = 0
  removeData('globalStyle-tags')
  removeData('globalStyle-selectTags')
}

// 开启全局样式弹窗
function open() {
  visible.value = true
  globalStyle.value = ''
  selectedTagIndex.value = -1
  curTagName.value = ''
  nextTick(() => {
    cssEditorRef.value.load('')
  })
}

defineExpose({
  generateStyleConfig, initStyleConfig, clearStyle, open
})
</script>

<template>
  <!-- 全局样式弹窗 -->
  <el-dialog
      :title="t('style.global')"
      v-model="visible"
      width="30%"
      class="globeStyleDialog commonDialog"
      align-center
      :close-on-press-escape="false"
      @close="refreshGlobalStyle"
  >
    <div style="position: relative;">
      <div class="tagContainer">
        <el-tag
            v-for="(tag, index) in styleTags"
            :class="['styleTag', selectTags.indexOf(tag) > -1 ? 'activeTag' : '', curTagName === tag ? 'curTag' : '']"
            :key="tag"
            closable
            @click="showTagStyle(index)"
            @close="showDeleteConfirm(tag)"
        >
          <div style="display: flex; align-items: center;gap: 8px">
            <el-icon :class="[selectTags.indexOf(tag) > -1 ? 'activeIcon' : 'inactiveIcon']" @click.prevent="selectTag(tag)">
              <CircleCheckFilled/>
            </el-icon>
            {{ tag }}
          </div>
        </el-tag>

        <el-tag
            class="addTag"
            @click="addTag"
        >
          {{ t('style.add') }}
        </el-tag>
      </div>
      <css-editor
          :init-content="globalStyle"
          class="globeStyleInput"
          ref="cssEditorRef"
          :placeholder="selectedTagIndex > -1 ? (t('placeholder.styleEdit_') + styleTags[selectedTagIndex]) : t('placeholder.styleSelect')"
          :disabled="selectedTagIndex === -1"
          @blur="saveTagStyle"
      />
    </div>
    <template #footer>
      <el-button type="primary" @click="loadSelectedStyle">{{ t('common.apply') }}</el-button>
    </template>

    <el-dialog
        :title="selectedTagIndex > -1 ? t('style.edit') : t('style.add')"
        v-model="tagNameDialogVisible"
        @close="tagNameDialogVisible = false"
        class="editTagDialog commonDialog"
        width="400px"
        :close-on-press-escape="false"
        align-center
    >
      <el-input
          v-model="curTagName"
          :placeholder="(selectedTagIndex > -1 ? t('placeholder.styleNameEdit') : t('placeholder.styleNameAdd'))"
          @keydown.enter="editTagName"
          :autofocus="true"
      >
        <template #prepend>{{ t('style.name') }}</template>
      </el-input>
    </el-dialog>

    <el-dialog
        :title="t('style.delete.title')"
        v-model="deleteConfirm"
        width="400px"
        class="deleteConfirm commonDialog"
        align-center
    >
      <div style="display: flex;justify-content: center;align-items: center;">
        <div>
          {{ t('style.delete.content') }} <span style="font-size: 24px;font-weight: bolder">{{ deleteTagName }}</span>
          <div>
            {{ t('style.delete.confirm') }}
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="deleteItem(deleteTagName)">{{ t('common.confirm') }}</el-button>
        <el-button type="primary" @click="deleteConfirm = false">{{ t('common.cancel') }}</el-button>
      </template>
    </el-dialog>
  </el-dialog>

</template>

<style>
.globeStyleDialog {
  .tagContainer {
    height: calc(20% - 36px);
    border: 2px solid #dddddd;
    margin: 4px 0;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 4px;
    padding: 8px 12px;
    overflow: auto;

    .styleTag, .addTag {
      margin: 6px;
      font-size: large;
      padding: 8px 16px;
      cursor: pointer;
      height: unset;
      user-select: none;
      border: 2px solid #ffffff;

      &:hover {
        animation: shake 1s linear infinite;
      }
    }

    .styleTag {
      color: #ffffff;
      background-color: #939393;
    }

    .activeTag {
      color: #ffffff;
      background-color: var(--el-color-primary);
      font-weight: bold;
    }

    .activeIcon {
      color: #ffffff;
      width: 20px;
      height: 20px;
      display: block;
      svg {
        width: 20px;
        height: 20px;
      }
    }

    .inactiveIcon {
      color: #555555;
      width: 20px;
      height: 20px;
      display: block;
      svg {
        width: 20px;
        height: 20px;
      }
    }

    .curTag {
      color: #ffffff;
      animation: upAndDown 0.5s linear infinite;
    }

    .el-tag__close {
      height: 20px;
      width: 20px;
      color: white;
    }
  }

  .globeStyleInput {
    height: 80%;
    display: block !important;
  }

  .el-textarea {
    height: 80% !important;

    .el-textarea__inner {
      height: 100%;
    }
  }

  .editTagDialog {
    height: 140px;

    .el-dialog__body {
      padding: 16px;
      height: calc(100% - 80px);
      max-height: calc(100% - 80px);
    }
  }

  .deleteConfirm {
    height: 200px;
  }
}

</style>