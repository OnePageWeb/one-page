<script setup>
import {ElIcon, ElInput, ElMessage, ElPopover, ElText, ElTooltip} from "element-plus"
import {nextTick, onMounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {CloseBold, CopyDocument, Edit, SortDown, View} from "@element-plus/icons-vue"
import ComponentOperator from "@/items/componentOperator.vue"
import {useI18n} from "vue-i18n"
import InputWithParams from "@/items/inputWithParams.vue"
import {success} from "@/js/message.js"
const {t} = useI18n()

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {id, text, enableEdit} = toRefs(props)

const nameText = ref('')
// 方法内容
const functionTextRef = ref(null)
const functionText = ref(text.value || `'input : ' + input`)
let params = []
const inputText = ref('')
// 方法结果
const functionResult = ref('')
const isEditing = ref(false)

watch(enableEdit, (newValue) => {
  if (!newValue) {
    isEditing.value = false
  }
})

function onFunctionChange(value) {
  functionText.value = value
  save()
}

function save() {
  const data = functionTextRef.value.save()
  params = data.params
  saveData(props.id, JSON.stringify({
    name: nameText.value,
    content: data.text,
    params: data.params
  }))
}

async function execute() {
  function executeCode() {
    const fn = new Function("input", "setResult", functionText.value)
    return fn(inputText.value, (res) => {
      functionResult.value = res
    })
  }

  try {
    functionResult.value = executeCode()
  } catch (e) {
    console.error(e)
    functionResult.value = `error: ${e}`
  }
  save()
}

function copyResult() {
  if (functionResult.value) {
    navigator.clipboard.writeText(functionResult.value)
    success(t('success.copy'))
  }
}

onMounted(() => {
  load()
})

function load(data) {
  const save = data || loadData(props.id)
  if (save) {
    const parse = JSON.parse(save)
    nameText.value = parse.name
    functionText.value = parse.content
    params = parse.params || []
    nextTick(() => {
      functionTextRef.value.load({ text: functionText.value, params: params })
    })
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="inputContent">
    <div class="textContainer">
      <div :class="['ioContainer', isEditing ? 'ioContainerHidden' : '']">
        <el-input
            v-model="inputText"
            ref="input"
            type="textarea"
            :placeholder="nameText || t('placeholder.inputDataInput')"
            :class="['input', isEditing ? 'inputOnFocus' : '']"
            @keydown.ctrl.enter="execute"
        />
        <el-text :class="['result', isEditing ? 'resultOnFocus' : '']" v-html="functionResult"/>

        <el-popover
            class="box-item"
            :title="t('common.execute')"
            :content="t('component.input.executeDesc')"
            placement="top-end"
        >
          <template #reference>
            <el-icon class="executeIcon" @click="execute">
              <SortDown/>
            </el-icon>
          </template>
        </el-popover>
        <el-popover
            class="box-item"
            :title="t('common.copy')"
            :content="t('component.input.copyDesc')"
            placement="bottom-end"
        >
          <template #reference>
            <el-icon class="copyIcon" @click="copyResult">
              <CopyDocument/>
            </el-icon>
          </template>
        </el-popover>
        <el-popover
            class="box-item"
            :title="t('common.clear')"
            :content="t('component.input.clearDesc')"
            placement="bottom-end"
        >
          <template #reference>
            <el-icon class="clearIcon" @click="functionResult = ''">
              <CloseBold/>
            </el-icon>
          </template>
        </el-popover>
      </div>

      <div
          :class="['function', isEditing ? 'functionOnFocus' : '']">
        <!-- 编辑框 -->
        <el-input
            v-model="nameText"
            class="functionName"
            :placeholder="t('component.input.functionName')"
            @change="save"
        >
          <template #prepend>{{t('component.input.functionName')}}</template>
        </el-input>
        <input-with-params
            ref="functionTextRef"
            class="functionContent"
            :rows="2"
            type="textarea"
            :placeholder="t('placeholder.inputFunctionInput')"
            @update="onFunctionChange"
        />
      </div>
    </div>

    <component-operator :visible="enableEdit">
      <el-tooltip
          v-if="isEditing"
          effect="light"
          :content="t('common.closeEdit')"
          placement="top"
          :show-after="800"
          :hide-after="10"
      >
        <el-icon @click="isEditing = false">
          <View/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-else
          effect="light"
          :content="t('common.openEdit')"
          placement="top"
          :show-after="800"
          :hide-after="10"
      >
        <el-icon @click="isEditing = true">
          <Edit/>
        </el-icon>
      </el-tooltip>
    </component-operator>
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
    }

    .ioContainerHidden {
      padding: 0;
      width: 0;
      overflow: hidden;

      .executeIcon {
        opacity: 0;
        pointer-events: none;
      }
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
      pointer-events: all;

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

      .el-input-group__prepend {
        display: block;
      }
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
    display: flex;
    flex-direction: column;

    .el-input-group__prepend {
      display: none;
    }

    .el-input__wrapper {
      padding: 0;
    }

    .el-textarea__inner {
      width: 100%;
      height: 100%;
      opacity: 1;
      min-width: unset !important;
      min-height: unset !important;
      padding: 0;
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

    .functionName {
      height: 32px;
      --el-border-radius-base: 0;
      --el-input-border: unset;
    }

    .functionContent {
      height: calc(100% - 32px);
      --el-border-radius-base: 0;
      --el-input-border: unset;
    }
  }

  .functionOnFocus .el-textarea__inner {
    padding: 4px 6px;
  }

}
</style>