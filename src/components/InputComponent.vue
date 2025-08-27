<script setup>
import {ElIcon, ElInput, ElMessage, ElText, ElPopover} from "element-plus"
import {onMounted, onUnmounted, ref, toRefs} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {CloseBold, CopyDocument, SortDown} from "@element-plus/icons-vue"

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {id, text, enableEdit} = toRefs(props)

// 方法内容
const functionText = ref(text.value || `'input : ' + input`)
const inputText = ref('')
// 方法结果
const functionResult = ref('')

const functionRef = ref(null)
const onFocus = ref(false)

function onMouseLeave() {
  const inputElement = functionRef?.value.$el
  // 获取第一个子元素
  const firstChild = inputElement?.firstElementChild
  if (firstChild !== document.activeElement) {
    onFocus.value = false
  }
}

function save() {
  onFocus.value = false
  saveData(props.id, JSON.stringify({
    content: functionText.value,
  }))
}

// 执行方法
let iframe

// 监听 iframe 的消息
function listener(event) {
  // 验证消息来源（重要！）
  if (!iframe || event.source !== iframe.contentWindow) return
  functionResult.value = event.data.data
  save()
}

onMounted(() => {
  iframe = document.getElementById('sandbox' + id.value)
  window.addEventListener('message', listener)
})
onUnmounted(() => {
  window.removeEventListener('message', listener)
})

async function safeExecute() {
  function executeCode() {
    const input = inputText.value
    // input当成入参
    // 方法内容中使用input变量
    return eval(`(function (input) {
      ${functionText.value}
    })(input)`)
  }

  try {
    functionResult.value = executeCode()
    console.log(functionResult.value)
  } catch (e) {
    functionResult.value = `错误: ${e}`
  }
  save()
}

function copyResult() {
  if (functionResult.value) {
    navigator.clipboard.writeText(functionResult.value)
    ElMessage.success('复制成功')
  }
}

onMounted(() => {
  load()
})

function load(data) {
  const save = data || loadData(props.id)
  if (save) {
    const parse = JSON.parse(save)
    functionText.value = parse.content
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="inputContent">
    <div
      class="textContainer"
      @mouseenter="onFocus = true"
      @mouseleave="onMouseLeave"
    >
      <iframe :id="'sandbox' + id" sandbox="allow-scripts" style="display: none;"></iframe>
      <div class="ioContainer">
        <el-input
          v-model="inputText"
          ref="input"
          type="textarea"
          placeholder="输入参数，按下ctrl + enter即可执行方法"
          :class="['input', (onFocus && enableEdit) ? 'inputOnFocus' : '']"
          @keydown.ctrl.enter="safeExecute"
        />
        <el-text :class="['result', (onFocus && enableEdit) ? 'resultOnFocus' : '']" v-html="functionResult"/>

        <el-popover
          class="box-item"
          title="执行"
          content="执行方法，在下方得到结果"
          placement="top-end"
        >
          <template #reference>
            <el-icon class="executeIcon" @click="safeExecute">
              <SortDown/>
            </el-icon>
          </template>
        </el-popover>
        <el-popover
          class="box-item"
          title="复制"
          content="复制方法结果到剪切板"
          placement="top-end"
        >
          <template #reference>
            <el-icon class="copyIcon" @click="copyResult">
              <CopyDocument/>
            </el-icon>
          </template>
        </el-popover>
        <el-popover
          class="box-item"
          title="清除结果"
          content="清除方法执行结果"
          placement="top-end"
        >
          <template #reference>
            <el-icon class="clearIcon" @click="functionResult = ''">
              <CloseBold />
            </el-icon>
          </template>
        </el-popover>
      </div>
      <el-input
        v-model="functionText"
        ref="functionRef"
        :class="['function', (onFocus && enableEdit) ? 'functionOnFocus' : '']"
        :rows="2"
        type="textarea"
        placeholder="输入方法内容，可以使用input变量来获取输入值"
        @blur="save"
        @change="save"
      />
    </div>
  </div>
</template>

<style>
.inputContent {
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
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    scrollbar-width: none;

    * {
      scrollbar-width: none;
    }

    .ioContainer {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      width: 100%;
    }

    .input {
      .el-textarea__inner {
        height: 100%;
      }
    }

    .input, .result {
      width: calc(100% - 16px);
      height: calc(50% - 18px);
      border-radius: 8px;
      padding: 8px;
      background-color: white;
    }

    .executeIcon, .copyIcon, .clearIcon {
      border-radius: 18px;
      padding: 4px;
      color: white;
      margin: 1px;
      opacity: 0.4;
      border: 2px solid white;
      cursor: pointer;
      z-index: 1;
      position: absolute;

      &:hover {
        scale: 1.4;
        opacity: 1;
      }
    }

    .executeIcon {
      top: calc(50% - 14px);
      background-color: #eda63f;
    }

    .copyIcon {
      bottom: 0;
      right: 0;
      opacity: 0.1;
      background-color: #3f94ed;
    }

    .clearIcon {
      bottom: 0;
      right: 28px;
      opacity: 0.1;
      background-color: #ff5858;
    }

    .result {
      overflow: auto;
    }

    .functionOnFocus {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }

  :deep(.el-text) {
    width: 100%;
    height: 100%;
    font-size: 18px;
  }

  .function {
    width: 0;
    height: 100%;
    opacity: 0;

    .el-textarea__inner {
      width: 100%;
      height: 100%;
      opacity: 1;
      min-width: unset !important;
      min-height: unset !important;
      padding: 0;
      border-radius: 8px;
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
  }

  .functionOnFocus .el-textarea__inner {
    padding: 4px 6px;
  }

}
</style>