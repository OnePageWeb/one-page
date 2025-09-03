<script setup>
import {ElIcon, ElInput, ElMessage, ElText, ElTooltip} from "element-plus"
import {computed, nextTick, onMounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"
import MarkdownIt from 'markdown-it'
import markdownItTaskLists from 'markdown-it-task-lists'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-less'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-csharp'
import {Picture, Upload, Edit, Download} from "@element-plus/icons-vue"
import ComponentOperator from "@/items/componentOperator.vue"
import {useI18n} from "vue-i18n"
const {t} = useI18n()

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {text, enableEdit} = toRefs(props)

const isEditing = ref(false)
// 默认文本内容
const content = ref(text?.value || '')
const onFocus = ref(false)
const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  highlight: (str, lang) => {
    if (lang && Prism.languages[lang]) {
      try {
        return Prism.highlight(str, Prism.languages[lang], lang);
      } catch (error) {
        console.warn('Prism highlight error:', error);
      }
    }
    // 未知语言或没有指定语言时
    return Prism.highlight(str, Prism.languages.text, 'text');
  }
}).use(markdownItTaskLists)
const renderedContent = computed(() => {
  return md.render(content.value);
})

const input = ref(null)

function edit() {
  onFocus.value = true
  nextTick(() => {
    input.value.focus()
  })
  isEditing.value = true
}

function openNewWindow() {
  // 将open的窗口居中，长宽都是80%
  const screenWidth = window.screen.width
  const screenHeight = window.screen.height
  const windowWidth = screenWidth * 0.4
  const windowHeight = screenHeight * 0.6
  const windowLeft = (screenWidth - windowWidth) / 2
  const windowTop = (screenHeight - windowHeight) / 2
  // 定义窗口特性
  const features = `width=${windowWidth},height=${windowHeight},left=${windowLeft},top=${windowTop},` +
      'menubar=no,toolbar=no,location=no,status=no,resizable=yes';
  // 尝试打开新窗口
  const newWindow = window.open('', '_blank', features)
  if (!newWindow) {
    ElMessage.warning(t('error.cannotOpenWindow'))
    return
  }
  setTimeout(() => { newWindow.document.title = t('component.note.title'); }, 100);
  // 向新窗口写入内容
  newWindow.document.write(renderedContent.value)
  // 结束文档写入
  newWindow.document.close()
}

function onMouseLeave() {
  const inputElement = input?.value.$el
  // 获取第一个子元素
  const firstChild = inputElement?.firstElementChild
  if (firstChild !== document.activeElement) {
    onFocus.value = false
  }
}

function exportNote() {
  // 创建一个a标签
  const a = document.createElement('a')
  // 设置a标签的href属性为markdown文件的内容
  a.href = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(content.value)
  // 设置a标签的download属性为文件名
  a.download = 'note.md'
  // 模拟点击a标签
  a.click()
  // 移除a标签
  a.remove()
}

// 处理文件拖拽
function handleFileDrop(e) {
  e.preventDefault()
  const file = e.dataTransfer.files[0]
  // 检查文件名后缀是否是markdown文件
  if (!file.name.toLocaleLowerCase().endsWith('.md')) {
    ElMessage.error(t('error.uploadMarkdown'))
    return
  }
  const reader = new FileReader()
  reader.readAsText(file, 'utf-8')
  reader.onload = () => {
    content.value = reader.result
  }
}

function save() {
  saveData(props.id, JSON.stringify({text: content.value}))
}

onMounted(() => {
  load()
})

function load(data) {
  const save = data || loadData(props.id)
  if (save) {
    content.value = JSON.parse(save).text
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div
      class="noteContent"
      @dragover.prevent
      @drop.prevent="handleFileDrop"
      @dblclick="edit"
      @mouseenter="onFocus = true"
      @mouseleave="onMouseLeave"
  >
    <div :class="['result', onFocus && enableEdit || isEditing ? 'resultOnFocus' : '']" v-html="renderedContent"/>
    <el-input
        v-model="content"
        ref="input"
        :class="['input', onFocus && enableEdit || isEditing ? 'inputOnFocus' : '']"
        :rows="2"
        type="textarea"
        :placeholder="t('placeholder.noteInput')"
        @blur="onFocus = false; isEditing = false"
        @change="save"
    />
    <component-operator :visible="onFocus">
      <el-tooltip
          v-if="(!onFocus || !enableEdit) && !isEditing"
          effect="light"
          :content="t('common.openEdit')"
          placement="bottom"
      >
        <el-icon @click="edit">
          <Edit />
        </el-icon>
      </el-tooltip>
      <el-tooltip
          effect="light"
          :content="t('component.note.openWindow')"
          placement="bottom"
      >
        <el-icon @click="openNewWindow">
          <Upload />
        </el-icon>
      </el-tooltip>
      <el-tooltip
          effect="light"
          :content="t('component.note.export')"
          placement="bottom"
      >
        <el-icon @click="exportNote">
          <Download />
        </el-icon>
      </el-tooltip>
    </component-operator>
  </div>
</template>

<style>
.noteContent {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .result {
    width: calc(100% - 16px);
    font-size: 18px;
    height: calc(100% - 24px);
    overflow-y: auto;
    scrollbar-width: none;
    padding: 8px;
    color: #3c3c3c;
    background: repeating-linear-gradient(
        -45deg,
        rgba(240, 240, 240, 0.5),
        rgba(240, 240, 240, 0.5) 40px,
        rgba(255, 255, 255, 0.5) 40px,
        rgba(255, 255, 255, 0.5) 80px
    );
    backdrop-filter: blur(10px);
    border-radius: 8px;
    border: 4px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }

  :deep(.el-text) {
    width: 100%;
    height: 100%;
    font-size: 18px;
  }

  .input {
    width: 0;
    height: 100%;
    opacity: 0;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  }

  .input .el-textarea__inner {
    width: 100%;
    height: 100%;
    opacity: 1;
    min-width: unset !important;
    min-height: unset !important;
    padding: 0;
    color: #5c5c5c;
    font-size: 18px;
    font-weight: bold;
    border-color: unset;
    background: repeating-linear-gradient(
        -45deg,
        rgba(240, 240, 240, 0.9),
        rgba(240, 240, 240, 0.9) 40px,
        rgba(255, 255, 255, 0.9) 40px,
        rgba(255, 255, 255, 0.9) 80px
    );
    &:focus {
      box-shadow: unset !important;
      --el-input-focus-border-color: unset !important;
      border-radius: 0 4px 4px 0;
    }
  }

  .resultOnFocus {
    width: calc(40% - 16px);
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .inputOnFocus {
    width: calc(60% - 8px);
    height: calc(100% - 8px);
    opacity: 1;
    border: 4px solid rgba(255, 255, 255, 0.4);
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  .inputOnFocus .el-textarea__inner {
    padding: 8px !important;
  }

}
</style>