<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from "vue"
import {deleteWorkspace, getNowWorkspace, listWorkspace, setWorkspace} from "@/js/workspcae.js"
import {
  ElButton,
  ElDialog,
  ElInput,
  ElTag,
  ElPopconfirm,
  ElMessage,
  ElPopover,
  ElIcon,
  ElMessageBox,
} from "element-plus"
import {Check, InfoFilled} from "@element-plus/icons-vue"
import {reloadWithoutParams} from "@/js/url.js"
import {useI18n} from "vue-i18n"
import {TEMP_WORKSPACE, DEFAULT_WORKSPACE} from "@/js/workspcae.js"
import commonDialog from "@/items/commonDialog.vue"
import {warning, success} from "@/js/message.js"

const {t} = useI18n()

const dialogVisible = ref(false)
defineExpose({
  open() {
    // 加载工作区
    nowWorkspace.value = getNowWorkspace()
    dialogVisible.value = true
  }
})

// 工作区列表
const nowWorkspace = ref('')
const workspaceList = ref([])
// 创建时加载工作区
onMounted(() => {
  workspaceList.value.push(...listWorkspace())
  if (getNowWorkspace() === TEMP_WORKSPACE) {
    warning(t('workspace.temp.warning'))
  }
})

// 工作区设定
const newWorkspaceName = ref('')
const deleteConfirm = ref(false)

function newWorkspace(workspace: string) {
  // 特殊处理
  if (workspace.toLowerCase() === TEMP_WORKSPACE) {
    ElMessageBox.confirm(
        t('workspace.temp.desc'),
        t('workspace.temp.title'),
        {
          distinguishCancelAndClose: true,
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
        }
    ).then(() => {
      switchWorkspace(workspace.toLowerCase())
    })
  } else {
    // 普通工作区
    switchWorkspace(workspace)
  }
}

function switchWorkspace(workspace: string) {
  if (!workspace || workspace.trim() === '') {
    warning(t('error.workspaceEmpty'))
    return
  }
  if (nowWorkspace.value === workspace) {
    success(t('workspace.alreadyInThis'))
    return
  }
  // 切换工作区
  setWorkspace(workspace)
  // 刷新页面
  reloadWithoutParams('workspace')
}

// 删除工作区
const deleteWorkspaceName = ref('')

function showDeleteConfirm(tag: string) {
  if (tag === DEFAULT_WORKSPACE) {
    warning(t('workspace.delete.cannotDelete'))
    return
  }
  deleteWorkspaceName.value = tag
  deleteConfirm.value = true
}

function deleteItem(workspace: string) {
  deleteWorkspace(workspace)
  if (nowWorkspace.value === workspace) {
    // 刷新页面
    reloadWithoutParams('workspace')
  } else {
    workspaceList.value.length = 0
    workspaceList.value.push(...listWorkspace())
    deleteConfirm.value = false
  }
}
</script>

<template>
  <!-- 组件样式弹窗 -->
  <common-dialog
      :visible="dialogVisible"
      width="30%"
      class="workspaceDialog"
      @closed="dialogVisible = false"
  >
    <template #title>
      <div style="display: flex;align-items: center;color: white;">
        <span style="font-size: 18px;font-weight: bolder">{{ t('workspace.title') }} - {{ nowWorkspace }}</span>
        <el-popover
            class="box-item"
            :title="`${t('workspace.current')}：${nowWorkspace}`"
            width="350"
            :content="t('text.workspaceDesc')"
            placement="top-start"
        >
          <template #reference>
            <el-icon style="margin-left: 8px;cursor: pointer;">
              <InfoFilled/>
            </el-icon>
          </template>
        </el-popover>
      </div>
    </template>
    <div>
      <!-- 工作区列表 -->
      <el-popconfirm
          class="box-item"
          v-for="tag in workspaceList"
          :title="nowWorkspace === tag ? t('workspace.alreadyInThis') : (t('workspace.switch') + ' ' + tag)"
          placement="top-start"
          width="300px"
          @confirm="switchWorkspace(tag)"
          :confirm-button-text="t('common.switch')"
          :cancel-button-text="t('common.cancel')"
      >
        <template #reference>
          <el-tag
              class="workspaceTag"
              :key="tag"
              :type="nowWorkspace === tag ? 'primary' : 'info'"
              closable
              @close="showDeleteConfirm(tag)"
          >
            {{ tag }}
          </el-tag>
        </template>
        <template v-if="nowWorkspace === tag" #actions>
          <el-icon>
            <Check/>
          </el-icon>
        </template>
      </el-popconfirm>
    </div>
    <template #footer>
      <el-input
          v-model="newWorkspaceName"
          class="workspaceName"
          :placeholder="t('placeholder.newWorkspaceName')"
          @keydown.ctrl.enter="newWorkspace(newWorkspaceName)"
      />
      <el-button type="primary" @click="newWorkspace(newWorkspaceName)">{{ t('common.add') }}</el-button>
    </template>

    <common-dialog
        :title="t('workspace.delete.title')"
        :visible="deleteConfirm"
        width="400px"
        class="deleteWorkspaceConfirm"
        @closed="deleteConfirm = false"
    >
      <div style="display: flex;justify-content: center;align-items: center;">
        <div>
          {{ t('workspace.delete.content') }} <span style="color: white;font-size: 24px;font-weight: bolder">{{
            deleteWorkspaceName
          }}</span> ？
          <div>
            {{ t('workspace.delete.tip') }}
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="danger" @click="deleteItem(deleteWorkspaceName)">{{ t('common.confirm') }}</el-button>
        <el-button type="primary" @click="deleteConfirm = false">{{ t('common.cancel') }}</el-button>
      </template>
    </common-dialog>
  </common-dialog>

</template>

<style>
.workspaceDialog {
  height: 300px !important;

  .workspaceTag {
    margin: 10px;
    font-size: large;
    padding: 8px 16px;
    cursor: pointer;
    height: unset;
    border-radius: 24px;
    border-width: 2px;
    --el-tag-border-color: #d6d6d6;

    &:hover {
      scale: 1.1;
    }

    &.el-tag--primary {
      --el-tag-bg-color: #434343;
      --el-tag-text-color: white;
      box-shadow: 0 0 10px 0 rgb(255 255 255 / 50%);
    }
  }

  .workspaceName {
    height: 100%;

    .el-input {
      width: calc(100% - 70px);
      margin-right: 10px;
    }
  }
}

.deleteWorkspaceConfirm {
  height: 200px !important;
}
</style>