<template>
  <div style="height: 100%; width: 100%">
    <div
        :class="['menu', showMenu ? 'menu-show' : 'menu-hide']"
        @mouseleave="showMenu = false"
    >
      <el-text class="menuTitle" truncated>新增格子</el-text>
      <el-button @click="readyComponent.open()" class="btn" type="primary" :icon="CirclePlus" plain>添加格子</el-button>
      <el-select class="addItemSelect" placeholder="添加自定义格子" @change="addItemWithEdit">
        <el-popover
            class="box-item"
            v-for="item in itemType"
            :title="item.label"
            :content="item.desc"
            width="300"
            placement="right-start"
        >
          <template #reference>
            <div>
              <el-option
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              >
                <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                     width="20" height="20">
                  <path :d="item.svgPath" fill="#5C5C66"></path>
                </svg>
                {{ item.label }}
              </el-option>
            </div>
          </template>
        </el-popover>
      </el-select>
      <el-text class="menuTitle" truncated>布局编辑</el-text>
      <el-checkbox v-model="enableMove" label="开启移动" border/>
      <el-checkbox v-model="enableEdit" label="开启编辑" border/>
      <el-text class="menuTitle" truncated>样式</el-text>
      <el-button @click="editGlobalStyle" class="btn" :icon="Picture" plain>全局样式</el-button>
      <el-text class="menuTitle" truncated>配置切换</el-text>
      <el-button @click="openLoadConfig" class="btn" :icon="Edit" plain>加载配置</el-button>
      <el-button @click="openWorkspaceHolder" class="btn" :icon="Monitor" plain>工作区设定</el-button>
    </div>
    <crosshair-background v-if="enableMove"></crosshair-background>
    <div style="height: 100%;width: 100%;overflow-y: auto;scrollbar-width: none">
      <div ref="gridEl" class="grid-stack"></div>
    </div>

    <!-- 全局样式弹窗 -->
    <el-dialog
        title="全局样式"
        v-model="isEditGlobalStyle"
        width="50%"
        class="globeStyleDialog commonDialog"
        align-center
    >
      <el-input
          v-model="globalStyle"
          class="globeStyleInput"
          type="textarea"
          resize="none"
          placeholder="请输入全局样式"
      />
      <template #footer>
        <el-button type="primary" @click="refreshGlobalStyle">保存并刷新</el-button>
      </template>
    </el-dialog>

    <!-- 配置加载弹窗 -->
    <el-dialog
        title="加载配置"
        v-model="configLoaderVisible"
        width="50%"
        class="globeStyleDialog commonDialog"
        align-center
    >
      <template #header="{ close, titleId, titleClass }">
        <div class="configLoaderHeader">
          <div :id="titleId" :class="titleClass">加载配置</div>
          <el-icon style="margin-left: 8px;cursor: pointer;" @click="configLoaderTipVisible = true">
            <InfoFilled/>
          </el-icon>
        </div>
      </template>
      <el-input
          v-model="configData"
          class="globeStyleInput"
          type="textarea"
          resize="none"
          placeholder="请输入配置URL或拖拽JSON文件到此处"
          @dragover.prevent
          @drop.prevent="handleFileDrop"
      />

      <!-- 配置提示弹窗 -->
      <el-dialog class="commonDialog" v-model="configLoaderTipVisible" title="Tips" width="50%" align-center>
        <div>
          <div style="font-size:large;font-weight: bold;margin-bottom: 4px">
            可以将配置内容粘贴到输入框内，也可以拖拽JSON文件到输入框中。
          </div>
          <div style="font-size:large;font-weight: bold;margin-bottom: 4px">同样支持使用配置下载地址填写于此处自动获取。
          </div>
          <div style="margin-bottom: 4px">注意：由于跨域限制，当配置地址无法使用时，页面或尝试使用<a
              href="https://corsproxy.io">corsproxy.io</a>的代理方式获取。
          </div>
          <div style="margin-bottom: 4px">推荐自建代理服务器。</div>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="configLoaderTipVisible = false">关闭</el-button>
          </div>
        </template>
      </el-dialog>
      <template #footer>
        <el-button type="primary" @click="downloadConfig">下载</el-button>
        <el-popconfirm
            title="确定加载以上配置，这会覆盖本地的所有配置？"
            placement="top-start"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="loadConfig()"
        >
          <template #reference>
            <el-button type="primary">加载</el-button>
          </template>
        </el-popconfirm>
        <el-popconfirm
            title="确定清空并重新加载页面？"
            placement="top-start"
            confirm-button-text="确定"
            cancel-button-text="取消"
            @confirm="clearConfig(true)"
        >
          <template #reference>
            <el-button type="danger">清空</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-dialog>

    <!-- 组件样式弹窗 -->
    <el-dialog
        title="组件样式"
        v-model="isEditComponentStyle"
        width="50%"
        class="globeStyleDialog commonDialog"
        align-center
    >
      <el-input
          v-model="componentStyle"
          class="globeStyleInput"
          type="textarea"
          resize="none"
          placeholder="请输入样式"
      />
      <template #footer>
        <el-button type="primary" @click="refreshComponentStyle(curComponentId)">刷新</el-button>
      </template>
    </el-dialog>

    <el-dialog
        v-model="zoomInDialogVisible"
        class="zoomInDialog"
        width="95%"
        align-center
        :show-close="false"
        @close="onZoomInClose"
    >
      <div id="zoomInElement" class="zoomInElement"></div>
    </el-dialog>

    <readyComponent
        ref="readyComponent"
        @addComponent="addComponent"
    />

    <edge-mouse-move
        @onLeftEdge="() => showMenu = !showMenu && !viewMode"
    />

    <workspaceHolder
        ref="workspaceHolder"
    />
  </div>
</template>

