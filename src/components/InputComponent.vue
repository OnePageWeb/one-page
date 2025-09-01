<script setup>
import {ElIcon, ElInput, ElMessage, ElPopover, ElText, ElTooltip} from "element-plus"
import {onMounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {CloseBold, CopyDocument, Edit, SortDown, View} from "@element-plus/icons-vue"
import ComponentOperator from "@/items/componentOperator.vue"

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {id, text, enableEdit} = toRefs(props)

const nameText = ref('')
// 方法内容
const functionText = ref(text.value || `'input : ' + input`)
const inputText = ref('')
// 方法结果
const functionResult = ref('')
const isEditing = ref(false)

watch(enableEdit, (newValue) => {
  if (!newValue) {
    isEditing.value = false
  }
})

const inputContentRef = ref(null)

function save() {
  saveData(props.id, JSON.stringify({
    name: nameText.value,
    content: functionText.value,
  }))
}

async function execute() {
  function executeCode() {
    const input = inputText.value
    const setResult = (result) => {
      functionResult.value = result
    }
    // input当成入参
    // 方法内容中使用input变量
    return eval(`(function (input, setResult) {
      ${functionText.value}
    })(input, setResult)`)
  }

  try {
    functionResult.value = executeCode()
  } catch (e) {
    console.log(e)
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
    nameText.value = parse.name
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
        ref="inputContentRef"
    >
      <div class="ioContainer">
        <el-input
            v-model="inputText"
            ref="input"
            type="textarea"
            :placeholder="nameText || '输入参数，按下ctrl + enter即可执行方法'"
            :class="['input', isEditing ? 'inputOnFocus' : '']"
            @keydown.ctrl.enter="execute"
        />
        <el-text :class="['result', isEditing ? 'resultOnFocus' : '']" v-html="functionResult"/>

        <el-popover
            class="box-item"
            title="执行"
            content="执行方法，在下方得到结果"
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
            title="复制"
            content="复制方法结果到剪切板"
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
            title="清除结果"
            content="清除方法执行结果"
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
            placeholder="方法名称"
            @change="save"
        >
          <template #prepend>方法名称</template>
        </el-input>
        <el-input
            v-model="functionText"
            class="functionContent"
            :rows="2"
            type="textarea"
            placeholder="输入方法内容，可以使用input变量来获取输入值，setResult(String)方法来设置结果"
            @change="save"
        />
      </div>
    </div>

    <component-operator :visible="enableEdit">
      <el-tooltip
          v-if="isEditing"
          effect="light"
          content="关闭编辑"
          placement="top"
      >
        <el-icon @click="isEditing = false">
          <View/>
        </el-icon>
      </el-tooltip>
      <el-tooltip
          v-else
          effect="light"
          content="开启编辑"
          placement="top"
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

      .el-input-group__prepend {
        display: block;
      }

      .el-input__wrapper {
        padding: 1px 11px;
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