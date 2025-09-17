<script setup>
import {ElIcon, ElInput, ElPopover, ElText} from "element-plus"
import {nextTick, onMounted, onUnmounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {Finished, SwitchButton, VideoPlay, Edit, View} from "@element-plus/icons-vue"
import InputWithParams from "@/items/inputWithParams.vue"
import {useI18n} from "vue-i18n"
import ComponentOperator from "@/items/componentOperator.vue"
const {t} = useI18n()

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {id, text, enableEdit} = toRefs(props)
const emit = defineEmits(['focus'])

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

const inputWithParamsRef = ref(null)

function onInputUpdate(value) {
  functionContent.value = value
  save()
}

function save() {
  saveData(props.id, JSON.stringify({
    content: inputWithParamsRef.value.save(),
    result: functionResult.value,
    autoExecute: autoExecute.value
  }))
}

const switchAutoExecute = () => {
  autoExecute.value = !autoExecute.value
  save()
}

const edit = () => {
  isEditing.value = true
  emit('focus', id)
}

async function execute() {
  isEditing.value = false
  function executeCode() {
    const fn = new Function("setResult", functionContent.value)
    return fn((res) => {
      nextTick(() => {
        functionResult.value = res
      })
    })
  }

  try {
    functionResult.value = executeCode()
  } catch (e) {
    console.warn(e)
    functionResult.value = t('common.error') + ': ' + e
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
      inputWithParamsRef.value.load(parse.content)
      if (autoExecute.value) {
        execute()
      }
    })
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
  <div class="functionContent" ref="functionRef" @dblclick="dbclick">
    <div class="textContainer">
      <el-text :class="['result', isEditing ? 'resultOnFocus' : '']" v-html="functionResult"/>
      <input-with-params
          ref="inputWithParamsRef"
          :class="['input', isEditing ? 'inputOnFocus' : '']"
          :initText="functionContent"
          :placeholder="t('placeholder.functionContentInput')"
          @update="onInputUpdate"
      />
    </div>
    <component-operator :visible="enableEdit">
      <el-popover
          class="box-item"
          :title="autoExecute ? t('component.function.autoExecute') : t('component.function.clickExecute')"
          :content="t('component.function.autoExecuteDesc')"
          placement="bottom-end"
          width="200"
          :show-after="200"
          :hide-after="10"
      >
        <template #reference>
          <el-icon :class="['paramItem', {'positive': !autoExecute}]" @click="switchAutoExecute">
            <Finished/>
          </el-icon>
        </template>
      </el-popover>
      <el-popover
          class="box-item"
          :title="t('common.execute')"
          :content="t('component.function.executeDesc')"
          placement="bottom-end"
          width="200"
          :show-after="200"
          :hide-after="10"
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
          :title="t('common.edit')"
          :content="t('placeholder.functionContentEdit')"
          placement="bottom-end"
          width="200"
          :show-after="200"
          :hide-after="10"
      >
        <template #reference>
          <el-icon class="paramItem edit" @click="edit">
            <Edit/>
          </el-icon>
        </template>
      </el-popover>
      <el-popover
          v-else
          class="box-item"
          :title="t('common.view')"
          :content="t('component.function.functionContentView')"
          placement="bottom-end"
          width="200"
          :show-after="200"
          :hide-after="10"
      >
        <template #reference>
          <el-icon class="paramItem edit" @click="isEditing = false">
            <View/>
          </el-icon>
        </template>
      </el-popover>
    </component-operator>
  </div>
</template>

<style>
.functionContent {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

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

    .resultOnFocus {
      width: 0;
      display: none;
      opacity: 0;
    }

    .inputWithParams.input {
      width: 0;
      height: 100%;
      opacity: 0;
    }

    .inputWithParams.inputOnFocus {
      width: 100%;
      height: 100%;
      opacity: 1;
    }
  }

  .el-text {
    width: 100%;
    height: 100%;
  }

  .result {
    cursor: pointer;
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

  .inputOnFocus :deep(.el-textarea__inner) {
    padding: 8px !important;
  }

  .resultOnFocus {
    cursor: default;
  }

}
</style>