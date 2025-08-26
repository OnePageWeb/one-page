<script setup>
import {onMounted, ref} from "vue"
import {deleteWorkspace, getNowWorkspace, listWorkspace, setWorkspace} from "@/js/workspcae.js"
import {ElButton, ElDialog, ElInput, ElTag, ElPopconfirm, ElMessage} from "element-plus"

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
      message: '工作区名称不能为空',
      type: 'warning'
    })
    return
  }
  if (nowWorkspace.value === workspace) {
    ElMessage({
      message: '已处于当前工作区',
      type: 'success'
    })
    return
  }
  if (workspaceList.value.includes(workspace)) {
    ElMessage({
      message: '工作区已存在',
      type: 'warning'
    })
    return
  }
  // 切换工作区
  setWorkspace(workspace)
  // 刷新页面
  window.location.reload()
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
    window.location.reload()
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
    title="工作区设定"
    v-model="dialogVisible"
    width="50%"
    class="workspaceDialog commonDialog"
    align-center
  >
    <div>
      <!-- 工作区列表 -->
      <el-popconfirm
        class="box-item"
        v-for="tag in workspaceList"
        :title="nowWorkspace === tag ? '当前工作区' : `切换工作区到 ${tag}`"
        placement="top-start"
        width="300px"
        @confirm="switchWorkspace(tag)"
        confirm-button-text="切换"
        cancel-button-text="取消"
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
          placeholder="请输入新工作区名称"
          @keydown.ctrl.enter="switchWorkspace(newWorkspaceName)"
        />
        <el-button type="primary" @click="switchWorkspace(newWorkspaceName)">添加</el-button>
      </div>
    </template>

    <el-dialog
      title="删除选中工作区"
      v-model="deleteConfirm"
      width="400px"
      class="deleteConfirm commonDialog"
      align-center
    >
      <div style="display: flex;justify-content: center;align-items: center;">
        <div>
          是否删除工作区 <span style="font-size: 24px;font-weight: bolder">{{ deleteWorkspaceName }}</span> ？
          <div>
            此工作区下的所有数据将被删除，不可恢复！
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="deleteItem(deleteWorkspaceName)">确定</el-button>
        <el-button type="primary" @click="deleteConfirm = false">取消</el-button>
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