<script setup>
import {onMounted, ref} from "vue"
import {deleteWorkspace, getNowWorkspace, listWorkspace, setWorkspace} from "@/js/workspcae.js"
import {ElButton, ElDialog, ElInput, ElTag, ElPopconfirm, ElMessage, ElPopover, ElIcon} from "element-plus"
import {InfoFilled} from "@element-plus/icons-vue"
import {reloadWithoutParams} from "@/js/url.js"
import {useI18n} from "vue-i18n"
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
})

// 工作区设定
const newWorkspaceName = ref('')
const deleteConfirm = ref(false)

function switchWorkspace(workspace) {
  if (!workspace || workspace.trim() === '') {
    ElMessage({
      message: t('error.workspaceEmpty'),
      type: 'warning'
    })
    return
  }
  if (nowWorkspace.value === workspace) {
    ElMessage({
      message: t('workspace.alreadyInThis'),
      type: 'success'
    })
    return
  }
  // 切换工作区
  setWorkspace(workspace)
  // 刷新页面
  reloadWithoutParams('workspace')
}

// 删除工作区
const deleteWorkspaceName = ref('')
function showDeleteConfirm(tag) {
  deleteWorkspaceName.value = tag
  deleteConfirm.value = true
}

function deleteItem(workspace) {
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
  <el-dialog
    v-model="dialogVisible"
    width="50%"
    class="workspaceDialog commonDialog"
    align-center
  >
    <template #header>
      <div style="display: flex;align-items: center;color: white;">
        <span style="font-size: 18px;font-weight: bolder">{{ t('workspace.title') }}</span>
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
            :type="nowWorkspace === tag ? 'primary' : 'success'"
            closable
            @close="showDeleteConfirm(tag)"
          >
            {{ tag }}
          </el-tag>
        </template>
      </el-popconfirm>
    </div>
    <template #footer>
      <div>
        <el-input
          v-model="newWorkspaceName"
          class="workspaceName"
          :placeholder="t('placeholder.newWorkspaceName')"
          @keydown.ctrl.enter="switchWorkspace(newWorkspaceName)"
        />
        <el-button type="primary" @click="switchWorkspace(newWorkspaceName)">{{ t('common.add') }}</el-button>
      </div>
    </template>

    <el-dialog
      :title="t('workspace.delete.title')"
      v-model="deleteConfirm"
      width="400px"
      class="deleteConfirm commonDialog"
      align-center
    >
      <div style="display: flex;justify-content: center;align-items: center;">
        <div>
          {{t('workspace.delete.content')}} <span style="font-size: 24px;font-weight: bolder">{{ deleteWorkspaceName }}</span> ？
          <div>
            {{t('workspace.delete.tip')}}
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="deleteItem(deleteWorkspaceName)">{{ t('common.confirm') }}</el-button>
        <el-button type="primary" @click="deleteConfirm = false">{{ t('common.cancel') }}</el-button>
      </template>
    </el-dialog>
  </el-dialog>

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
  }

  .el-input {
    width: calc(100% - 70px);
    margin-right: 10px;
  }

  .deleteConfirm {
    height: 200px !important;
  }
}
</style>