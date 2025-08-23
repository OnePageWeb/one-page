<script setup>
import {ElIcon, ElInput, ElText, ElTooltip} from "element-plus"
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
import {Picture, Upload} from "@element-plus/icons-vue";

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {text} = toRefs(props)

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
const isEditing = ref(false)

function edit() {
  isEditing.value = true
  onFocus.value = true
  nextTick(() => {
    input.value.focus()
  })
}

function openNewWindow() {
  // 定义窗口特性
  const features = 'width=600,height=400,left=100,top=100,resizable=yes'
  // 尝试打开新窗口
  const newWindow = window.open('', '_blank', features)
  if (!newWindow) {
    alert('弹出窗口被阻止了！请允许此站点的弹出窗口。')
    return
  }
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
  isEditing.value = false
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
      @dblclick="edit"
      @mouseenter="onFocus = true"
      @mouseleave="onMouseLeave"
  >
    <div :class="['result', onFocus && isEditing ? 'resultOnFocus' : '']" v-html="renderedContent"/>
    <el-input
        v-model="content"
        ref="input"
        :class="['input', onFocus && isEditing ? 'inputOnFocus' : '']"
        :rows="2"
        type="textarea"
        placeholder="输入内容"
        @blur="onFocus = false"
        @change="save"
    />
    <div :class="['operatorContainer', { 'operatorContainerHide': !onFocus, 'operatorContainerOnFocus': onFocus }]">
      <el-tooltip
          v-if="onFocus"
          effect="light"
          content="弹出窗口显示"
          placement="top"
      >
        <el-icon @click="openNewWindow">
          <Upload />
        </el-icon>
      </el-tooltip>
    </div>
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
    height: calc(100% - 16px);
    overflow-y: auto;
    scrollbar-width: none;
    padding: 8px;
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
  }

  .input .el-textarea__inner {
    width: 100%;
    height: 100%;
    opacity: 1;
    min-width: unset !important;
    min-height: unset !important;
    padding: 0;
    border-radius: 0;
    color: #3a3a3a;
    font-weight: bold;
    background: repeating-linear-gradient(
        -45deg,
        rgba(240, 240, 240, 0.9),
        rgba(240, 240, 240, 0.9) 40px,
        rgba(255, 255, 255, 0.9) 40px,
        rgba(255, 255, 255, 0.9) 80px
    );
  }

  .resultOnFocus {
    width: calc(40% - 16px);
  }

  .inputOnFocus {
    width: 60%;
    height: 100%;
    opacity: 1;
  }

  .inputOnFocus .el-textarea__inner {
    padding: 8px !important;
  }

  .operatorContainer {
    width: calc(100% - 16px);
    position: absolute;
    bottom: 0;
    opacity: 1;
    margin: 4px;
    padding: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
    border-radius: 8px;

    .el-icon {
      cursor: pointer;
    }
  }

  .operatorContainerHide {
    width: 0;
    padding: 0;
    opacity: 0;
  }
}
</style>