<script setup>
import {createApp, defineComponent, h, nextTick, onMounted, onUnmounted, ref, watch} from 'vue'
import {GridStack} from 'gridstack'
import {
  ElButton,
  ElCheckbox,
  ElDialog,
  ElIcon,
  ElInput, ElLoading,
  ElMessage,
  ElOption,
  ElPopconfirm,
  ElPopover,
  ElSelect, ElText
} from 'element-plus'
import 'gridstack/dist/gridstack.min.css'
import operateButtons from './items/operateButtons.vue'
import textComponent from './components/TextComponent.vue'
import noteComponent from "./components/NoteComponent.vue"
import searchComponent from './components/SearchComponent.vue'
import iframeComponent from './components/IframeComponent.vue'
import htmlComponent from "./components/HtmlComponent.vue"
import linkComponent from './components/LinkComponent.vue'
import functionComponent from './components/FunctionComponent.vue'
import evalComponent from "./components/EvalComponent.vue"
import inputComponent from "@/components/InputComponent.vue"
import ReadyComponent from "@/items/readyComponent.vue"
import {v4} from 'uuid'
import {startsWith} from "@/js/string.js"
import {fetchWithBase, parseBlobJson, reloadWithoutParams} from "@/js/url.js"
import {CirclePlus, Edit, InfoFilled, Monitor, Picture} from "@element-plus/icons-vue"
import edgeMouseMove from './items/edgeMouseMove.vue'
import WorkspaceHolder from "@/items/workspaceHolder.vue"
import {
  exportData,
  loadData,
  removeData,
  saveData,
} from "@/js/data.js"
import {initWorkspace, setWorkspace} from "@/js/workspcae.js"
import CrosshairBackground from "@/items/crosshairBackground.vue"

