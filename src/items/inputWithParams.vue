<script setup>
import {ElCollapse, ElCollapseItem, ElIcon, ElInput, ElPopover} from "element-plus"
import {InfoFilled} from "@element-plus/icons-vue"
import {ref} from "vue"
import {useI18n} from "vue-i18n"
import HtmlEditor from "@/items/htmlEditor.vue"

const {t} = useI18n()

const props = defineProps({
  initText: String,
  placeholder: String
})
const emit = defineEmits(['update', 'enter'])

const collapse = ref([])
const contentValue = ref('')
const calcContentValue = () => {
  let value = content.value
  for (let i = 0; i < paramItems.length; i++) {
    value = value.replace(paramItems[i], params.value[i].value)
  }
  contentValue.value = value
}

// 默认文本内容
const content = ref('')
const input = ref(null)
const params = ref([])
const paramItems = []

function calcParams() {
  const value = content.value
  // 从value中提取参数，参数格式如下${}，并将每一个参数提取到一个列表中
  const matches = value?.match(/\${(.*?)}/g) || []
  const tempParams = []
  paramItems.length = 0
  for (let param of matches) {
    const paramContent = param.substring(2, param.length - 1)
    if (paramContent.length > 0) {
      const strings = paramContent.split('?', 2)
      let name = ''
      let desc = ''
      let defaultVal = ''
      if (strings.length > 1) {
        defaultVal = strings[1]
        const nameDesc = strings[0].split(':', 2)
        name = nameDesc[0]
        if (nameDesc.length > 1) {
          desc = nameDesc[1]
        }
      } else {
        name = strings[0]
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

function onInputBlur(value) {
  calcParams()
  update(value)
}

function onInputFocus() {
  collapse.value = []
}

function update(value) {
  content.value = value
  calcParams()
  emit('update', contentValue.value, params.value)
}

function enter() {
  emit('enter', contentValue.value, params.value)
}

function load(data) {
  if (data !== undefined && data !== null) {
    content.value = data.text || content.value
    input.value.load(content.value)
    params.value = data.params || []
    calcParams()
    emit('update', contentValue.value, params.value)
  }
}

function save() {
  return {text: content.value, params: params.value}
}

defineExpose({
  save, load, clear() {
    content.value = ''
    params.value = []
  }
})
</script>

<template>
  <div class="inputWithParams">
    <el-collapse v-model="collapse" class="paramContainer" @change="calcParams">
      <el-collapse-item name="params">
        <template #title>
          <div class="title-wrapper">
            {{ t('input.params') }}
            <el-popover
              class="box-item"
              :title="t('input.paramsInfo')"
              :content="t('input.paramsTip')"
              placement="top-start"
              width="400"
            >
              <template #reference>
                <el-icon class="header-icon">
                  <info-filled/>
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
          :placeholder="param.desc || (t('placeholder.needInput') + param.name)"
          @change="update"
          @blur="onInputBlur"
        >
          <template #prepend>
            <div class="paramName">{{ param.name }}</div>
          </template>
        </el-input>
      </el-collapse-item>
    </el-collapse>
    <html-editor
      ref="input"
      class="input"
      :init-content="content"
      @blur="onInputBlur"
      @focus="onInputFocus"
      @update="update"
      @enter="enter"
    />
  </div>
</template>

<style>
.inputWithParams {
  overflow: hidden;

  .paramContainer {
    width: 100%;
    border-top: unset;
    z-index: 3;
    --el-collapse-header-height: 36px;
    --el-border-radius-base: 0;
    position: relative;

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
    height: calc(100% - 37px);
    display: block !important;
    background-color: white;
  }

  .input .el-textarea__inner {
    width: 100%;
    height: 100%;
    opacity: 1;
    min-width: unset !important;
    min-height: unset !important;
    padding: 4px 8px;
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

}
</style>