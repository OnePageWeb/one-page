<script setup>
import CommonDialog from "@/items/commonDialog.vue"
import {reactive, ref} from "vue"
import {useI18n} from 'vue-i18n'
import {loadData, saveData} from "@/js/data.js"
import {
  ElButton,
  ElDivider,
  ElDropdown,
  ElDropdownItem,
  ElDropdownMenu,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElMessageBox,
  ElRadioButton,
  ElRadioGroup,
  ElTooltip,
} from "element-plus"
import {reload} from "@/js/url.js"

const {t} = useI18n()

const visible = ref(false)
const widthUnit = ref('px')
const heightUnit = ref('px')

const unitOptions = [
  {
    value: 'px',
    label: 'px',
    desc: '像素'
  },
  {
    value: 'em',
    label: 'em',
    desc: 'em是相对单位，1em等于当前元素的字体大小'
  },
  {
    value: 'rem',
    label: 'rem',
    desc: 'rem是相对单位，1rem等于根元素的字体大小'
  },
  {
    value: 'vw',
    label: 'vw',
    desc: 'vw是相对单位，1vw等于当前窗口宽度的1%'
  },
  {
    value: 'vh',
    label: 'vh',
    desc: 'vh是相对单位，1vh等于当前窗口高度的1%'
  },
  {
    value: 'vmin',
    label: 'vmin',
    desc: 'vmin是相对单位，1vmin等于当前窗口宽度和高度中较小的那个'
  },
  {
    value: 'vmax',
    label: 'vmax',
    desc: 'vmax是相对单位，1vmax等于当前窗口宽度和高度中较大的那个'
  }
]

const form = reactive({
  columns: 48,
  widthMode: 'auto',
  widthParam: 100,
  heightMode: 'window',
  heightParam: 100
})

const open = () => {
  visible.value = true
  initForm()
}

const initForm = () => {
  const cellW = loadData('cellW')
  const wSplit = cellW.split(':', 2)
  form.columns = Number(wSplit[0])
  if (wSplit.length === 1) {
    form.widthMode = 'auto'
    form.widthParam = Math.floor(window.innerWidth / form.columns)
  } else if (wSplit[1].endsWith("%")) {
    form.widthParam = Number(wSplit[1].substring(0, wSplit[1].length - 1))
    form.widthMode = 'percent'
    widthUnit.value = '%'
  } else {
    const i = indexOfLastNum(wSplit[1])
    form.widthParam = Number(wSplit[1].substring(0, i + 1))
    form.widthMode = 'static'
    widthUnit.value = wSplit[1].substring(i + 1)
  }
  const cellH = loadData('cellH')
  const hSplit = cellH.split('%', 2)
  form.heightParam = Number(hSplit[0])
  if (hSplit.length === 1) {
    form.heightMode = 'static'
    const i = indexOfLastNum(hSplit[0])
    form.heightParam = Number(hSplit[0].substring(0, i + 1))
    heightUnit.value = hSplit[0].substring(i + 1)
  } else if (hSplit[1].length > 0) {
    form.heightMode = 'cellWidth'
    heightUnit.value = '%'
  } else {
    form.heightMode = 'window'
    heightUnit.value = '%'
  }
}

const onWidthModeChanged = (value) => {
  if (value === 'auto') {
    form.widthParam = Math.floor(window.innerWidth / form.columns)
    widthUnit.value = 'px'
  } else if (value === 'percent') {
    widthUnit.value = '%'
  } else {
    widthUnit.value = 'px'
  }
}

const onHeightModeChanged = (value) => {
  if (value === 'cellWidth') {
    form.heightParam = 100
    heightUnit.value = '%'
  } else if (value === 'window') {
    heightUnit.value = '%'
  } else {
    heightUnit.value = 'px'
  }
}

const onColumnsChanged = (value) => {
  if (form.widthMode === 'auto') {
    form.widthParam = Math.floor(window.innerWidth / value)
  }
}

// 判断数字位数
const indexOfLastNum = (value) => {
  for (let i = 0, max = value.length; i < max; i++) {
    if (isNaN(Number(value[i]))) {
      return i - 1
    }
  }
  return value.length - 1
}