const itemType = [
  {
    value: 'text',
    label: '文本格子',
    desc: '用于显示文本内容的格子，允许html标签',
    svgPath: 'M842.666667 981.333333H181.333333a53.393333 53.393333 0 0 1-53.333333-53.333333V96a53.393333 53.393333 0 0 1 53.333333-53.333333h466.746667a52.986667 52.986667 0 0 1 37.713333 15.62l194.586667 194.586666a52.986667 52.986667 0 0 1 15.62 37.713334V928a53.393333 53.393333 0 0 1-53.333333 53.333333zM181.333333 85.333333a10.666667 10.666667 0 0 0-10.666666 10.666667v832a10.666667 10.666667 0 0 0 10.666666 10.666667h661.333334a10.666667 10.666667 0 0 0 10.666666-10.666667V298.666667h-160a53.393333 53.393333 0 0 1-53.333333-53.333334V85.333333z m501.333334 30.166667V245.333333a10.666667 10.666667 0 0 0 10.666666 10.666667h129.833334z m21.333333 652.5H320a21.333333 21.333333 0 0 1 0-42.666667h384a21.333333 21.333333 0 0 1 0 42.666667z m0-213.333333H320a21.333333 21.333333 0 0 1 0-42.666667h384a21.333333 21.333333 0 0 1 0 42.666667zM490.666667 298.666667H320a21.333333 21.333333 0 0 1 0-42.666667h170.666667a21.333333 21.333333 0 0 1 0 42.666667z',
    component: textComponent
  },
  {
    value: 'note',
    label: '便签格子',
    desc: '用于显示Markdown内容的格子',
    svgPath: 'M825.65 146.34c64.288 0 110.35 70.671 110.35 153.37v507.92l-0.014 2.478C935.076 891.736 889.296 961 825.65 961H154.351l-1.924-0.021C89.145 959.585 44 889.503 44 807.63V299.71l0.014-2.477c0.91-81.628 46.69-150.892 110.337-150.892 16.505 0 29.886 13.394 29.886 29.917 0 16.522-13.38 29.916-29.886 29.916l-0.739 0.012c-24.368 0.787-49.839 40.398-49.839 93.524v507.92l0.008 1.606c0.512 52.85 26.226 91.93 50.57 91.93h671.298l0.739-0.012c24.368-0.787 49.839-40.397 49.839-93.524V299.71l-0.008-1.605c-0.512-52.851-26.226-91.93-50.57-91.93l-0.705-0.009c-16.18-0.375-29.181-13.622-29.181-29.908 0-16.523 13.38-29.917 29.886-29.917zM754.38 638.819c16.506 0 29.887 13.395 29.887 29.917 0 16.287-13.001 29.534-29.181 29.909l-0.706 0.008H225.62c-16.506 0-29.887-13.394-29.887-29.917 0-16.286 13.001-29.533 29.181-29.908l0.706-0.009H754.38z m0-231.28c16.506 0 29.887 13.394 29.887 29.917 0 16.286-13.001 29.533-29.181 29.909l-0.706 0.008H225.62c-16.506 0-29.887-13.395-29.887-29.917 0-16.287 13.001-29.534 29.181-29.909l0.706-0.008H754.38zM281.387 75c16.27-0.089 29.575 12.852 30.04 29.046l0.011 0.706 0.783 141.806c0.09 16.523-13.216 29.99-29.721 30.083-16.27 0.09-29.575-12.852-30.04-29.046l-0.012-0.706-0.783-141.806c-0.09-16.523 13.216-29.99 29.722-30.083z m400.02 0c16.27-0.089 29.576 12.852 30.04 29.046l0.012 0.706 0.783 141.806c0.09 16.523-13.216 29.99-29.722 30.083-16.27 0.09-29.575-12.852-30.039-29.046l-0.012-0.706-0.783-141.806c-0.09-16.523 13.216-29.99 29.722-30.083z m-78 71.34c16.505 0 29.886 13.395 29.886 29.918 0 16.286-13.001 29.533-29.181 29.908l-0.706 0.008H377.351c-16.506 0-29.887-13.394-29.887-29.916 0-16.287 13.001-29.534 29.181-29.91l0.706-0.007h226.055z',
    component: noteComponent
  },
  {
    value: 'search',
    label: '搜索栏',
    desc: '搜索引擎输入框，用于搜索指定内容',
    svgPath: 'M446.112323 177.545051c137.567677 0.219798 252.612525 104.59798 266.162424 241.493333 13.562828 136.895354-78.778182 261.818182-213.617777 289.008485-134.852525 27.203232-268.386263-52.156768-308.945455-183.608889s25.018182-272.252121 151.738182-325.779394A267.235556 267.235556 0 0 1 446.112323 177.545051m0-62.060607c-182.794343 0-330.989899 148.195556-330.989899 330.989899s148.195556 330.989899 330.989899 330.989899 330.989899-148.195556 330.989899-330.989899-148.195556-330.989899-330.989899-330.989899z m431.321212 793.341415a30.849293 30.849293 0 0 1-21.94101-9.102223l-157.220202-157.220202c-11.752727-12.179394-11.584646-31.534545 0.37495-43.50707 11.972525-11.972525 31.327677-12.140606 43.494141-0.37495l157.220202 157.220202a31.036768 31.036768 0 0 1 6.723232 33.810101 31.004444 31.004444 0 0 1-28.651313 19.174142z m0 0',
    component: searchComponent
  },
  {
    value: 'iframe',
    label: '网址格子',
    desc: '用于嵌入网页地址的格子，不支持跨域',
    svgPath: 'M511.968 128c-211.744 0-384 172.288-384 384s172.256 384 384 384C723.744 896 896 723.744 896 512S723.744 128 511.968 128z m101.312 718.368c7.104-7.392 14.112-15.936 21.472-25.984l1.888-2.624c14.144-19.872 26.624-42.464 38.08-69.152l4.544-11.68 5.056 2.464c21.472 10.432 41.536 23.36 59.616 38.368l4.768 3.968-4.736 4.032a355.04 355.04 0 0 1-125.344 69.184l-19.232 5.984 13.888-14.56z m80.448-316.544c-1.504 59.616-10.656 118.144-26.432 169.28l-1.6 5.28-5.216-1.984c-40.192-14.88-84.288-23.36-131.008-25.152l-5.056-0.192v-152.608h169.408l-0.096 5.376z m-36.064 197.856l-1.952 4.96c-30.72 78.112-75.136 126.624-125.024 136.544l-6.272 1.216v-168.48l5.44 0.256c43.904 1.792 85.216 9.728 122.784 23.68l5.024 1.824z m86.24-481.472a299.648 299.648 0 0 1-59.488 38.368l-6.08 0.672-2.016-5.632-2.592-6.592a362.944 362.944 0 0 0-37.152-66.88l-1.888-2.592a245.12 245.12 0 0 0-21.44-25.92l-13.888-14.624 19.2 5.984a355.392 355.392 0 0 1 125.344 69.216l4.736 4-4.736 4zM660.48 321.6l5.216-1.952 1.6 5.28c15.776 51.136 24.928 109.696 26.432 169.28l0.128 5.376h-169.408v-152.608l5.056-0.192c46.72-1.824 90.784-10.304 130.976-25.184z m-136.032 0.48V153.568l6.272 1.216c49.888 9.92 94.272 58.464 125.024 136.576l1.952 4.96-4.992 1.824c-37.536 13.92-78.848 21.888-122.784 23.712l-5.472 0.224z m242.016 442.848l-3.744-3.168a321.856 321.856 0 0 0-70.784-45.952l-4.256-2.016 3.008-8.608c8.576-27.296 15.296-56.032 19.936-85.408l1.6-11.648c1.632-11.68 2.976-23.488 3.968-35.04l1.088-13.312c0.512-7.2 0.704-14.688 0.896-21.888l0.384-13.44h152l-0.256 5.504a358.976 358.976 0 0 1-100.512 231.488l-3.328 3.488z m-50.24-313.984c-0.992-11.552-2.336-23.36-3.968-35.04l-1.6-11.616a591.36 591.36 0 0 0-20.192-86.144l-2.784-7.904 4.256-2.016a323.36 323.36 0 0 0 70.784-45.92l3.744-3.2 3.392 3.52a358.816 358.816 0 0 1 100.512 231.456l0.256 5.504h-152l-0.384-13.408a555.936 555.936 0 0 0-0.896-21.888l-1.12-13.344z m-305.504-273.28a251.008 251.008 0 0 0-21.44 25.952l-1.92 2.624a362.24 362.24 0 0 0-37.088 66.816l-5.504 14.048-5.088-2.464a296.832 296.832 0 0 1-59.584-38.4l-4.736-4 4.736-4a354.56 354.56 0 0 1 125.344-69.216l19.2-5.984-13.92 14.624z m-80.448 316.512c1.472-59.488 10.624-118.016 26.432-169.28l1.6-5.28 5.216 1.952c40.192 14.88 84.288 23.36 131.008 25.152l5.024 0.192v152.608h-169.376l0.096-5.344z m36.064-197.824l1.952-4.96c30.752-78.112 75.136-126.656 125.024-136.576l6.24-1.216v168.512l-5.44-0.224c-43.904-1.824-85.216-9.76-122.784-23.712l-4.992-1.824zM280.128 777.792a298.368 298.368 0 0 1 59.488-38.304l6.784 2.048 3.904 9.472c10.56 24.608 23.072 47.104 37.088 66.848l1.888 2.592c2.144 2.976 4.416 5.184 6.592 7.968 2.944 3.744 5.856 7.264 8.8 10.624 2.016 2.336 4.032 5.184 6.048 7.328l13.952 14.56-19.264-5.952a355.776 355.776 0 0 1-125.344-69.184l-4.736-4.032 4.8-3.968z m83.392-75.392l-5.216 1.984-1.6-5.28c-15.808-51.232-24.928-109.792-26.432-169.28l-0.128-5.376h169.376v152.608l-5.024 0.192c-46.72 1.792-90.784 10.24-130.976 25.152z m136.032-0.48V870.4l-6.24-1.216c-49.888-9.92-94.304-58.432-125.024-136.544l-1.952-4.96 4.992-1.856c37.6-13.92 78.912-21.888 122.784-23.68l5.44-0.224z m-187.776-286.016c-1.632 11.488-2.944 23.232-4.128 36.928l-0.928 11.392c-0.512 7.712-0.736 15.52-0.96 24.192l-0.32 11.104H153.408l0.256-5.504a358.592 358.592 0 0 1 100.48-231.456l3.392-3.52 3.744 3.2a322.72 322.72 0 0 0 70.688 45.888l2.88 6.144-1.504 4.544a589.952 589.952 0 0 0-19.968 85.472l-1.6 11.616z m0 192.192l1.6 11.616c4.704 29.76 11.456 58.528 19.968 85.44l2.88 8.672-4.16 1.952c-25.728 12.32-49.536 27.808-70.784 45.952l-3.744 3.168-3.392-3.52a358.816 358.816 0 0 1-100.48-231.488l-0.256-5.504h152.032l0.32 11.104c0.192 8.64 0.448 16.448 0.96 24.192l1.12 13.312c0.992 12.096 2.336 23.904 3.936 35.104z',
    component: iframeComponent
  },
  {
    value: 'html',
    label: '网页格子',
    desc: '用于嵌入网页代码的格子',
    svgPath: 'M160.042667 917.333333a53.376 53.376 0 0 1-53.333334-53.248v-704a53.376 53.376 0 0 1 53.333334-53.333333h704a53.376 53.376 0 0 1 53.248 53.333333v704a53.333333 53.333333 0 0 1-53.248 53.248z m10.581333-64h682.666667V170.666667h-682.666667z m384-63.402666a32 32 0 1 1 0-64h170.666667v-171.178667a32 32 0 1 1 64 0v181.077333a53.973333 53.973333 0 0 1-54.016 54.016z m-320-320.426667v-181.333333a53.973333 53.973333 0 0 1 54.016-54.016h180.565333a32 32 0 1 1 0 64h-170.666666v171.52a32 32 0 1 1-64 0z',
    component: htmlComponent
  },
  {
    value: 'link',
    label: '快速链接',
    desc: '用于快速跳转的格子，支持自定义链接',
    svgPath: 'M675.328 117.717333a21.333333 21.333333 0 0 1-16.341333 39.402667A382.762667 382.762667 0 0 0 512 128C299.925333 128 128 299.925333 128 512s171.925333 384 384 384 384-171.925333 384-384c0-51.114667-9.984-100.8-29.12-146.986667a21.333333 21.333333 0 0 1 39.402667-16.341333A425.429333 425.429333 0 0 1 938.666667 512c0 235.648-191.018667 426.666667-426.666667 426.666667S85.333333 747.648 85.333333 512 276.352 85.333333 512 85.333333c56.746667 0 112 11.093333 163.328 32.384z m-170.88 281.152a21.290667 21.290667 0 0 1 0.042667-30.208l82.986666-82.986666a63.850667 63.850667 0 0 1 90.432 0.021333l60.373334 60.394667a63.914667 63.914667 0 0 1 0.064 90.410666l-150.997334 150.997334a63.829333 63.829333 0 0 1-90.410666-0.042667l-30.229334-30.229333a21.269333 21.269333 0 0 1 0-30.165334 21.290667 21.290667 0 0 1 30.186667 0l30.208 30.229334a21.162667 21.162667 0 0 0 30.08 0.042666l150.997333-150.997333a21.248 21.248 0 0 0-0.042666-30.08l-60.394667-60.373333a21.184 21.184 0 0 0-30.101333-0.021334l-82.986667 82.986667a21.333333 21.333333 0 0 1-30.208 0z m15.104 226.261334a21.290667 21.290667 0 0 1-0.042667 30.208l-82.986666 82.986666a63.850667 63.850667 0 0 1-90.432-0.021333l-60.373334-60.394667a63.914667 63.914667 0 0 1-0.064-90.410666l150.997334-150.997334a63.829333 63.829333 0 0 1 90.410666 0.042667l30.229334 30.229333a21.269333 21.269333 0 0 1 0 30.165334 21.290667 21.290667 0 0 1-30.186667 0l-30.208-30.229334a21.162667 21.162667 0 0 0-30.08-0.042666l-150.997333 150.997333a21.248 21.248 0 0 0 0.042666 30.08l60.394667 60.373333a21.184 21.184 0 0 0 30.101333 0.021334l82.986667-82.986667a21.333333 21.333333 0 0 1 30.208 0z',
    component: linkComponent
  },
  {
    value: 'input',
    label: '输入转换',
    desc: '用于计算输入的转换格子，自定义处理函数，并得到结果',
    svgPath: 'M717.822935 178.434674L556.709162 18.535823a63.536967 63.536967 0 0 0-89.579314 0l-161.114773 159.899851a37.49562 37.49562 0 0 0 0 53.298616 38.071583 38.071583 0 0 0 53.746589 0l114.277746-113.317807v626.799213c0 20.538696 16.956924 37.17564 37.879595 37.17564 20.923672 0 37.879596-16.636944 37.879596-37.111644V118.352487l114.340742 113.253811a38.071583 38.071583 0 0 0 53.747588 0 37.49562 37.49562 0 0 0 0-53.23562zM511.920005 1023.935004c-187.540096-2.36785-359.149202-104.040396-448.791512-265.794128a501.324178 501.324178 0 0 1 16.443956-514.441345 38.327567 38.327567 0 0 1 52.46667-11.581265c17.660879 11.325281 22.779554 34.551807 11.518268 52.019698-115.812649 179.28662-80.301903 414.752673 83.372708 553.471867a442.137935 442.137935 0 0 0 569.723836 0c163.67461-138.719195 199.12236-374.185248 83.372708-553.471867a37.559616 37.559616 0 0 1 11.773253-52.019698 38.391563 38.391563 0 0 1 52.467669 11.581265 504.842954 504.842954 0 0 1 79.533952 272.192722c1.151927 278.976292-227.787541 506.250865-511.881508 508.106747z',
    component: inputComponent
  },
  {
    value: 'function',
    label: '计算函数',
    desc: '用于执行计算函数的格子，可以在格子中输出计算结果。使用模式下双击格子即可运行',
    svgPath: 'M360.448 456.704h161.792c12.288 0 20.48 8.192 20.48 20.48s-8.192 20.48-20.48 20.48h-167.936l-77.824 438.272c-2.048 10.24-12.288 18.432-24.576 16.384-10.24-2.048-18.432-12.288-16.384-24.576l75.776-430.08h-116.736c-12.288 0-20.48-8.192-20.48-20.48s8.192-20.48 20.48-20.48h124.928l34.816-196.608c4.096-22.528 14.336-53.248 34.816-83.968 18.432-26.624 43.008-49.152 71.68-63.488 36.864-18.432 77.824-26.624 118.784-28.672 12.288 0 20.48 8.192 20.48 20.48s-8.192 20.48-20.48 20.48c-34.816 0-67.584 8.192-100.352 22.528-22.528 12.288-43.008 28.672-57.344 51.2-10.24 14.336-18.432 30.72-22.528 47.104-4.096 10.24-4.096 16.384-6.144 20.48l-32.768 190.464z m344.064 251.904l116.736-137.216c8.192-8.192 20.48-10.24 28.672-2.048s10.24 20.48 2.048 28.672l-120.832 143.36 120.832 143.36c8.192 8.192 6.144 22.528-2.048 28.672-8.192 8.192-22.528 6.144-28.672-2.048l-116.736-137.216-116.736 137.216c-8.192 8.192-20.48 10.24-28.672 2.048-8.192-8.192-10.24-20.48-2.048-28.672l120.832-143.36-120.832-143.36c-8.192-8.192-6.144-22.528 2.048-28.672 8.192-8.192 22.528-6.144 28.672 2.048l116.736 137.216z',
    component: functionComponent
  }
]
// 菜单是否显示
let showMenu = ref(false)

