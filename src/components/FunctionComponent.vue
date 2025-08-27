<script setup>
import {ElIcon, ElInput, ElPopover, ElText} from "element-plus"
import {onMounted, onUnmounted, ref, toRefs} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {OnAreaCheck} from "@/js/onAreaCheck.js"
import {Finished, SwitchButton, VideoPlay} from "@element-plus/icons-vue";

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {id, text, enableEdit} = toRefs(props)

// 是否自动执行
const autoExecute = ref(false)
// 方法内容
const functionContent = ref(text.value)
// 方法结果
const functionResult = ref('')

const input = ref(null)
let onFocus = ref(false)

function dbclick() {
  if (!enableEdit.value) {
    safeExecute()
  }
}

const functionRef = ref(null)
// 检查鼠标是否离开元素，用于开启编辑
const onAreaCheck = new OnAreaCheck(functionRef)
const onOver = (e) => {
  onAreaCheck.onMouseOver(e, () => {
    onFocus.value = true
  })
}
const onLeave = (e) => {
  onAreaCheck.onMouseLeave(e, () => {
    onFocus.value = false
  })
}

function save() {
  onFocus.value = false
  saveData(props.id, JSON.stringify({
    content: functionContent.value,
    result: functionResult.value,
    autoExecute: autoExecute.value
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
  if (!iframe) {
    iframe = document.getElementById('sandbox' + id.value)
  }
  const blob = new Blob([`
    <script>
      const setResult = (result) => {
        window.parent.postMessage({
          type: 'result',
          data: result,
          success: true
        }, '*')
      }
      try {
        const result = eval(${JSON.stringify(functionContent.value)})
        window.parent.postMessage({
          type: 'result',
          data: result,
          success: true
        }, '*')
      } catch (error) {
        window.parent.postMessage({
          type: 'error',
          error: error.message,
          success: false
        }, '*')
      }
    <\/script>
  `], {type: 'text/html'})
  iframe.src = URL.createObjectURL(blob)
  save()
}

function stopExecute() {
  iframe.src = 'about:blank'
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
    safeExecute()
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="functionContent" ref="functionRef" @dblclick="dbclick">
    <div
      class="textContainer"
      @mouseover="onOver"
      @mouseleave="onLeave"
    >
      <iframe :id="'sandbox' + id" sandbox="allow-scripts" style="display: none;"></iframe>
      <el-text :class="['result', (onFocus && enableEdit) ? 'resultOnFocus' : '']" v-html="functionResult"/>
      <el-input
        v-model="functionContent"
        ref="input"
        :class="['input', (onFocus && enableEdit) ? 'inputOnFocus' : '']"
        :rows="2"
        type="textarea"
        placeholder="输入方法内容"
        @blur="save"
        @keydown.ctrl.enter="safeExecute"
        @change="save"
      />
    </div>
    <div :class="['params', !enableEdit ? 'hide' : '']">
      <el-popover
        class="box-item"
        :title="autoExecute ? '已开启载入时自动运行' : '已关闭自动运行'"
        content="开启后，页面加载时会自动执行方法"
        placement="bottom-end"
        width="200"
      >
        <template #reference>
          <el-icon :class="['paramItem', {'positive': !autoExecute}]" @click="autoExecute = !autoExecute">
            <Finished/>
          </el-icon>
        </template>
      </el-popover>
      <el-popover
        class="box-item"
        title="执行"
        content="执行方法，在下方得到结果"
        placement="bottom-end"
        width="200"
      >
        <template #reference>
          <el-icon class="paramItem execute" @click="safeExecute">
            <VideoPlay/>
          </el-icon>
        </template>
      </el-popover>
      <el-popover
        class="box-item"
        title="停止"
        content="停止执行方法"
        placement="bottom-end"
        width="200"
      >
        <template #reference>
          <el-icon class="paramItem stop" @click="stopExecute">
            <SwitchButton/>
          </el-icon>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<style scoped>
.functionContent {
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
    height: calc(100% - 32px);
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

  .result {
    cursor: pointer;
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

  .inputOnFocus :deep(.el-textarea__inner) {
    padding: 8px !important;
  }

  .resultOnFocus {
    cursor: default;
  }

  .params {
    width: calc(100% - 8px);
    height: 24px;
    opacity: 1;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .paramItem {
      padding: 4px;
      margin: 0 4px;
      border-radius: 4px;
      color: #f1f1f1;
      font-weight: bold;
      background-color: #64b1ff;
      cursor: pointer;

      &:hover {
        scale: 1.4;
      }
    }

    .stop {
      background-color: #ff5858;
    }

    .positive {
      background-color: #aaaaaa;
    }
  }
}
</style>