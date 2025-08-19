<script setup>
import {ElInput, ElText} from "element-plus"
import {nextTick, onMounted, ref, toRefs, watch} from "vue"

const props = defineProps({
  id: String,
  text: String,
  isLock: Object
})
const {text, isLock} = toRefs(props)

// 是否自动执行
let autoExecute = ref(false)
// 方法内容
let functionContent = ref(text.value)
// 方法结果
let functionResult = ref('')
let isEditing = ref(false)

watch(isLock, (newValue) => {
  isEditing.value = !newValue
})
const input = ref(null)

function dbclick() {
  if (!isLock.value) {
    isEditing.value = true
    nextTick(() => {
      input.value.focus()
    })
  } else {
    execute()
  }
}

function save() {
  window.localStorage.setItem(props.id, JSON.stringify({
    content: functionContent.value,
    result: functionResult.value,
    autoExecute: autoExecute.value
  }))
}

watch(isEditing, (newValue) => {
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
}

onMounted(() => {
  load()
  isEditing.value = !isLock.value
})

function load(data) {
  const save = data || window.localStorage.getItem(props.id)
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
  <div class="functionContent" @dblclick="dbclick">
    <div class="textContainer">
      <el-text :class="[isEditing ? 'runtimeResult' : 'result']" v-html="functionResult"/>
      <el-input
        v-model="functionContent"
        ref="input"
        :class="[isEditing ? 'editing' : 'input']"
        :rows="2"
        type="textarea"
        placeholder="输入方法内容（请勿执行来源不明的代码，否则可能会导致安全问题）"
      />
    </div>
    <div :class="['params', {'hide': !isEditing}]">
      <div :class="['paramItem', {'positive': !autoExecute}]" @click="autoExecute = !autoExecute">载入时运行</div>
      <div :class="['paramItem']" @click="execute">运行</div>
      <div :class="['paramItem']" @click="save">保存</div>
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
}

.textContainer {
  opacity: 1;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* 当textContent被选中时，改变editing的宽度 */

  &:hover {
    .runtimeResult {
      width: 0;
      opacity: 0;
    }

    .editing {
      width: 100%;
      opacity: 1;
    }
  }
}

.editing {
  width: 0;
  opacity: 0;
  height: 100%;
  font-size: 18px;
  border: unset;
}

.editing :deep(.el-textarea__inner) {
  width: 100%;
  height: 100%;
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

:deep(.el-text) {
  width: 100%;
  height: 100%;
  font-size: 18px;
}

.input {
  width: 0;
  height: 100%;
}

:deep(textarea) {
  resize: none;
}

.input :deep(.el-textarea__inner) {
  width: 0;
  height: 0;
  opacity: 0 !important;
  min-width: unset !important;
  min-height: unset !important;
  padding: 0 !important;
}

.params {
  width: 100%;
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
</style>