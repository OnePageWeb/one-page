export default {
  common: {
    confirm: '确认',
    cancel: '取消',
    submit: '提交',
    save: '保存',
    delete: '删除',
    reset: '重置',
    clear: '清空',
    style: '样式',
    close: '关闭',
    closeEdit: '关闭编辑',
    openEdit: '开启编辑',
    load: '加载',
    download: '下载',
    refresh: '刷新',
    apply: '应用',
    name: '名称',
    showName: '显示名称',
    hideName: '隐藏名称',
    desc: '描述',
    add: '添加',
    switch: '切换',
    pressed: '按下',
    error: '错误',
    edit: '编辑',
    view: '查看',
    execute: '执行',
    copy: '复制',
  },
  menu: {
    close: '关闭操作栏',
    open: '打开操作栏',
  },
  component: {
    add: '添加格子',
    addItem: '添加自定义格子',
    addToModule: '添加组件到模板',
    name: '组件名称',
    desc: '组件描述',
    defined: '内置组件',
    custom: '自定义组件',
    operate: {
      drag: '拖动组件，按住组件边框也可以进行拖动',
      export: '导出此组件数据',
      module: '添加到模板',
      copy: '复制此组件',
      zoomIn: '放大组件',
      style: '编辑组件样式',
      deleteConfirm: '确定删除此组件？',
    },
    delete: {
      title: '确定删除此组件',
      content: '是否删除样式',
      confirm: '此样式内容将被删除，不可恢复！',
    },
    button: {
      name: '按钮名称',
    },
    function: {
      autoExecute: '已开启载入时自动运行',
      clickExecute: '已关闭自动运行',
      autoExecuteDesc: '开启后，页面加载时会自动执行方法',
      execute: '执行',
      executeDesc: '执行方法，在结果窗口得到数据',
      functionContentView: '查看方法内容',
    },
    input: {
      executeDesc: '执行方法，在下方得到结果',
      copyDesc: '复制方法结果到剪切板',
      clearDesc: '清除方法执行结果',
      functionName: '方法名称',
    },
    link: {
      url: '链接URL',
      img: '链接图标地址',
      switchNameVisible: '切换名称显示',
      layout: {
        horizontal: '水平布局',
        floating: '浮动布局',
        vertical: '垂直布局',
        switch: '切换滚动方向，作用于组件不足以显示所有链接时',
      },
      edit: {
        title: '编辑快速链接',
        urlName: '请输入链接名称',
        url: '请输入链接URL',
        img: '请输入链接图标地址',
      }
    },
    note: {
      title: '便签',
      openWindow: '弹出窗口显示',
      export: '导出便签文件',
    },
    search: {
      title: '搜索引擎',
      edit: {
        title: '编辑搜索引擎',
        prefix: '前置内容',
        prefixDesc: '在链接前的内容，通常是空',
        suffix: '后置内容',
        suffixDesc: '在链接后的内容，通常是高级搜索追加',
        name: '搜索引擎名称',
        nameDesc: '搜索引擎名称，用于显示',
        url: '搜索引擎URL',
        urlDesc: '搜索引擎URL，用于搜索',
        pd: '搜索提示语',
        pdDesc: '搜索提示语，显示于输入框中',
      },
    },
  },
  style: {
    title: '样式',
    global: '全局样式',
    component: '组件样式',
    active_: '已激活样式：',
    inactive_: '以取消样式：',
    add: '新增样式',
    edit: '编辑样式',
    name: '样式名称',
    delete: {
      title: '删除选中样式',
      content: '是否删除样式',
      confirm: '此样式内容将被删除，不可恢复！',
    },
  },
  config: {
    title: '配置',
    switch: '配置切换',
    load: '加载配置',
    save: '保存配置',
    loadConfirm: '确定加载以上配置，这会覆盖本地的所有配置？',
    clearConfirm: '确定清空并重新加载页面？',
    loading: '正在加载配置...',
    loadFail: '',
  },
  success: {
    add: '添加成功',
    save: '保存成功',
    delete: '删除成功',
    copy: '复制成功',
  },
  error: {
    load: '加载失败！',
    noSuchComponent_: '未找到对应的组件 - %s',
    noName: '请输入名称',
    nameExist: '已存在同名',
    noConfigContent: '无配置内容',
    loadFormat: '格式错误',
    uploadJson: '请上传JSON文件',
    uploadMarkdown: '请上传Markdown文件',
    noSelectStyle: '请选择样式',
    componentNotExist: '组件不存在',
    workspaceEmpty: '工作区名称不能为空',
    cannotOpenWindow: '弹出窗口被阻止了！请允许此站点的弹出窗口。',
  },
  layout: {
    edit: '布局编辑',
    enableMove: '开启移动',
    enableEdit: '开启编辑',
  },
  workspace: {
    title: '工作区',
    switch: '切换工作区',
    settings: '工作区设定',
    alreadyInThis: '已处于当前工作区',
    current: '当前工作区',
    delete: {
      title: '删除选中工作区',
      content: '是否删除工作区',
      tip: '此工作区下的所有数据将被删除，不可恢复！',
    },
  },
  placeholder: {
    configInput: '请输入配置URL或拖拽JSON文件到此处',
    componentInput: '请输入配置数据或拖拽JSON文件到此处',
    newWorkspaceName: '请输入新工作区名称',
    noteInput: '输入内容或将Markdown文件拖拽到此处',
    searchInput: '输入搜索内容，按下Enter以搜索',
    styleInput: '请输入样式',
    styleEdit_: '请编辑样式 - ',
    styleSelect: '点击上方样式标签即可开启编辑',
    styleNameAdd: '新增样式名称，按下Enter以新增',
    styleNameEdit: '编辑样式名称，按下Enter以保存',
    needInput: '请输入',
    buttonNameInput: '按钮名称',
    functionContentInput: '输入方法内容',
    functionContentEdit: '编辑方法内容',
    htmlInput: '输入网页代码',
    iframeInput: '请输入网址',
    inputDataInput: '输入参数，按下ctrl + enter即可执行方法',
    inputFunctionInput: '输入方法内容，可以使用input变量来获取输入值，setResult(String)方法来设置结果',
  },
  text: {
    configTip1: '可以将配置内容粘贴到输入框内，也可以拖拽JSON文件到输入框中。',
    configTip2: '同样支持使用配置下载地址填写于此处自动获取。',
    configTip3: '注意：由于跨域限制，当配置地址无法使用时，页面或尝试使用 https://corsproxy.io 的代理方式获取。',
    configTip4: '推荐自建代理服务器。',
    h5Support: '支持H5标签',
    workspaceDesc: '工作区表示了当前正在使用的工作环境，不同的工作区可以拥有不同的配置和数据。',
  },
  input: {
    params: '参数列表',
    paramsInfo: '参数说明',
    paramsTip: `在文本中使用 {'$'}{'{'}参数名:参数说明?参数默认值{'}'} 的格式来引用参数，参数说明与默认值都可以不填写，例如：{'$'}{'{'}标题:标题内容{'}'}`,
    name: '输入名称',
  },
  lang: {
    title: '语言',
    zh: '中文',
    en: 'English',
    switch: '切换语言',
  },
  shortcut: {
    q: '移动模式',
    e: '编辑模式',
    d: '操作栏',
    r: '刷新页面',
  },
  itemType: {
    text: {
      name: '文本格子',
      desc: '用于显示文本内容的格子，允许html标签'
    },
    notes: {
      name: '便签格子',
      desc: '用于显示Markdown内容的格子'
    },
    search: {
      name: '搜索栏',
      desc: '搜索引擎输入框，用于搜索指定内容'
    },
    iframe: {
      name: '网址格子',
      desc: '用于嵌入网页地址的格子，不支持跨域'
    },
    html: {
      name: '网页格子',
      desc: '可嵌入网页代码的格子'
    },
    link: {
      name: '快速链接',
      desc: '用于快速跳转的格子，支持自定义链接'
    },
    button: {
      name: '按钮格子',
      desc: '用于触发脚本的按钮'
    },
    input: {
      name: '输入转换',
      desc: '用于计算输入的转换格子，自定义处理函数，并得到结果'
    },
    function: {
      name: '计算函数',
      desc: '用于自定义计算的格子，自定义处理函数。使用模式下双击格子即可运行'
    }
  }
}