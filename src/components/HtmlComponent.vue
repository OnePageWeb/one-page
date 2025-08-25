<script setup>
import {ElIcon, ElInput, ElTooltip, ElSwitch} from "element-plus"
import {nextTick, onMounted, ref, toRefs} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {Edit} from "@element-plus/icons-vue";

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {text, enableEdit} = toRefs(props)

// 默认文本内容
let content = ref(text.value)
let onFocus = ref(false)

const input = ref(null)

const webIframe = ref(null)
const updateIframeContent = () => {
  if (!webIframe.value) return
  const blob = new Blob([content.value], { type: 'text/html' })
  webIframe.value.src = URL.createObjectURL(blob)
  onFocus.value = false
}

function edit() {
  if (enableEdit.value) {
    onFocus.value = true
    nextTick(() => {
      input.value.focus()
    })
  }
}

function onMouseLeave() {
  const inputElement = input?.value.$el
  // 获取第一个子元素
  nextTick(() => {
    const firstChild = inputElement?.firstElementChild
    if (firstChild !== document.activeElement) {
      onFocus.value = false
    }
  })
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
    updateIframeContent()
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div
      class="htmlContent"
      @dblclick="edit"
      @mouseleave="onMouseLeave"
  >
    <iframe
        ref="webIframe"
        :class="['result', (onFocus && enableEdit) ? 'resultOnFocus' : '']"
        sandbox="allow-scripts allow-same-origin"
        frameborder="0"
    ></iframe>
    <el-input
        v-model="content"
        ref="input"
        :class="['input', (onFocus && enableEdit) ? 'inputOnFocus' : '']"
        :rows="2"
        type="textarea"
        placeholder="输入内容"
        @blur="updateIframeContent"
        @change="save"
    />

    <div
      :class="['operatorContainer', enableEdit ? 'operatorContainerOnFocus' : '']">
      <el-tooltip
        effect="light"
        content="开启编辑"
        placement="top"
      >
        <el-icon @click="edit">
          <Edit />
        </el-icon>
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped>
.htmlContent {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .result {
    width: 100%;
    height: 100%;
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

  .resultOnFocus {
    width: 40%;
  }

  .inputOnFocus {
    width: 60%;
    height: 100%;
    opacity: 1;
  }

  .inputOnFocus :deep(.el-textarea__inner) {
    padding: 8px !important;
  }

  .operatorContainer {
    width: 0;
    position: absolute;
    bottom: 4px;
    left: 4px;
    opacity: 0;
    margin: 4px;
    padding: 8px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background-color: white;
    border-radius: 8px;

    .el-icon {
      cursor: pointer;
    }
  }

  &:hover {
    .operatorContainerOnFocus {
      width: calc(100% - 32px);
      opacity: 1;
    }
  }
}
</style>