// 格子高度
let itemHeight = 25
// 总列数
const columns = 48
// GridStack实例
let grid
// 锁定状态
const enableEdit = ref(false)
const enableMove = ref(false)
const ctrl = ref(false)
watch(enableMove, b => {
  if (b) {
    enabledMove()
  } else {
    disabledMove()
  }
})

function keyListener(event) {
  if (event.key === 'Alt') {
    ctrl.value = event.type === 'keydown'
    if (ctrl.value) {
      enabledMove()
      enabledEdit()
    } else {
      disabledMove()
      disabledEdit()
    }
    event.preventDefault()
  }
}

// 全局样式
const globalStyle = ref('')
// 仅查看模式
const viewMode = ref(false)

// 获取窗口高度
let windowHeight = window.innerHeight

// 初始化GridStack
onMounted(async () => {
  windowHeight = window.innerHeight
  // 初始化工作区
  initWorkspace()

  // 按照窗口宽度计算格子高度
  itemHeight = Math.floor(windowHeight / columns) * 2

  // 初始化GridStack
  grid = GridStack.init({
    // 每个格子的高度（px）
    cellHeight: itemHeight,
    // 格子间距
    margin: 0,
    // 允许格子自由浮动
    float: true,
    // 最小行数
    minRow: 2,
    // 始终显示调整手柄
    alwaysShowResizeHandle: false,
    // 4列
    column: columns,
  })

  // 从地址栏尝试获取config参数
  const urlParams = new URLSearchParams(window.location.search)
  // 设定打开的工作区
  const workspace = urlParams.get('workspace')
  if (workspace) {
    setWorkspace(workspace)
  }
  // 初始化配置
  const configUrl = urlParams.get('config')
  if (configUrl) {
    ElMessage.info('正在加载配置...')
    configData.value = configUrl
    if (await loadConfig(false)) {
      reloadWithoutParams('config')
    }
  }
  // 是否开启函数格子
  const enableFunction = urlParams.get('enableFunction')
  if (enableFunction) {
    itemType.push({
      value: 'eval',
      label: '危险函数',
      desc: '用于执行自定义函数的格子，支持自定义函数。使用模式下双击格子即可运行',
      svgPath: 'M512 992C246.912 992 32 777.088 32 512 32 246.912 246.912 32 512 32c265.088 0 480 214.912 480 480 0 265.088-214.912 480-480 480zM480 256v352a32 32 0 0 0 64 0V256a32 32 0 0 0-64 0z m-16 528a48 48 0 1 0 96 0 48 48 0 0 0-96 0z',
      component: evalComponent
    })
  }

  // 恢复布局
  const layout = loadData('layout')
  if (layout) {
    const parse = JSON.parse(layout)
    for (let el of parse) {
      const componentId = el.id;
      // 添加格子
      addItem(el.type, el.x, el.y, el.w, el.h, componentId)

      // 恢复组件样式
      const componentStyle = loadData(componentId + '-style')
      if (componentStyle) {
        loadComponentStyle(componentId, componentStyle)
      }
    }
  } else {
    configData.value = await loadJsonData()
    await loadConfig(true)
  }

  // 恢复样式
  const style = loadData('globalStyle')
  if (style !== null) {
    globalStyle.value = style
  }
  refreshGlobalStyle()

  disabledEdit()
  disabledMove()

  // 监听拖拽和调整大小事件
  grid.on('dragstop resizestop', (event, el) => {
    saveLayout()
  })

  // 监听按键
  window.addEventListener('keydown', keyListener)
  window.addEventListener('keyup', keyListener)
})

