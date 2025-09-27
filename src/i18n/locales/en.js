export default {
  common: {
    confirm: 'Confirm',
    cancel: 'Cancel',
    submit: 'Submit',
    save: 'Save',
    delete: 'Delete',
    dbDelete: 'Double Click Delete',
    reset: 'Reset',
    clear: 'Clear',
    style: 'Style',
    close: 'Close',
    closeEdit: 'Close Edit',
    openEdit: 'Open Edit',
    load: 'Load',
    download: 'Download',
    refresh: 'Refresh',
    apply: 'Apply',
    name: 'Name',
    showName: 'Show Name',
    hideName: 'Hide Name',
    desc: 'Description',
    add: 'Add',
    switch: 'Switch',
    pressed: 'Pressed',
    error: 'Error',
    edit: 'Edit',
    view: 'View',
    execute: 'Execute',
    copy: 'Copy',
    pinToTop: 'Pin to Top',
    sync: 'Sync',
    export: 'Export',
    settings: 'Settings',
  },
  status: {
    enabledMove: 'Enabled Move',
    disabledMove: 'Disabled Move',
    enabledEdit: 'Enabled Edit',
    disabledEdit: 'Disabled Edit',
  },
  menu: {
    close: 'Close Action Bar',
    open: 'Open Action Bar',
  },
  component: {
    add: 'Add Grid',
    addItem: 'Add Custom Grid',
    addToModule: 'Add Component to Template',
    name: 'Component Name',
    desc: 'Component Description',
    defined: 'Built-in Components',
    custom: 'Custom Components',
    operate: {
      transfer: 'Send component. Drag this button to the input box to copy the component data.',
      drag: 'Drag component, you can also drag by holding the component border',
      export: 'Export this component data',
      module: 'Add to Template',
      copy: 'Copy this component',
      focus: 'focus component',
      cancelFocus: 'unFocus component',
      style: 'Edit component style',
      deleteConfirm: 'Are you sure to delete this component? The data of this component will be permanently deleted.',
    },
    delete: {
      title: 'Confirm to delete this component',
      content: 'Whether to delete the style',
      confirm: 'This style content will be deleted and cannot be recovered!',
    },
    button: {
      name: 'Button Name',
    },
    function: {
      autoExecute: 'Auto-run on load is enabled',
      clickExecute: 'Auto-run is disabled',
      autoExecuteDesc: 'When enabled, the method will be executed automatically when the page loads',
      execute: 'Execute',
      executeDesc: 'Execute the method to get data in the result window',
      functionContentView: 'View method content',
    },
    input: {
      executeDesc: 'Execute the method to get results below',
      copyDesc: 'Copy method result to clipboard',
      clearDesc: 'Clear method execution result',
      functionName: 'Method Name',
    },
    link: {
      url: 'Link URL',
      img: 'Link Icon Address',
      switchNameVisible: 'Toggle Name Display',
      dragTip: 'Drag to enable fast switching window',
      openFastWindow: 'Click to switch to fast switching window',
      layout: {
        horizontal: 'Horizontal Layout',
        floating: 'Floating Layout',
        vertical: 'Vertical Layout',
        switch: 'Toggle scrolling direction, applies when the component cannot display all links',
      },
      edit: {
        title: 'Edit Quick Links',
        urlName: 'Link name',
        url: 'Please enter link URL',
        img: 'Please enter link icon address',
      }
    },
    note: {
      title: 'Note',
      openWindow: 'Display in pop-up window',
      export: 'Export note file',
    },
    search: {
      title: 'Search Engine',
      edit: {
        title: 'Edit Search Engine',
        prefix: 'Prefix Content',
        prefixDesc: 'Content before the link, usually empty',
        suffix: 'Suffix Content',
        suffixDesc: 'Content after the link, usually advanced search append',
        name: 'Name',
        nameDesc: 'Search engine name, used for display',
        url: 'Search Engine URL',
        urlDesc: 'Search engine URL, used for searching',
        pd: 'Search Prompt',
        pdDesc: 'Search prompt, displayed in the input box',
      },
    },
    record: {
      dbClickType: 'Double-click',
    },
    tags: {
      button: 'Button',
      themes: 'Themes',
      language: 'Language',
      menu: 'Menu',
      link: 'Link',
      workspace: 'Workspace',
      html: 'HTML Grid',
      calender: 'Calendar',
      function: 'Function',
      click: 'Click',
      mouse: 'Mouse',
      keyboard: 'Keyboard',
      input: 'Input Conversion',
      countdown: 'Countdown',
      json: 'JSON',
      code: 'Code',
      news: 'News',
      random: 'Random',
      text: 'Text',
      image: 'Image',
      card: 'Card',
      clock: 'Clock',
      title: 'Title',
      shortcutKey: 'Shortcut Key',
      article: 'Article',
      game: 'Game',
      draw: 'Draw',
      time: 'Time',
      music: 'Music',
      earth: 'Earth',
      model: 'Model',
    }
  },
  style: {
    title: 'Style',
    global: 'Global Style',
    component: 'Component Style',
    active_: 'Activated style: ',
    inactive_: 'Deactivated style: ',
    add: 'Add New Style',
    edit: 'Edit Style',
    name: 'Style Name',
    delete: {
      title: 'Delete Selected Style',
      content: 'Whether to delete the style',
      confirm: 'This style content will be deleted and cannot be recovered!',
    },
    pack: {
      title: 'Style Pack',
      create: 'Create Style Pack',
      createTip: 'Select style tags to create style pack',
      name: 'Style Pack Name',
      desc: 'Style pack description',
    },
    duplicate: {
      title: 'Duplicate Style Tag',
      desc: 'Current style pack already exists duplicate style tag 【{0}】',
    },
  },
  config: {
    title: 'Configuration',
    switch: 'Configuration Switch',
    load: 'Load Configuration',
    save: 'Save Configuration',
    transfer: 'Send configuration. Drag this button to the input box to copy the configuration data.',
    transferReceive: {
      title: 'Configuration Receive',
      desc: 'Whether to receive configurations dragged in from outside, which will overwrite all data in the current workspace. Continue loading?'
    },
    loadConfirm: 'Are you sure to load the above configuration, which will overwrite all local configurations?',
    clearConfirm: 'Are you sure to clear and reload the page?',
    loading: 'Loading configuration...',
    loadFail: '',
    configUrl: 'Configure URL, the access address or download address for synchronous configuration.',
    lockUrl: 'Configure URL lock. After enabling left-side synchronization, the configuration address parameters will be automatically synchronized when the page loads.',
    lock: 'Enable',
    unlock: 'Disable',
    gridstack: {
      title: 'Layout Settings',
      reload: {
        title: 'Whether to reload the page',
        desc: 'Reload the page to apply layout settings?'
      },
      columns: 'Number of Columns',
      width: 'Width',
      widthMode: {
        name: 'Width Mode',
        auto: 'Auto',
        autoDesc: 'Automatically calculate grid width based on window length and number of columns',
        percentage: 'Percentage',
        percentageDesc: 'Grid width is equal to the percentage of window length',
        static: 'Fixed Value',
        staticDesc: 'Manually define grid width',
      },
      widthParam: 'Width Parameter',
      height: 'Height',
      heightMode: {
        name: 'Height Mode',
        window: 'Relative to Window',
        windowDesc: 'Grid height is equal to the percentage of window height',
        cellWidth: 'Relative to Grid Width',
        cellWidthDesc: 'Grid height is equal to the percentage of its own width',
        static: 'Fixed Value',
        staticDesc: 'Manually define grid height',
      },
      heightParam: 'Height Parameter',
    },
  },
  success: {
    add: 'Add successful',
    save: 'Save successful',
    delete: 'Delete successful',
    copy: 'Copy successful',
  },
  error: {
    load: 'Load failed!',
    noSuchComponent_: 'Corresponding component not found - ',
    noName: 'Please enter a name',
    nameExist: 'Name already exists',
    noConfigContent: 'No configuration content',
    noConfigUrl: 'No configuration URL',
    loadFormat: 'Format error',
    uploadJson: 'Please upload a JSON file',
    uploadMarkdown: 'Please upload a Markdown file',
    noSelectStyle: 'Please select a style',
    componentNotExist: 'Component does not exist',
    workspaceEmpty: 'Workspace name cannot be empty',
    cannotOpenWindow: 'Pop-up window is blocked! Please allow pop-ups for this site.',
    unknownContent: 'Unknown content'
  },
  layout: {
    edit: 'Layout Edit',
    enableMove: 'Enable Movement',
    enableEdit: 'Enable Editing',
  },
  workspace: {
    title: 'Workspace',
    switch: 'Switch Workspace',
    settings: 'Workspace Settings',
    alreadyInThis: 'Already in current workspace',
    current: 'Current Workspace',
    temp: {
      title: 'Temporary Workspace',
      desc: 'Temporary workspace, data will be lost when closing the page',
      warning: 'Warning: Temporary workspace data will be lost when closing or reloading the page',
    },
    delete: {
      title: 'Delete Selected Workspace',
      content: 'Whether to delete the workspace',
      cannotDelete: 'Can not delete this workspace',
      tip: 'All data under this workspace will be deleted and cannot be recovered!',
    },
    recover: {
      title: 'Data Overwrite',
      desc: 'The current workspace {0} already has existing data. Continuing to load the remote configuration will overwrite all data in the current workspace. Proceed?',
    }
  },
  placeholder: {
    configInput: 'Please enter configuration URL or drag JSON file here',
    componentInput: 'Please enter configuration data or drag JSON file here',
    newWorkspaceName: 'Please enter new workspace name',
    noteInput: 'Enter content or drag Markdown file here',
    searchInput: 'Enter search content, press Enter to search',
    recordInput: 'Enter the record, press Ctrl + Enter to save quickly',
    styleInput: 'Please enter style',
    styleEdit_: 'Please edit style - ',
    styleSelect: 'Click the style tab above to start editing',
    styleNameAdd: 'Add new style name, press Enter to add',
    styleNameEdit: 'Edit style name, press Enter to save',
    needInput: 'Please enter',
    buttonNameInput: 'Button name',
    functionContentInput: 'Enter method content',
    functionContentEdit: 'Edit method content',
    htmlInput: 'Enter web page code',
    iframeInput: 'Please enter URL',
    inputDataInput: 'Enter parameters, press ctrl + enter to execute the method',
    inputFunctionInput: 'Enter method content, you can use input variable to get input value, setResult(String) method to set result',
    componentFilter: 'Filter component name',
  },
  text: {
    configTip1: 'You can paste the configuration content into the input box, or drag the JSON file into the input box.',
    configTip2: 'It also supports using the configuration download address to fill in here to get automatically.',
    configTip3: 'Note: Due to cross-domain restrictions, when the configuration address is unavailable, the page may try to use the proxy method of https://corsproxy.io to obtain it.',
    configTip4: 'It is recommended to build your own proxy server.',
    h5Support: 'Support H5 tags',
    workspaceDesc: 'Workspace represents the current working environment. Different workspaces can have different configurations and data.',
    uploadTip: 'Drag the configuration file here to apply it',
  },
  input: {
    params: 'Parameters',
    paramsInfo: 'Parameter Description',
    paramsTip: `Use the format {'@'}{'{'}parameter name:parameter description?parameter default value{'}'} in the text to reference parameters. Both parameter description and default value can be omitted, for example: {'@'}{'{'}title:title content{'}'}`,
    name: 'Input Name',
  },
  lang: {
    title: 'Language',
    zh: '中文',
    en: 'English',
    switch: 'Switch Language',
  },
  about: {
    title: 'About',
    content: `
      <h1>One Page</h1>
      <p>One Page is a personal homepage project based on Vue3 + Vite. You can customize your personal homepage by adding components.</p>
      <h2>Project Links</h2>
      <p><a href="https://github.com/OnePageWeb/one-page" target="_blank">one-page project address</a></p>
      <p><a href="https://github.com/OnePageWeb/one" target="_blank">Compiled project address</a></p>
      <h2>Project Description</h2>
      <p>One Page adopts a <strong>component</strong> + <strong>grid</strong> layout, greatly enhancing personalization.</p>
      <p><strong>Global styles</strong> + <strong>component styles</strong> provide greater freedom and flexibility in customizing your personal homepage.</p>
      <p><strong>One Page</strong> supports copying <strong>component groups</strong>, <strong>styles</strong>, and <strong>workspaces</strong> between two pages through drag-and-drop, greatly improving sharing efficiency.</p>
    `,
  },
  background: {
    title: 'Web Page Background',
    desc: 'Set the background image, support network address or file library image',
    type: {
      img: 'Image URL',
      css: 'Background Style Code',
      html: 'Web Page URL',
    },
  },
  version: {
    currentVersion: 'Current version',
    updateInfo: 'Update notes',
    fetchError: 'No new version information obtained'
  },
  shortcut: {
    q: 'Move Mode',
    e: 'Edit Mode',
    w: 'Focus Mode',
    wTip: 'Click the component to focus on it, and press ALT + W again to exit.',
    d: 'Action Bar',
    r: 'Refresh Page',
    f: 'Receive Mode',
    '~': 'User Mode',
  },
  fileLibrary: {
    title: 'File Library',
    desc: 'File library for storing and managing files',
  },
  itemType: {
    text: {
      name: 'Text Grid',
      desc: 'Grid for displaying text content, allowing html tags'
    },
    note: {
      name: 'Note Grid',
      desc: 'Grid for displaying Markdown content'
    },
    search: {
      name: 'Search Bar',
      desc: 'Search engine input box for searching specified content'
    },
    iframe: {
      name: 'URL Grid',
      desc: 'Grid for embedding web addresses, cross-domain not supported'
    },
    html: {
      name: 'Web Page Grid',
      desc: 'Grid that can embed web page code'
    },
    link: {
      name: 'Quick Links',
      desc: 'Grid for quick jumps, supporting custom links'
    },
    button: {
      name: 'Button Grid',
      desc: 'Button for triggering scripts'
    },
    input: {
      name: 'Input Conversion',
      desc: 'Conversion grid for calculating input, custom processing function, and getting results'
    },
    function: {
      name: 'Calculation Function',
      desc: 'Grid for custom calculations, custom processing functions. Double-click the grid in use mode to run'
    },
    record: {
      name: 'Record Grid',
      desc: 'A grid for recording data, ideal as a data logger'
    },
  }
}