const calcCellSize = () => {
  // 获取宽高
  /*
   支持的宽度数据有：
   - 纯数字（48）表示基于当前窗口大小，均分48块
   - 纯数字+百分比（48:10%）表示单个格子有当前窗口宽度的10%，并排列48个格子
   - 纯数字+宽度值（48:100px）表示单个格子的宽度是100px，排列48个格子
   */
  const cellW = loadData('cellW') || '48'
  const wSplit = cellW.split(':', 2)
  const columns = Number(wSplit[0])
  let cellWNum
  let cellWUnit
  let totalWidth
  let cellWMode = 'auto'
  if (wSplit.length > 1) {
    // 自定义宽度
    const widthParam = wSplit[1]
    if (widthParam.endsWith('%')) {
      // 格子百分比宽度
      // 获取浏览器窗口宽度
      const windowWidth = window.innerWidth
      // 按照窗口宽度计算格子宽度
      cellWNum = Math.floor(windowWidth * Number(widthParam.substring(0, widthParam.length - 1)) / 100)
      cellWUnit = 'px'
      cellWMode = 'percent'
    } else {
      // 指定宽度固定值
      const lastNum = indexOfLastNum(widthParam)
      cellWNum = Number(widthParam.substring(0, lastNum + 1))
      cellWUnit = widthParam.substring(lastNum + 1) || 'px'
      cellWMode = 'static'
    }
  } else {
    // 获取浏览器窗口宽度
    const windowWidth = window.innerWidth
    // 按照窗口宽度计算格子宽度
    cellWNum = Math.floor(windowWidth / columns)
    cellWUnit = 'px'
  }
  // 按照格子数量变更宽度
  totalWidth = columns * cellWNum + cellWUnit
  /*
   支持的高度数据有：
   - 百分比（20%）表示基于当前窗口高度，每个格子高度占整体高度的20%
   - 百分比c（100%c）表示基于格子宽度，高度是宽度的100%
   - 高度值（100px）表示格子高度指定100px
   */
  let cellH = loadData('cellH') || '50%c'
  const hSplit = cellH.split('%', 2)
  const cellHNum = Number(hSplit[0])
  let cellHMode
  if (hSplit.length > 1) {
    // 百分比
    if (hSplit[1].length > 0) {
      // 基于宽度的百分比
      cellH = Math.floor(cellWNum * cellHNum / 100) + 'px'
      cellHMode = 'cellWidth'
    } else {
      // 基于窗口的百分比
      const windowHeight = window.innerHeight
      cellH = Math.floor(windowHeight * cellHNum / 100) + 'px'
      cellHMode = 'window'
    }
  } else {
    cellHMode = 'static'
  }

  return {cellH, cellHNum, cellHMode, cellW, columns, cellWNum, cellWMode, totalWidth}
}

const save = () => {
  // 宽度
  let cellW = form.columns
  if (form.widthMode !== 'auto') {
    cellW += ':' + form.widthParam + widthUnit.value
  }
  saveData('cellW', cellW)
  // 高度
  let cellH = form.heightParam + heightUnit.value
  if (form.heightMode === 'cellWidth') {
    cellH += 'c'
  }
  saveData('cellH', cellH)

  ElMessageBox.confirm(
      t('config.gridstack.reload.desc'),
      t('config.gridstack.reload.title'),
      {
        distinguishCancelAndClose: true,
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
      }
  ).then(() => {
    reload()
  })
}

defineExpose({
  open,
  calcCellSize
})
</script>

