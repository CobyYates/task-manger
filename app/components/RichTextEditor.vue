<template>
  <div class="rich-editor" :class="{ 'rich-editor--focused': isFocused, 'rich-editor--compact': compact }">
    <div v-if="editor && !readonly" class="rich-editor__toolbar">
      <div class="toolbar-group">
        <button
          v-for="btn in textFormatButtons"
          :key="btn.icon"
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': btn.isActive() }"
          :title="btn.title"
          @click="btn.action"
        >
          <v-icon size="18">{{ btn.icon }}</v-icon>
        </button>
      </div>

      <div class="toolbar-divider" />

      <div class="toolbar-group">
        <button
          v-for="btn in listButtons"
          :key="btn.icon"
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': btn.isActive() }"
          :title="btn.title"
          @click="btn.action"
        >
          <v-icon size="18">{{ btn.icon }}</v-icon>
        </button>
      </div>

      <div class="toolbar-divider" />

      <div class="toolbar-group">
        <button
          v-for="btn in headingButtons"
          :key="btn.icon"
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': btn.isActive() }"
          :title="btn.title"
          @click="btn.action"
        >
          <v-icon size="18">{{ btn.icon }}</v-icon>
        </button>
      </div>

      <div class="toolbar-divider" />

      <div class="toolbar-group">
        <button
          v-for="btn in insertButtons"
          :key="btn.icon"
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': btn.isActive?.() }"
          :title="btn.title"
          @click="btn.action"
        >
          <v-icon size="18">{{ btn.icon }}</v-icon>
        </button>
      </div>

      <div class="toolbar-divider" />

      <div class="toolbar-group">
        <button
          v-for="btn in codeButtons"
          :key="btn.icon"
          class="toolbar-btn"
          :class="{ 'toolbar-btn--active': btn.isActive?.() }"
          :title="btn.title"
          @click="btn.action"
        >
          <v-icon size="18">{{ btn.icon }}</v-icon>
        </button>
      </div>
    </div>

    <EditorContent :editor="editor" class="rich-editor__content" />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  readonly?: boolean
  compact?: boolean
}>(), {
  modelValue: '',
  placeholder: 'Start typing...',
  readonly: false,
  compact: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isFocused = ref(false)

const editor = useEditor({
  content: props.modelValue,
  editable: !props.readonly,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
    }),
    Underline,
    Link.configure({
      openOnClick: true,
      HTMLAttributes: { class: 'rich-link' },
    }),
    Image.configure({
      HTMLAttributes: { class: 'rich-image' },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
  onFocus: () => {
    isFocused.value = true
  },
  onBlur: () => {
    isFocused.value = false
  },
})

const textFormatButtons = computed(() => editor.value ? [
  { icon: 'mdi-format-bold', title: 'Bold', isActive: () => editor.value!.isActive('bold'), action: () => editor.value!.chain().focus().toggleBold().run() },
  { icon: 'mdi-format-italic', title: 'Italic', isActive: () => editor.value!.isActive('italic'), action: () => editor.value!.chain().focus().toggleItalic().run() },
  { icon: 'mdi-format-underline', title: 'Underline', isActive: () => editor.value!.isActive('underline'), action: () => editor.value!.chain().focus().toggleUnderline().run() },
  { icon: 'mdi-format-strikethrough', title: 'Strikethrough', isActive: () => editor.value!.isActive('strike'), action: () => editor.value!.chain().focus().toggleStrike().run() },
] : [])

const listButtons = computed(() => editor.value ? [
  { icon: 'mdi-format-list-bulleted', title: 'Bullet list', isActive: () => editor.value!.isActive('bulletList'), action: () => editor.value!.chain().focus().toggleBulletList().run() },
  { icon: 'mdi-format-list-numbered', title: 'Numbered list', isActive: () => editor.value!.isActive('orderedList'), action: () => editor.value!.chain().focus().toggleOrderedList().run() },
  { icon: 'mdi-format-quote-close', title: 'Blockquote', isActive: () => editor.value!.isActive('blockquote'), action: () => editor.value!.chain().focus().toggleBlockquote().run() },
] : [])

const headingButtons = computed(() => editor.value ? [
  { icon: 'mdi-format-header-1', title: 'Heading 1', isActive: () => editor.value!.isActive('heading', { level: 2 }), action: () => editor.value!.chain().focus().toggleHeading({ level: 2 }).run() },
  { icon: 'mdi-format-header-2', title: 'Heading 2', isActive: () => editor.value!.isActive('heading', { level: 3 }), action: () => editor.value!.chain().focus().toggleHeading({ level: 3 }).run() },
] : [])

const insertButtons = computed(() => editor.value ? [
  { icon: 'mdi-link', title: 'Link', isActive: () => editor.value!.isActive('link'), action: () => setLink() },
  { icon: 'mdi-image-plus', title: 'Image', isActive: () => false, action: () => addImage() },
] : [])

const codeButtons = computed(() => editor.value ? [
  { icon: 'mdi-code-tags', title: 'Inline code', isActive: () => editor.value!.isActive('code'), action: () => editor.value!.chain().focus().toggleCode().run() },
  { icon: 'mdi-xml', title: 'Code block', isActive: () => editor.value!.isActive('codeBlock'), action: () => editor.value!.chain().focus().toggleCodeBlock().run() },
  { icon: 'mdi-minus', title: 'Horizontal rule', isActive: () => false, action: () => editor.value!.chain().focus().setHorizontalRule().run() },
] : [])

watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val, false)
  }
})