// 注销按键监听
onUnmounted(() => {
  window.removeEventListener('keydown', keyListener)
  window.removeEventListener('keyup', keyListener)
})

const loadJsonData = async () => {
  try {
    // 使用绝对路径指向 public 文件夹
    return await fetchWithBase('/first-config.json')
  } catch (err) {
    console.error('加载JSON失败:', err)
  }
}

const elementMap = {}

// 保存布局
function saveLayout() {
  const nodes = grid.engine.nodes; // 获取所有格子节点数据
  const simplifiedLayout = nodes.map(node => ({
    type: node.el?.type,
    id: node.el?.id,
    x: node.x,
    y: node.y,
    w: node.w,
    h: node.h,
  }))
  // 保存布局数据
  saveData('layout', JSON.stringify(simplifiedLayout))
}

// 锁定布局
function enabledEdit() {
  enableEdit.value = true
}

// 开启移动
function enabledMove() {
  grid.enableMove(true)
  grid.enableResize(true)
  enableMove.value = true
}

// 解锁布局
function disabledEdit() {
  enableEdit.value = false
}

// 关闭移动
function disabledMove() {
  grid.enableMove(false)
  grid.enableResize(false)
  enableMove.value = false
}

// 添加空白格子
function createItemComponent(type, componentItem) {
  return {
    props: ['id', 'enableEdit', 'enableMove', 'ctrl'],
    setup(props, {expose}) {
      const componentItemRef = ref(null)
      // 暴露方法给父组件
      expose({
        load(data) {
          componentItemRef.value.load(data)
        },
        save() {
          componentItemRef.value.save()
        },
      })
      return () => h('div', {
        id: props.id + '-container',
        style: {
          height: '100%',
          width: '100%',
          position: 'relative'
        },
      }, [
        h(operateButtons, {
          style: {position: 'absolute',},
          id: props.id,
          type: type,
          enableEdit: enableEdit,
          enableMove: enableMove,
          ctrl: props.ctrl,
          onOnDelete: deleteItem,
          onOnStyleEdit: editStyle,
          onZoomIn: zoomIn,
          onExportComponent: exportComponent,
          onCopy: copy,
        }),
        h(componentItem, {
          ref: componentItemRef,
          style: {position: 'absolute'},
          id: props.id,
          enableEdit: props.enableEdit,
          enableMove: props.enableMove
        }),
      ])
    }
  }
}

