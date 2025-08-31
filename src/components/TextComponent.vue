<script setup>
import {ElCollapse, ElCollapseItem, ElInput, ElText, ElPopover, ElIcon, ElTooltip} from "element-plus"
import {onMounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {InfoFilled, Edit} from '@element-plus/icons-vue'
import ComponentOperator from "@/items/componentOperator.vue"

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {text, enableEdit} = toRefs(props)

// 默认文本内容
const content = ref(text.value)
const contentValue = ref('')
const onFocus = ref(false)

const collapse = ref([])

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

function edit() {
  if (enableEdit.value) {
    isEditing.value = true
  }
}

const isEditing = ref(false)

function onMouseLeave() {
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

function onInputBlur() {
  onFocus.value = false
  calcParams()
  save()
}

function onInputFocus() {
  collapse.value = []
}

function save() {
  saveData(props.id, JSON.stringify({text: content.value, params: params.value}))
}

onMounted(() => {
  load()
})

watch(enableEdit, (newVal) => {
  if (!newVal) {
    isEditing.value = false
  }
})

function load(data) {
  const save = data || loadData(props.id)
  if (save) {
    const parse = JSON.parse(save)
    content.value = parse.text
    params.value = parse.params || []
    calcParams()
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div
      class="textContent"
      @dblclick="edit"
      @mouseenter="onFocus = true"
      @mouseleave="onMouseLeave"
  >
    <div :class="['result', isEditing ? 'resultOnFocus' : '']" v-html="contentValue"/>
    <div :class="['editContainer', isEditing ? 'editOnFocus' : '']">
      <el-collapse v-model="collapse" class="paramContainer" @change="calcParams">
        <el-collapse-item name="params">
          <template #title>
            <div class="title-wrapper">
              参数列表
              <el-popover
                  class="box-item"
                  title="参数说明"
                  content="在文本中使用 ${参数名:参数说明?参数默认值} 的格式来引用参数，参数说明与默认值都可以不填写，例如：${标题:标题内容}"
                  placement="top-start"
                  width="400"
              >
                <template #reference>
                  <el-icon class="header-icon">
                    <info-filled />
                  </el-icon>
                </template>
              </el-popover>
            </div>
          </template>
          <el-input
              class="paramInput"
              v-model="param.value"
              v-for="param in params"
              :rows="1"
              :placeholder="param.desc || ('请填写' + param.name)"
              @change="save"
              @blur="onInputBlur"
          >
            <template #prepend>
              <div class="paramName">{{ param.name }}</div>
            </template>
          </el-input>
        </el-collapse-item>
      </el-collapse>
      <el-input
          v-model="content"
          ref="input"
          class="input"
          :rows="2"
          type="textarea"
          placeholder="输入内容"
          @blur="onInputBlur"
          @focus="onInputFocus"
          @change="save"
      />
    </div>
    <component-operator :visible="enableEdit">
      <el-tooltip
        effect="light"
        content="开启编辑"
        placement="top"
      >
        <el-icon @click="edit">
          <Edit />
        </el-icon>
      </el-tooltip>
    </component-operator>
  </div>
</template>

<style>
.textContent {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .result {
    width: 100%;
    font-size: 18px;
    height: 100%;
    overflow: auto;
    scrollbar-width: none;
  }

  :deep(.el-text) {
    width: 100%;
    height: 100%;
    font-size: 18px;
  }

  .editContainer {
    display: flex;
    flex-direction: column;
    width: 0;
    height: 100%;
    opacity: 0;

    .paramContainer {
      width: 100%;
      border-top: unset;
      z-index: 1;
      --el-collapse-header-height: 36px;
      --el-border-radius-base: 0;

      .el-collapse-icon-position-right .el-collapse-item__header {
        padding: 0;
      }

      .el-collapse-item__header {
        padding: 0 8px;
        width: calc(100% - 16px);
      }

      .el-collapse-item__content {
        padding: 0;
      }

      .el-collapse-item__wrap {
        position: absolute;
        border-bottom: unset;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
    }

    .input {
      width: 100%;
      height: calc(100% - 48px);
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
      width: 40%;
    }

    .inputOnFocus .el-textarea__inner {
      padding: 8px !important;
    }
  }

  .editOnFocus {
    width: 60%;
    height: 100%;
    opacity: 1;
  }
}
</style>