<template>
  <common-dialog
      :title="t('config.gridstack.title')"
      :visible="visible"
      width="40%"
      class="gridStackConfig"
      @closed="visible = false"
  >
    <el-form :model="form" label-width="auto" class="configForm">
      <div class="formTitle">{{ t('config.gridstack.width') }}</div>
      <el-form-item :label="t('config.gridstack.columns')" prop="columns">
        <el-input-number v-model="form.columns" @change="onColumnsChanged"/>
      </el-form-item>
      <el-form-item :label="t('config.gridstack.widthMode.name')" prop="widthMode">
        <el-radio-group v-model="form.widthMode" @change="onWidthModeChanged">
          <el-tooltip :content="t('config.gridstack.widthMode.autoDesc')" placement="top" :hide-after="10" :enterable="false">
            <el-radio-button :label="t('config.gridstack.widthMode.auto')" value="auto"/>
          </el-tooltip>
          <el-tooltip :content="t('config.gridstack.widthMode.percentageDesc')" placement="top" :hide-after="10" :enterable="false">
            <el-radio-button :label="t('config.gridstack.widthMode.percentage')" value="percent"/>
          </el-tooltip>
          <el-tooltip :content="t('config.gridstack.widthMode.staticDesc')" placement="top" :hide-after="10" :enterable="false">
            <el-radio-button :label="t('config.gridstack.widthMode.static')" value="static"/>
          </el-tooltip>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="t('config.gridstack.widthParam')" prop="widthParam">
        <el-input-number v-if="form.widthMode === 'auto'" v-model="form.widthParam" disabled>
          <template #suffix>
            <span>px</span>
          </template>
        </el-input-number>
        <el-input-number v-if="form.widthMode === 'percent'" v-model="form.widthParam">
          <template #suffix>
            <span>%</span>
          </template>
        </el-input-number>
        <el-input-number v-if="form.widthMode === 'static'" v-model="form.widthParam">
          <template #suffix>
            <el-dropdown placement="bottom" class="unitSelect">
              <span style="width: 100%;cursor: pointer;">{{ widthUnit }}</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                      v-for="item in unitOptions"
                      :key="item.value"
                      @click="widthUnit = item.value">
                    {{ item.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-input-number>
      </el-form-item>
      <!-- 分割线 -->
      <el-divider/>
      <div class="formTitle">{{ t('config.gridstack.height') }}</div>
      <el-form-item :label="t('config.gridstack.heightMode.name')" prop="heightMode">
        <el-radio-group v-model="form.heightMode" @change="onHeightModeChanged">
          <el-tooltip :content="t('config.gridstack.heightMode.windowDesc')" placement="top" :hide-after="10" :enterable="false">
            <el-radio-button :label="t('config.gridstack.heightMode.window')" value="window"/>
          </el-tooltip>
          <el-tooltip :content="t('config.gridstack.heightMode.cellWidthDesc')" placement="top" :hide-after="10" :enterable="false">
            <el-radio-button :label="t('config.gridstack.heightMode.cellWidth')" value="cellWidth"/>
          </el-tooltip>
          <el-tooltip :content="t('config.gridstack.heightMode.staticDesc')" placement="top" :hide-after="10" :enterable="false">
            <el-radio-button :label="t('config.gridstack.heightMode.static')" value="static"/>
          </el-tooltip>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="t('config.gridstack.heightParam')" prop="heightParam">
        <el-input-number v-if="form.heightMode === 'window' || form.heightMode === 'cellWidth'" v-model="form.heightParam">
          <template #suffix>
            <span>%</span>
          </template>
        </el-input-number>
        <el-input-number v-if="form.heightMode === 'static'" v-model="form.heightParam">
          <template #suffix>
            <el-dropdown placement="bottom" class="unitSelect">
              <span style="width: 100%;cursor: pointer;">{{ heightUnit }}</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                      v-for="item in unitOptions"
                      :key="item.value"
                      @click="heightUnit = item.value">
                    {{ item.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-input-number>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="save">{{ t('common.save') }}</el-button>
    </template>
  </common-dialog>
</template>

<style>
.gridStackConfig {
  height: 50% !important;

  .configForm {
    .formTitle {
      font-size: 24px;
    }

    .el-form-item__label {
      height: 100% !important;
      border-radius: 4px;
      margin-right: 8px;
      display: flex;
      align-items: center;
    }

    .el-form-item__content {
      &:first-child {
        border-radius: 0 8px 8px 0;
      }
    }

    & > * {
      width: calc(100% - 16px);
    }

    .unitSelect {
      width: 40px;
      height: 100%;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      display: flex;
      align-items: center;
    }

    .el-input__wrapper {
      height: 32px;
    }

    .el-input-number {
      width: 240px;
    }
  }

}
</style>