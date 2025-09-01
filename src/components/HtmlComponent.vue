<script setup>
import {ElIcon, ElInput, ElTooltip, ElSwitch} from "element-plus"
import {nextTick, onMounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {Edit, View} from "@element-plus/icons-vue"
import ComponentOperator from "@/items/componentOperator.vue"

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {text, enableEdit} = toRefs(props)

// 默认文本内容
let content = ref(text.value)
let isEditing = ref(false)
watch(enableEdit, (newVal) => {
  if (!newVal) {
    isEditing.value = false
  }
})

const textContentRef = ref(null)
const collapse = ref([])
const contentValue = ref('')
const calcContentValue = () => {
  let value = content.value
  for (let i = 0; i < paramItems.length; i++) {
    value = value.replace(paramItems[i], params.value[i].value)
  }
  contentValue.value = value
}

const input = ref(null)
const params = ref([])
const paramItems = []

const webIframe = ref(null)
const updateIframeContent = () => {
  if (!webIframe.value) return
  const blob = new Blob([content.value], { type: 'text/html' })
  webIframe.value.src = URL.createObjectURL(blob)
}

function edit() {
  isEditing.value = !isEditing.value
  if (isEditing.value) {
    calcParams()
    collapse.value.push("params")
  }
}

function view() {
  isEditing.value = false
}

function calcParams() {
  const value = content.value
  // 从value中提取参数，参数格式如下${}，并将每一个参数提取到一个列表中
  const matches = value.match(/\${(.*?)}/g) || []
  const tempParams = []
  paramItems.length = 0
  for (let param of matches) {
    const paramContent = param.substring(2, param.length - 1)
    if (paramContent.length > 0) {
      const strings = paramContent.split('?', 2)
      let name = ''
      let desc = ''
      const defaultVal = strings[1]
      if (strings.length > 1) {
        const defaultValStrings = strings[1].split(':', 2)
        name = defaultValStrings[0]
        if (defaultValStrings.length > 1) {
          desc = defaultValStrings[1]
        }
      }
      tempParams.push({
        name,
        desc,
        value: defaultVal
      })
      paramItems.push(param)
    }
  }
  // 合并参数
  for (let tempParam of tempParams) {
    const param = params.value.find(item => item.name === tempParam.name)
    if (param) {
      tempParam.value = param.value
    }
  }
  params.value = tempParams
  calcContentValue()
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
    nextTick(() => {
      updateIframeContent()
    })
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
  >
    <iframe
        ref="webIframe"
        :class="['result', isEditing ? 'resultOnFocus' : '']"
        sandbox="allow-scripts allow-same-origin"
        frameborder="0"
    ></iframe>
    <el-input
        v-model="content"
        ref="input"
        :class="['input', isEditing ? 'inputOnFocus' : '']"
        :rows="2"
        type="textarea"
        placeholder="输入内容"
        @blur="updateIframeContent"
        @change="save"
    />

    <component-operator :visible="enableEdit">
      <el-tooltip
          v-if="isEditing"
          effect="light"
          content="关闭编辑"
          placement="top"
      >
        <el-icon @click="view">
          <View/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-else
          effect="light"
          content="开启编辑"
          placement="top"
      >
        <el-icon @click="edit">
          <Edit/>
        </el-icon>
      </el-tooltip>
    </component-operator>
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
}
</style>