const addItemWithEdit = (type) => {
  const id = addItem(type)
  enabledEdit()
  enabledMove()
  return id
}

const addItem = (type, x, y, w = '4', h = '4', id) => {
  // 创建格子DOM
  const itemEl = document.createElement('div')
  itemEl.className = 'grid-stack-item'
  itemEl.type = type // 自定义类型
  itemEl.id = id || v4().replace('-', '')
  itemEl.setAttribute('gs-w', w)
  itemEl.setAttribute('gs-h', h)
  if (x) itemEl.setAttribute('gs-x', x)
  if (y) itemEl.setAttribute('gs-y', y)
  // 挂载Vue组件到格子
  const component = itemType.find(item => item.value === type)?.component
  if (!component) {
    ElMessage.error(`未找到对应的组件 - ${type}`)
    return
  }
  const app = createApp(createItemComponent(type, component), {
    id: itemEl.id,
    enableEdit: enableEdit,
    enableMove: enableMove,
    ctrl: ctrl
  })
  elementMap[itemEl.id] = app.mount(itemEl)

  itemEl.element = app
  // 添加到GridStack
  grid.makeWidget(itemEl)

  // 保存布局
  saveLayout()
  return itemEl.id
}

function addComponent(data) {
  const id = addItemWithEdit(data.type, data.x, data.y, data.w, data.h, data.id)
  if (id) {
    // 加载组件数据
    const element = elementMap[id]
    if (element) {
      if (data.config) {
        element.load(data.config)
        element.save()
      }
      if (data.style) {
        // 加载组件样式
        loadComponentStyle(id, data.style)
        // 保存组件样式
        saveData(id + '-style', data.style)
      }
    } else {
      ElMessage.error(`未找到对应的组件 - ${data.type}`)
    }
  }
}

// 删除格子
function deleteItem(id) {
  nextTick(() => {
    grid.removeWidget(document.getElementById(id.value))
    // 删除本地存储
    removeData(id.value)
    // 保存布局
    saveLayout()
  })
}

// 编辑组件样式
let curComponentId = ref('')
let isEditComponentStyle = ref(false)
let componentStyle = ref('')

function editStyle(id) {
  curComponentId.value = id.value
  // 获取组件样式
  componentStyle.value = loadData(id.value + '-style')
  isEditComponentStyle.value = true
}

function loadStyle(id, styleContent) {
  // 先删除旧的样式
  const oldStyle = document.getElementById(id)
  if (oldStyle) {
    document.head.removeChild(oldStyle)
  }
  const style = document.createElement('style')
  style.id = id
  style.innerHTML = styleContent
  document.head.appendChild(style)
}

function loadComponentStyle(id, styleContent) {
  // 先删除旧的样式
  const oldStyle = document.getElementById(id + '-style')
  if (oldStyle) {
    document.head.removeChild(oldStyle)
  }
  if (!styleContent || styleContent.trim().length === 0) {
    return
  }
  const style = document.createElement('style')
  style.id = id + '-style'
  style.innerHTML = `[id='${id}'] {
    ${styleContent}
  }`
  document.head.appendChild(style)
}

