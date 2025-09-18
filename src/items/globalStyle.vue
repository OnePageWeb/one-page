<script setup>
import {ElButton, ElIcon, ElInput, ElTag, ElText, ElDivider} from "element-plus"
import {nextTick, onMounted, ref, shallowRef} from "vue"
import {exportData, loadData, removeData, saveData} from "@/js/data.js"
import {CircleCheckFilled} from "@element-plus/icons-vue"
import cssEditor from "@/items/cssEditor.vue"
import {useI18n} from 'vue-i18n'
import commonDialog from "@/items/commonDialog.vue"
import {success, warning} from "@/js/message.js"
import NameDescDialog from "@/items/nameDescDialog.vue"
import {STYLE_PACK} from "@/js/configType.js"

const {t, locale} = useI18n()

const emit = defineEmits(['loadStyle'])
const visible = ref(false)

// 当前全局样式
const globalStyle = ref('')
const styleTags = ref([])
const activeTags = ref([])
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
    activeTags.value = JSON.parse(select) || []
  }

  // 从地址栏尝试获取config参数
  const urlParams = new URLSearchParams(window.location.search)
  const style = urlParams.get('style')
  if (style) {
    // selectTags的值为style列表，并且值需要在selectTags中存在
    const validStyle = style.split(',').filter(item => styleTags.value.includes(item))
    activeTags.value = [...validStyle]
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

function applyTag(tag) {
  if (activeTags.value.indexOf(tag) > -1) {
    // 已选择则取消选择
    activeTags.value = activeTags.value.filter(item => item !== tag)
    warning(t('style.inactive_') + tag)
  } else {
    activeTags.value.push(tag)
    success(t('style.active_') + tag)
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
    warning(t('error.noName'))
    return
  }
  // 检查是否已存在
  if (styleTags.value.includes(curTagName.value)) {
    warning(t('error.nameExist'))
    return
  }
  styleTags.value.push(curTagName.value)
  curTagName.value = ''
  tagNameDialogVisible.value = false
  save()
}

// 全局样式删除确认弹窗
const deleteConfirm = ref(false)
const deleteTagName = ref('')

function showDeleteConfirm(tag) {
  deleteTagName.value = tag
  deleteConfirm.value = true
}

function deleteItem(tag) {
  // 删除selectTags
  activeTags.value = activeTags.value.filter(item => item !== tag)
  // 删除styleTags
  styleTags.value = styleTags.value.filter(item => item !== tag)
  removeData('globalStyle-tag-' + tag)
  save()
  deleteConfirm.value = false
}

// 导出主题包
const exportDialogVisible = ref(false)
const selectTags = ref([])
const nameDescDialogRef = ref(null)

const selectTag = (tag) => {
  if (selectTags.value.indexOf(tag) > -1) {
    // 已选择则取消选择
    selectTags.value = selectTags.value.filter(item => item !== tag)
  } else {
    selectTags.value.push(tag)
  }
}

const preSelectTags = () => {
  if (selectTags.value.length === 0) {
    warning(t('error.noSelectStyle'))
    return
  }
  nameDescDialogRef.value.open()
}

const exportStylePack = ({name, desc}) => {
  if (selectTags.value.length === 0) {
    warning(t('error.noSelectStyle'))
    return
  }
  if (!name) {
    warning(t('error.noName'))
    return
  }
  // 导出选中的样式
  const exportStyle = {}
  exportStyle['name'] = name
  exportStyle['desc'] = desc
  exportStyle.type = STYLE_PACK
  exportStyle.styles = []
  for (let tag of selectTags.value) {
    const style = loadData('globalStyle-tag-' + tag) || ''
    if (style) {
      exportStyle.styles.push({tag, style})
    }
  }
  nameDescDialogRef.value.cancel()
  // 导出为文件
  exportData(exportStyle, name + '.json')
}

const stylePackDialogVisible = ref(false)
const stylePackName = ref('')
const stylePackDesc = ref('')
const stylePackItems = shallowRef([])
const duplicateTags = shallowRef([])
const selectStylePackItem = ref([])
const loadStylePackConfirm = (data) => {
  if (typeof data === 'string') {
    data = JSON.parse(data)
  }
  console.log('loadStylePackConfirm')
  stylePackName.value = data.name
  stylePackDesc.value = data.desc
  stylePackItems.value = data.styles || []
  // 检查是否存在重复的样式标签
  const tempTags = []
  const pickTags = []
  for (let item of stylePackItems.value) {
    if (styleTags.value.indexOf(item.tag) > -1) {
      tempTags.push(item.tag)
    } else {
      pickTags.push(item.tag)
    }
  }
  duplicateTags.value = tempTags
  selectStylePackItem.value = pickTags
  stylePackDialogVisible.value = true
}

const pickStylePackItem = (tag) => {
  if (selectStylePackItem.value.indexOf(tag) > -1) {
    // 已选择则取消选择
    selectStylePackItem.value = selectStylePackItem.value.filter(item => item !== tag)
  } else {
    selectStylePackItem.value.push(tag)
  }
}

const loadStylePack = () => {
  // 确认添加重复样式标签
  for (let item of stylePackItems.value) {
    const tag = item.tag
    if (selectStylePackItem.value.indexOf(tag) === -1) {
      continue
    }
    if (styleTags.value.indexOf(tag) === -1) {
      styleTags.value.push(tag)
    }
    saveData('globalStyle-tag-' + tag, item.style)
  }
  stylePackName.value = ''
  stylePackDesc.value = ''
  stylePackItems.value = []
  success(t('success.save'))
  stylePackDialogVisible.value = false
  refreshGlobalStyle()
}

const saveStylePack = () => {
  for (let item of stylePackItems.value) {
    // 保存样式标签
    styleTags.value.push(item.tag)
    activeTags.value.push(item.tag)
    saveTagStyle(item.style)
  }
}

function refreshGlobalStyle() {
  visible.value = false
  loadSelectedStyle()
  save()
}

function saveTagStyle(value) {
  if (selectedTagIndex.value === -1) {
    warning(t('error.noSelectStyle'))
    return
  }
  globalStyle.value = value
  // 保存样式
  saveData('globalStyle-tag-' + styleTags.value[selectedTagIndex.value], globalStyle.value)
  success(t('success.save'))
}

function save() {
  // 保存全局样式
  saveData('globalStyle-tags', JSON.stringify(styleTags.value))
  // 保存选中的样式
  saveData('globalStyle-selectTags', JSON.stringify(activeTags.value))
}

function loadSelectedStyle() {
  let selectedStyle = ''
  activeTags.value.forEach(tag => {
    selectedStyle += loadData('globalStyle-tag-' + tag) || '' + '\n'
  })
  loadStyle('globalStyle', selectedStyle)
}

// 加载样式，覆盖本地样式，styleConfig与fetchAllStyleConfig()的返回值一致
function initStyleConfig(styleConfig) {
  styleTags.value = styleConfig['globalStyle-tags'] || []
  // 加载选中的样式标签
  activeTags.value = styleConfig['globalStyle-selectTags'] || []
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
  styleConfig['globalStyle-selectTags'] = activeTags.value
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
  activeTags.value.length = 0
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
  generateStyleConfig, initStyleConfig, clearStyle, open, loadStylePackConfirm
})
</script>

