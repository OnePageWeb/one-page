<script setup>
import {ElIcon, ElInput, ElTooltip} from "element-plus"
import {nextTick, onMounted, ref, toRefs, watch} from "vue"
import {loadData, saveData} from "@/js/data.js"
import {Edit, View} from "@element-plus/icons-vue"
import ComponentOperator from "@/items/componentOperator.vue"
import InputWithParams from "@/items/inputWithParams.vue"
import H5tag from "@/items/h5tag.vue"
import {useI18n} from "vue-i18n"
const {t} = useI18n()

const props = defineProps({
  id: String,
  text: String,
  enableEdit: Object
})
const {id, text, enableEdit} = toRefs(props)

const nameText = ref(t('common.pressed'))
// 方法内容
const functionText = ref(text.value || `alert('Hello World!')`)
const isEditing = ref(false)
watch(enableEdit, (newValue) => {
  if (!newValue) {
    isEditing.value = false
  }
})

const inputWithParamsRef = ref(null)

function onInputUpdate(value) {
  functionText.value = value
  save()
}

function save() {
  saveData(props.id, JSON.stringify({
    name: nameText.value,
    content: inputWithParamsRef.value.save(),
  }))
}

async function execute() {
  eval(functionText.value)
}

onMounted(() => {
  load()
})

function load(data) {
  const save = data || loadData(props.id)
  if (save) {
    const parse = JSON.parse(save)
    nameText.value = parse.name
    nextTick(() => {
      inputWithParamsRef.value.load(parse.content)
    })
  }
}

defineExpose({
  save, load
})
</script>

<template>
  <div class="buttonContent">
    <div class="textContainer">
      <div class="buttonContainer">
        <div class="button" @click="execute" v-html="nameText"/>
      </div>

      <div
          :class="['function', isEditing ? 'functionOnFocus' : '']">
        <!-- 编辑框 -->
        <el-input
            v-model="nameText"
            class="functionName"
            :placeholder="t('placeholder.buttonNameInput')"
            @change="save"
        >
          <template #prepend>
            <h5tag :text="t('component.button.name')" />
          </template>
        </el-input>
        <input-with-params
            ref="inputWithParamsRef"
            class="inputWithParams"
            @update="onInputUpdate"/>
      </div>
    </div>

    <component-operator :visible="enableEdit">
      <el-tooltip
          v-if="isEditing"
          effect="light"
          :content="t('common.closeEdit')"
          placement="top"
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
      >
        <el-icon @click="isEditing = true">
          <Edit/>
        </el-icon>
      </el-tooltip>
    </component-operator>
  </div>
</template>

<style>
.buttonContent {
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

    .buttonContainer {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      width: 100%;

      .button {
        padding: 6px 12px;
        border-radius: 8px;
        background-color: #3f94ed;
        color: white;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .functionOnFocus {
      width: 60%;
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

  .el-text {
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

    .functionName {
      height: 32px;
      --el-border-radius-base: 0;
      --el-input-border: unset;

      .el-input-group__prepend {
        padding: 0 8px;
        background-color: var(--el-color-primary);
        color: white;
        border: none;
        box-shadow: unset;
      }

      .el-input__wrapper {
        box-shadow: unset;
        background-color: #353535;

        .el-input__inner {
          color: white;
        }
      }
    }

    .inputWithParams {
      height: calc(100% - 32px);
    }
  }

  .functionOnFocus .el-textarea__inner {
    padding: 4px 6px;
  }

}
</style>