function refreshComponentStyle(id) {
  const idValue = id.value || curComponentId.value
  loadComponentStyle(idValue, componentStyle.value)
  // 保存组件样式
  saveData(idValue + '-style', componentStyle.value)
  isEditComponentStyle.value = false
}

// 放大组件
let zoomInId = null
let zoomApp = null
const zoomInDialogVisible = ref(false)

function createZoomIn(id, componentItem) {
  return defineComponent({
    props: ['enableEdit', 'enableMove'], // 移除id prop
    setup(props) {
      return () => h(componentItem, {
        ref: 'componentItem',
        style: {position: 'absolute'},
        id: id.value + '-container', // 直接使用id.value
        enableEdit: props.enableEdit,
        enableMove: props.enableMove,
      })
    }
  })
}

function zoomIn(id, type) {
  const find = itemType.find(item => item.value === type.value)
  if (!find) {
    ElMessage.error('未找到对应的组件')
    return
  }
  zoomInId = id.value
  // find.component是组件的vue对象
  zoomInDialogVisible.value = true
  nextTick(() => {
    const elementById = document.getElementById('zoomInElement')
    if (elementById) {
      elementById.innerHTML = ''
      if (zoomApp) {
        zoomApp.unmount()
      }
      zoomApp = createApp(createZoomIn(id.value, find.component), {
        id: id.value,
        enableEdit: enableEdit,
        enableMove: enableMove
      })
      zoomApp.mount(elementById)
      if (elementById.firstElementChild) {
        elementById.firstElementChild.id = id.value
      }
    }
  })
}

function onZoomInClose() {
  if (zoomApp) {
    zoomApp.unmount()
    zoomApp = null
  }
}

// 当窗口关闭时，尝试刷新数据
watch(zoomInDialogVisible, v => {
  if (!v && enableEdit) {
    const element = elementMap[zoomInId]
    if (element) {
      element.load()
    }
  }
})

// 复制
function copy(id, type) {
  const componentData = exportComponentData(id, type)
  addComponent(componentData)
}

function exportComponentData(id, type) {
  const idValue = id.value
  const componentData = {}
  // 组件配置
  const componentConfig = loadData(idValue)
  if (componentConfig) {
    componentData.config = componentConfig
  }
  // 组件样式
  const componentStyle = loadData(idValue + '-style')
  if (componentStyle) {
    componentData.style = componentStyle
  }
  componentData.type = type.value
  return componentData
}

// 导出组件
function exportComponent(id, type) {
  const componentData = exportComponentData(id, type)
  exportData(componentData, id.value + '.json')
}

const readyComponent = ref(null)

// 编辑全局样式
let isEditGlobalStyle = ref(false)

function editGlobalStyle() {
  isEditGlobalStyle.value = true
}

function refreshGlobalStyle() {
  loadStyle('globalStyle', globalStyle.value)
  // 保存全局样式
  saveData('globalStyle', globalStyle.value)
  isEditGlobalStyle.value = false
}

let configData = ref('')
let configLoaderVisible = ref(false)
let configLoaderTipVisible = ref(false)

// 打开加载配置弹窗
function openLoadConfig() {
  const config = generateConfig()
  configData.value = JSON.stringify(config)
  configLoaderVisible.value = true
}

// 生成配置对象
function generateConfig() {
  // 汇总所有配置为一个json
  let config = {
    globalStyle: globalStyle.value,
    layout: JSON.parse(loadData('layout')),
    components: []
  }
  // 所有组件
  const nodes = grid.engine.nodes; // 获取所有格子节点数据
  const ids = nodes.map(node => node.el.id)
  for (let id of ids) {
    // 组件样式
    const componentStyle = loadData(id + '-style')
    // 组件数据
    const componentData = loadData(id)
    // 组件类型
    const componentType = document.getElementById(id).type
    config.components.push({
      id: id,
      style: componentStyle,
      data: componentData,
      type: componentType
    })
  }
  return config
}

// 清除旧配置
function clearConfig(reload = false) {
  const nodes = grid.engine.nodes; // 获取所有格子节点数据
  const ids = nodes.map(node => node.el.id)
  for (let id of ids) {
    // 删除组件数据
    removeData(id)
    // 删除组件样式
    removeData(id + '-style')
  }
  removeData('layout')
  removeData('globalStyle')
  // 刷新页面
  if (reload) {
    window.location.reload()
  }
}

// 加载配置
async function loadConfig(reload = true) {
  if (!configData.value) {
    ElMessage.error('无配置内容')
    return
  }
  // 解析json
  let config = configData.value
  configData.value = ''
  if (typeof config === 'string') {
    const loading = ElLoading.service({
      lock: true,
      text: 'Loading...',
      background: 'rgba(0, 0, 0, 0.7)',
    })
    try {
      if (startsWith(config, 'http')) {
        // 从网络加载
        config = await parseBlobJson(config)
      } else {
        config = JSON.parse(config)
      }
    } catch (error) {
      ElMessage.error('配置文件无法加载', error)
      return
    } finally {
      setTimeout(() => {
        loading.close()
      }, 500)
    }
  }
  if (!config || typeof config !== 'object') {
    ElMessage.error('配置文件格式错误')
    return
  }
  // 校验配置
  if (!config.globalStyle || !config.layout || !config.components) {
    ElMessage.error('配置文件格式错误')
    return
  }
  // 清除旧配置
  clearConfig()
  // 加载全局样式
  saveData('globalStyle', config.globalStyle)
  // 加载布局
  saveData('layout', JSON.stringify(config.layout))
  // 加载组件
  for (let component of config.components) {
    if (component.data) {
      saveData(component.id, component.data)
    }
    // 加载组件样式
    if (component.style) {
      saveData(component.id + '-style', component.style)
    }
  }
  // 刷新页面
  if (reload) {
    window.location.reload()
  }
  return true
}