<template>
  <!-- 全局样式弹窗 -->
  <common-dialog
      :title="t('style.global')"
      :visible="visible"
      width="30%"
      class="globeStyleDialog"
      @closed="refreshGlobalStyle"
  >
    <div style="position: relative;">
      <div class="tagContainer">
        <el-tag
            v-for="(tag, index) in styleTags"
            :class="[activeTags.indexOf(tag) > -1 ? 'activeTag' : '', curTagName === tag ? 'curTag' : '']"
            :key="tag"
            closable
            @click="showTagStyle(index)"
            @close="showDeleteConfirm(tag)"
        >
          <div style="display: flex; align-items: center;gap: 8px">
            <el-icon :class="[activeTags.indexOf(tag) > -1 ? 'activeIcon' : 'inactiveIcon']"
                     @click.prevent="applyTag(tag)">
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
      <el-button @click="exportDialogVisible = true">{{ t('style.pack.create') }}</el-button>
      <el-button @click="loadSelectedStyle">{{ t('common.apply') }}</el-button>
    </template>

    <!-- 样式名称输入 -->
    <common-dialog
        :title="selectedTagIndex > -1 ? t('style.edit') : t('style.add')"
        :visible="tagNameDialogVisible"
        @closed="tagNameDialogVisible = false"
        class="editTagDialog"
        width="400px"
    >
      <el-input
          v-model="curTagName"
          :placeholder="(selectedTagIndex > -1 ? t('placeholder.styleNameEdit') : t('placeholder.styleNameAdd'))"
          @keydown.enter="editTagName"
          :autofocus="true"
      >
        <template #prepend>{{ t('style.name') }}</template>
      </el-input>
    </common-dialog>

    <!-- 删除确认弹窗 -->
    <common-dialog
        :title="t('style.delete.title')"
        :visible="deleteConfirm"
        width="400px"
        class="deleteStyleConfirmDialog"
        @closed="deleteConfirm = false"
    >
      <div style="display: flex;justify-content: center;align-items: center;">
        <div>
          {{ t('style.delete.content') }} <span
            style="font-size: 24px;font-weight: bolder; color: orange">{{ deleteTagName }}</span>
          <div>
            {{ t('style.delete.confirm') }}
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="deleteItem(deleteTagName)">{{ t('common.confirm') }}</el-button>
        <el-button @click="deleteConfirm = false">{{ t('common.cancel') }}</el-button>
      </template>
    </common-dialog>

    <!-- 导出主题包 -->
    <common-dialog
        :title="t('style.pack.create')"
        :visible="exportDialogVisible"
        width="30%"
        class="exportStyleDialog"
        @closed="exportDialogVisible = false"
    >
      <div class="tagContainer">
        <el-text class="packTip" tag="div">{{ t('style.pack.createTip') }}</el-text>
        <el-tag
            v-for="(tag, index) in styleTags"
            :class="[selectTags.indexOf(tag) > -1 ? 'activeTag' : '', curTagName === tag ? 'curTag' : '']"
            :key="tag"
            @click="selectTag(tag)"
        >
          {{ tag }}
        </el-tag>
      </div>

      <template #footer>
        <el-button @click="preSelectTags">{{ t('common.export') }}</el-button>
      </template>

      <!-- 名称与描述输入框 -->
      <name-desc-dialog
          ref="nameDescDialogRef"
          :title="$t('style.pack.title')"
          :name-text="$t('style.pack.name')"
          :desc-text="$t('style.pack.desc')"
          width="400px"
          @save="exportStylePack"
      />
    </common-dialog>
  </common-dialog>

  <!-- 加载主题包 -->
  <common-dialog
      :title="$t('style.pack.title')"
      :visible="stylePackDialogVisible"
      width="30%"
      class="stylePackDisplayDialog"
      @closed="stylePackDialogVisible = false"
  >
    <div>
      <el-text class="stylePackName" tag="div">{{ stylePackName }}</el-text>
      <el-text class="stylePackDesc" tag="div">{{ stylePackDesc }}</el-text>
      <el-divider/>
      <div>
        <el-tag
            v-for="(item, index) in stylePackItems"
            :class="selectStylePackItem.indexOf(item.tag) > -1 ? 'activeTag' : ''"
            :key="item.tag"
            @click="pickStylePackItem(item.tag)"
        >
          {{ item.tag }}
        </el-tag>
      </div>
      <div v-if="duplicateTags.length > 0" style="color: red;">
        {{ t('style.duplicate.desc', [duplicateTags.join(', ')]) }}
      </div>
    </div>

    <template #footer>
      <el-button @click="loadStylePack">{{ t('common.load') }}</el-button>
    </template>
  </common-dialog>
