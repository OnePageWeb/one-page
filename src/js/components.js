import textComponent from "@/components/TextComponent.vue"
import noteComponent from "@/components/NoteComponent.vue"
import searchComponent from "@/components/SearchComponent.vue"
import iframeComponent from "@/components/IframeComponent.vue"
import htmlComponent from "@/components/HtmlComponent.vue"
import linkComponent from "@/components/LinkComponent.vue"
import buttonComponent from "@/components/ButtonComponent.vue"
import inputComponent from "@/components/InputComponent.vue"
import functionComponent from "@/components/FunctionComponent.vue"
import recordComponent from "@/components/RecordComponent.vue"

export const itemType = [
    {
        value: 'text',
        color: '#ffffff',
        component: textComponent
    },
    {
        value: 'note',
        color: '#ff86e7',
        component: noteComponent
    },
    {
        value: 'search',
        color: '#000000',
        component: searchComponent
    },
    {
        value: 'iframe',
        color: '#439af8',
        component: iframeComponent
    },
    {
        value: 'html',
        color: '#eae25f',
        component: htmlComponent
    },
    {
        value: 'link',
        color: '#3fd165',
        component: linkComponent
    },
    {
        value: 'button',
        color: '#47c8c8',
        component: buttonComponent
    },
    {
        value: 'input',
        color: '#ff5d5d',
        component: inputComponent
    },
    {
        value: 'function',
        color: '#272727',
        component: functionComponent
    },
    {
        value: 'record',
        color: '#5dffa9',
        component: recordComponent
    },
]