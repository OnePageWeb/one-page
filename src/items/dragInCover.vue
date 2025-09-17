<script setup>
import {defineEmits, onMounted, onUnmounted, ref, toRefs} from "vue"
import {UploadFilled} from "@element-plus/icons-vue"
import {ElIcon, ElMessage} from "element-plus"
import {useI18n} from "vue-i18n"
import {warning} from "@/js/message.js"
const {t} = useI18n()

const emit = defineEmits(['onDragIn'])

const props = defineProps({
  active: Boolean
})
const {active} = toRefs(props)

const dragInCoverRef = ref(null)
const onDragOver = (e) => {
  dragInCoverRef.value.classList.add('active')
}

const onDragLeave = () => {
  dragInCoverRef.value.classList.remove('active')
}

const onDrop = (e) => {
  e.preventDefault()
  dragInCoverRef.value.classList.remove('active')
  const file = e.dataTransfer.files[0]
  if (file && file.type === 'application/json') {
    const reader = new FileReader()
    reader.readAsText(file, 'utf-8')
    reader.onload = () => {
      const value = JSON.parse(reader.result)
      emit('onDragIn', value)
    }
  } else {
    const data = e.dataTransfer.getData('text/plain')
    if (data) {
      let transferData
      try {
        transferData = JSON.parse(data)
      } catch (e) {
        warning(t('error.loadFormat'))
      }
      if (transferData) {
        emit('onDragIn', transferData)
      }
    }
  }
}
</script>

<template>
  <div
      v-if="active"
      class="dragInCover"
      ref="dragInCoverRef"
      @drop.prevent="onDrop"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
  >
    <div class="text-center">
      <el-icon><UploadFilled /></el-icon>
      <p>{{ t('text.uploadTip') }}</p>
    </div>
  </div>
</template>

<style>
.dragInCover {
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  position: fixed;
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  .text-center {
    font-size: 2vw;
    color: var(--primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    .el-icon, svg {
      width: 4vw;
      height: 4vw;
    }
  }
}

.dragInCover.active {
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0% {
    box-shadow: inset 0 0 100px 100px rgba(0, 0, 0, 0.1);
  }
  50% {
    box-shadow: inset 0 0 100px 100px rgba(0, 0, 0, 0.3);
  }
  100% {
    box-shadow: inset 0 0 100px 100px rgba(0, 0, 0, 0.1);
  }
}
</style>