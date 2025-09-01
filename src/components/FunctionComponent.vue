<script setup>
import {ElIcon, ElInput, ElPopover, ElText} from "element-plus"
import {nextTick, onMounted, onUnmounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {Finished, SwitchButton, VideoPlay, Edit, View} from "@element-plus/icons-vue"
import InputWithParams from "@/items/inputWithParams.vue"

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

const isEditing = ref(false)
watch(enableEdit, (newValue) => {
  if (!newValue) {
    isEditing.value = false
  }
})

function dbclick() {
  if (!enableEdit.value) {
    execute()
  }
}

const functionRef = ref(null)

const inputWithParams = ref(null)

function onInputUpdate(value) {
  functionContent.value = value
  save()
}

function save() {
  saveData(props.id, JSON.stringify({
    content: inputWithParams.value.save(),
    result: functionResult.value,
    autoExecute: autoExecute.value
  }))
}

// 执行方法
let iframe

// 监听 iframe 的消息
function listener(event) {
  console.log('收到消息:', event)
  // 验证消息来源
  if (!iframe || event.source !== iframe.contentWindow) return
  functionResult.value = event.data?.data || event.data?.error
  save()
}

onMounted(() => {
  iframe = document.getElementById('sandbox' + id.value)
  window.addEventListener('message', listener)
})
onUnmounted(() => {
  window.removeEventListener('message', listener)
})

async function execute() {
  isEditing.value = false
  const setResult = (result) => {
    nextTick(() => {
      functionResult.value = result
    })
  }
  function executeCode() {
    return eval(`(function (setResult) {
      ${functionContent.value}
    })(setResult)`)
  }

  try {
    functionResult.value = executeCode()
  } catch (e) {
    console.log(e)
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
    functionResult.value = parse.result
    autoExecute.value = parse.autoExecute
    nextTick(() => {
      inputWithParams.value.load(parse.content)
      if (autoExecute.value) {
        execute()
      }
    })
  } else if (autoExecute.value) {
    execute()
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="functionContent" ref="functionRef" @dblclick="dbclick">
    <div class="textContainer">
      <iframe :id="'sandbox' + id" sandbox="allow-scripts" style="display: none;"></iframe>
      <el-text :class="['result', isEditing ? 'resultOnFocus' : '']" v-html="functionResult"/>
      <inputWithParams
          ref="inputWithParams"
          :class="['input', isEditing ? 'inputOnFocus' : '']"
          :initText="functionContent"
          placeholder="输入方法内容"
          @update="onInputUpdate"
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
          <el-icon class="paramItem execute" @click="execute">
            <VideoPlay/>
          </el-icon>
        </template>
      </el-popover>
      <el-popover
          v-if="!isEditing"
          class="box-item"
          title="编辑"
          content="编辑方法内容"
          placement="bottom-end"
          width="200"
      >
        <template #reference>
          <el-icon class="paramItem edit" @click="isEditing = true">
            <Edit/>
          </el-icon>
        </template>
      </el-popover>
      <el-popover
          v-else
          class="box-item"
          title="查看"
          content="查看方法内容"
          placement="bottom-end"
          width="200"
      >
        <template #reference>
          <el-icon class="paramItem edit" @click="isEditing = false">
            <View/>
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

    .positive {
      background-color: #aaaaaa;
    }

    .edit {
      background-color: #b58a08;
    }
  }
}
</style>