// 下载配置
function downloadConfig() {
  exportData(generateConfig(), 'config.json')
}

// 处理文件拖拽
function handleFileDrop(e) {
  e.preventDefault()
  const file = e.dataTransfer.files[0]
  if (file.type !== 'application/json') {
    ElMessage.error('请上传JSON文件')
    return
  }
  const reader = new FileReader()
  reader.readAsText(file, 'utf-8')
  reader.onload = () => {
    configData.value = reader.result
  }
}

// 打开工作区弹窗
const workspaceHolder = ref(null)

function openWorkspaceHolder() {
  workspaceHolder.value.open()
}
</script>

<style>
html {
  scrollbar-width: none;
}

body {
  background-color: #343434;
}

* {
  transition: all 0.3s ease-in-out;
}

/* 菜单样式开始 */
.menu {
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100% - 20px);
  display: flex;
  align-items: center;
  overflow: auto;
  scrollbar-width: none;
  gap: 10px;
  padding: 0 10px;
  z-index: 1;
  background-color: rgba(138, 138, 138, 0.5);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);

  .el-button + .el-button {
    margin-left: 0;
  }

  .menuTitle {
    color: #ececec;
    height: 30px;
    line-height: 30px;
    margin-left: 36px;
    border-right: 4px solid orange;
    padding: 0 7px 3px 0;
    min-width: 30px;
  }
}

.el-select-dropdown__item {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}

.menu-show {
  height: 80px;
  opacity: 1;
}

.menu-hide {
  height: 0;
  opacity: 0;
  border-bottom: unset;

  * {
    margin-top: -80px;
  }
}

/* 菜单样式结束 */

/* 开关样式开始 */
.el-checkbox {
  background-color: white;
  margin-right: unset !important;
  --el-checkbox-checked-text-color: #ff7d00 !important;
  --el-checkbox-checked-bg-color: #ff7d00 !important;

  .el-checkbox__inner {
    border: 1px dashed #ff7d00 !important;
  }
}

/* 开关样式结束 */

/* 选择器样式 */
.el-select.addItemSelect {
  width: 160px;
}

/* 栅格容器样式 */
.grid-stack {
  min-height: 300px;
  height: 100% !important;
  overflow-x: hidden;
  scrollbar-width: none;
}

.grid-stack-item.ui-resizable-autohide {
}

/* 格子样式 */
.grid-stack-item {
  padding: 10px;
  margin: 1px;
}

textarea {
  resize: none !important;
}

.btn {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* 删除图标样式开始 */
.deleteIcon {
  cursor: pointer;
  pointer-events: auto;
  height: 20px !important;
  width: 20px !important;
  border-radius: 20px;
  padding: 8px !important;
  margin: 8px 8px 8px 16px;
  background-color: #ffb6b6 !important;
  border: 2px solid #ffffff;

  .el-form-item__content {
    width: 20px !important;
    height: 20px !important;
    margin: 0 !important;
    cursor: pointer;
    justify-content: center;
  }

  path {
    fill: #fff;
  }
}

.deleteIcon:hover {
  transform: rotate(180deg);
  border: 2px solid #ff8600;
}

/* 删除图标样式结束 */

/* 表单样式开始 */
.el-form-item__label {
  border-left: 8px solid #ffa217;
  padding-left: 8px !important;
  height: 26px !important;
  line-height: 26px !important;
  margin-bottom: 4px;
}

.el-form-item__label {
  background-color: #eaf5ff;
}

.el-form-item {
  padding: 8px;
  margin-bottom: 0 !important;
}

/* 表单样式结束 */

/* 组件弹窗样式开始 */
.zoomInDialog {
  height: 95%;
  max-height: 95%;
  --el-dialog-padding-primary: 0 !important;
  --el-dialog-border-radius: 0 !important;
  --el-dialog-bg-color: rgba(255, 255, 255, 0.2) !important;
  backdrop-filter: blur(10px);

  .el-dialog__body {
    height: 100%;
    color: #272727;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.zoomInElement {
  height: 90%;
  width: 90%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
}

/* 组件弹窗样式结束 */

/* 全局样式弹窗样式开始 */
.commonDialog {
  height: calc(80% - 2px);
  max-height: 80%;
  --el-dialog-padding-primary: 0 !important;
  --el-dialog-border-radius: 12px !important;

  .el-dialog__header {
    padding: 12px 16px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    background-color: #39c7da;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;

    .el-dialog__title {
      color: white !important;
      font-weight: bold;
    }

    .el-dialog__headerbtn {
      top: unset !important;
    }

    .el-dialog__headerbtn .el-dialog__close {
      color: white !important;
      font-size: 24px !important;
    }
  }

  .el-dialog__body {
    height: calc(100% - 128px);
    padding: 16px;
    overflow-x: hidden;
    /* 对其中的第一个子组件设置高度为100% */

    > *:first-child {
      height: 100% !important;
      overflow: auto;
    }
  }

  .el-dialog__footer {
    padding: 8px;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    background-color: #ffffff;
    box-shadow: 0 0 8px rgba(154, 154, 154, 0.5);
  }

  .el-textarea__inner, .el-textarea {
    height: 100% !important;
  }
}

/* 全局样式弹窗样式结束 */

/* 配置加载器弹窗样式开始 */
.configLoaderHeader {
  display: flex;
  align-items: center;
}

/* 配置加载器弹窗样式结束 */

/* 背景滚动动画 */
@keyframes gradientScroll {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}
</style>