watch(() => props.readonly, (val) => {
  editor.value?.setEditable(!val)
})

function setLink() {
  if (!editor.value) return
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('URL', previousUrl)
  if (url === null) return
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function addImage() {
  if (!editor.value) return
  const url = window.prompt('Image URL')
  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run()
  }
}
</script>

<style lang="scss">
.rich-editor {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &--focused {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
  }

  &__toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px 10px;
    border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    background: rgba(var(--v-theme-surface-variant), 0.3);
  }

  &__content {
    .tiptap {
      padding: 12px 16px;
      min-height: 120px;
      outline: none;
      font-size: 0.875rem;
      line-height: 1.6;

      > * + * {
        margin-top: 0.5em;
      }

      h2 {
        font-size: 1.25rem;
        font-weight: 700;
        margin-top: 1em;
      }

      h3 {
        font-size: 1.1rem;
        font-weight: 600;
        margin-top: 0.75em;
      }

      ul, ol {
        padding-left: 1.5em;
      }

      li {
        margin: 0.25em 0;
      }

      blockquote {
        border-left: 3px solid rgb(var(--v-theme-primary));
        padding-left: 1em;
        margin-left: 0;
        color: rgba(var(--v-theme-on-surface), 0.7);
        font-style: italic;
      }

      code {
        background: rgba(var(--v-theme-surface-variant), 0.5);
        padding: 0.15em 0.4em;
        border-radius: 4px;
        font-size: 0.85em;
        font-family: 'Fira Code', 'Cascadia Code', monospace;
      }

      pre {
        background: rgba(var(--v-theme-surface-variant), 0.5);
        padding: 0.75em 1em;
        border-radius: 8px;
        overflow-x: auto;

        code {
          background: none;
          padding: 0;
        }
      }

      hr {
        border: none;
        border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
        margin: 1em 0;
      }

      a.rich-link {
        color: rgb(var(--v-theme-primary));
        text-decoration: underline;
        cursor: pointer;
      }

      img.rich-image {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        margin: 0.5em 0;
      }

      p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: rgba(var(--v-theme-on-surface), 0.35);
        pointer-events: none;
        height: 0;
      }
    }
  }

  &--compact .rich-editor__content .tiptap {
    min-height: 80px;
    padding: 8px 12px;
  }
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  margin: 0 6px;
  background: rgba(var(--v-border-color), var(--v-border-opacity));
  flex-shrink: 0;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(var(--v-theme-on-surface), 0.7);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover {
    background: rgba(var(--v-theme-on-surface), 0.08);
    color: rgba(var(--v-theme-on-surface), 1);
  }

  &--active {
    background: rgba(var(--v-theme-primary), 0.15);
    color: rgb(var(--v-theme-primary));

    &:hover {
      background: rgba(var(--v-theme-primary), 0.25);
      color: rgb(var(--v-theme-primary));
    }
  }
}
</style>