</template>

<style>
.globeStyleDialog {
  height: 60%;

  .tagContainer {
    height: calc(20% - 36px);
    border: 2px solid #dddddd;
    margin: 4px 0;
    border-radius: 24px;
    padding: 8px 12px;
    overflow: auto;

    .addTag {
      background-color: var(--color-black);
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

  }

  .globeStyleInput {
    height: 80%;
    margin-top: 12px;
    display: block !important;
  }

  .el-textarea {
    height: 80% !important;

    .el-textarea__inner {
      height: 100%;
    }
  }

}

.deleteStyleConfirmDialog {
  height: 200px !important;
}

.editTagDialog {
  height: 140px !important;

  .el-dialog__body {
    padding: 16px !important;
    height: calc(100% - 80px) !important;
    max-height: calc(100% - 80px) !important;
  }
}

.exportStyleDialog {
  height: 40% !important;

  .packTip {
    width: calc(100% - 12px);
    margin: 6px;
    display: flex;
    justify-content: center;
    font-style: oblique;
  }
}

.stylePackDisplayDialog {
  .stylePackName {
    width: 100%;
    display: flex;
    justify-content: center;
    font-weight: bold;
    font-size: 26px;
  }

  .stylePackDesc {
    font-size: 18px;
  }
}
</style>