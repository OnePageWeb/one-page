<script setup>
import { ref } from 'vue'
import {ElTooltip} from "element-plus"
import {useI18n} from "vue-i18n"
const {t} = useI18n()

const props = defineProps({
  text: {
    type: String,
    default: ''
  }
})

const text = ref(props.text)

</script>

<template>
  <div class="h5tagContainer">
    <span>{{text}}</span>
    <el-tooltip
      class="box-item"
      effect="light"
      :content="t('text.h5Support')"
      placement="top-start"
      :show-after="800"
      :hide-after="10"
    >
      <div class="h5tag">h5</div>
    </el-tooltip>
  </div>
</template>

<style scoped>
.h5tagContainer {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.h5tag {
  font-size: 10px;
  top: 0;
  right: 0;
  color: #a8ff6c;
  height: 32px;
  line-height: 12px;
  user-select: none;
}
</style>