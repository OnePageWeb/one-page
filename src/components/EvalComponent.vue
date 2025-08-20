<script setup>
import {ElInput, ElText} from "element-plus"
import {nextTick, onMounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js";

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {text, enableEdit} = toRefs(props)

// 是否自动执行
let autoExecute = ref(false)
// 方法内容
let functionContent = ref(text.value)
// 方法结果
let functionResult = ref('')

const input = ref(null)
let onFocus = ref(false)

function dbclick() {
  if (enableEdit.value) {
    nextTick(() => {
      input.value.focus()
    })
  } else {
    execute()
  }
}

function onMouseLeave() {
  const inputElement = input?.value.$el
  // 获取第一个子元素
  const firstChild = inputElement?.firstElementChild
  if (firstChild !== document.activeElement) {
    onFocus.value = false
  }
}

function save() {
  onFocus.value = false
  saveData(props.id, JSON.stringify({
    content: functionContent.value,
    result: functionResult.value,
    autoExecute: autoExecute.value
  }))
}

watch(enableEdit, (newValue) => {
  if (!newValue) {
    save()
  }
})

// 执行方法
async function execute() {
  function executeCode() {
    return eval(functionContent.value)
  }

  try {
    functionResult.value = executeCode()
  } catch (e) {
    functionResult.value = `错误: ${e}`
  }
  save()
}

onMounted(() => {
  load()
})

function load(data) {
  const save = data || loadData(props.id)
  if (save) {
    const parse = JSON.parse(save)
    functionContent.value = parse.content
    functionResult.value = parse.result
    autoExecute.value = parse.autoExecute
  }
  if (autoExecute.value) {
    execute()
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="evalContent" @dblclick="dbclick">
    <div
        class="textContainer"
        @mouseenter="onFocus = true"
        @mouseleave="onMouseLeave"
    >
      <el-text :class="['result', (onFocus && enableEdit) ? 'resultOnFocus' : '']" v-html="functionResult"/>
      <el-input
          v-model="functionContent"
          ref="input"
          :class="['input', (onFocus && enableEdit) ? 'inputOnFocus' : '']"
          :rows="2"
          type="textarea"
          placeholder="输入方法内容（请勿执行来源不明的代码，否则可能会导致安全问题）"
          @blur="save"
          @keydown.ctrl.enter="execute"
      />
    </div>
    <div :class="['params', !enableEdit ? 'hide' : '']">
      <div :class="['paramItem', {'positive': !autoExecute}]" @click="autoExecute = !autoExecute">载入时运行</div>
      <div :class="['paramItem']" @click="execute">运行</div>
    </div>
  </div>
</template>

<style scoped>
.evalContent {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .params.hide {
    height: 0;
    opacity: 0;
  }

  .textContainer {
    opacity: 1;
    height: calc(100% - 40px);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    scrollbar-width: none;

    * {
      scrollbar-width: none;
    }

    .resultOnFocus {
      width: 0;
      display: none;
      opacity: 0;
    }

    .inputOnFocus {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }

  .inputOnFocus :deep(.el-textarea__inner) {
    padding: 8px !important;
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

  :deep(textarea) {
    resize: none;
  }

  .input :deep(.el-textarea__inner) {
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

  .params {
    width: 100%;
    height: 40px;
    opacity: 1;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: space-around;

    .paramItem {
      padding: 4px 12px;
      border-radius: 4px;
      color: #f1f1f1;
      font-weight: bold;
      background-color: #64b1ff;
      cursor: pointer;
    }

    .positive {
      background-color: #aaaaaa;
    }
  }
}
</style>