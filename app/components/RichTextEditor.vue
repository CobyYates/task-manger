<template>
  <div class="rich-editor" :class="{ 'rich-editor--focused': isFocused, 'rich-editor--compact': compact }">
    <div v-if="editor && !readonly" class="rich-editor__toolbar">
      <v-btn-group variant="text" density="compact">
        <v-btn
          icon="mdi-format-bold"
          size="x-small"
          :color="editor.isActive('bold') ? 'primary' : undefined"
          @click="editor.chain().focus().toggleBold().run()"
        />
        <v-btn
          icon="mdi-format-italic"
          size="x-small"
          :color="editor.isActive('italic') ? 'primary' : undefined"
          @click="editor.chain().focus().toggleItalic().run()"
        />
        <v-btn
          icon="mdi-format-underline"
          size="x-small"
          :color="editor.isActive('underline') ? 'primary' : undefined"
          @click="editor.chain().focus().toggleUnderline().run()"
        />
        <v-btn
          icon="mdi-format-strikethrough"
          size="x-small"
          :color="editor.isActive('strike') ? 'primary' : undefined"
          @click="editor.chain().focus().toggleStrike().run()"
        />
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group variant="text" density="compact">
        <v-btn
          icon="mdi-format-list-bulleted"
          size="x-small"
          :color="editor.isActive('bulletList') ? 'primary' : undefined"
          @click="editor.chain().focus().toggleBulletList().run()"
        />
        <v-btn
          icon="mdi-format-list-numbered"
          size="x-small"
          :color="editor.isActive('orderedList') ? 'primary' : undefined"
          @click="editor.chain().focus().toggleOrderedList().run()"
        />
        <v-btn
          icon="mdi-format-quote-close"
          size="x-small"
          :color="editor.isActive('blockquote') ? 'primary' : undefined"
          @click="editor.chain().focus().toggleBlockquote().run()"
        />
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group variant="text" density="compact">
        <v-btn
          icon="mdi-format-header-1"
          size="x-small"
          :color="editor.isActive('heading', { level: 2 }) ? 'primary' : undefined"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        />
        <v-btn
          icon="mdi-format-header-2"
          size="x-small"
          :color="editor.isActive('heading', { level: 3 }) ? 'primary' : undefined"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        />
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group variant="text" density="compact">
        <v-btn
          icon="mdi-link"
          size="x-small"
          :color="editor.isActive('link') ? 'primary' : undefined"
          @click="setLink"
        />
        <v-btn
          icon="mdi-image-plus"
          size="x-small"
          @click="addImage"
        />
      </v-btn-group>

      <v-divider vertical class="mx-1" />

      <v-btn-group variant="text" density="compact">
        <v-btn
          icon="mdi-code-tags"
          size="x-small"
          :color="editor.isActive('code') ? 'primary' : undefined"
          @click="editor.chain().focus().toggleCode().run()"
        />
        <v-btn
          icon="mdi-xml"
          size="x-small"
          :color="editor.isActive('codeBlock') ? 'primary' : undefined"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        />
        <v-btn
          icon="mdi-minus"
          size="x-small"
          @click="editor.chain().focus().setHorizontalRule().run()"
        />
      </v-btn-group>
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
    gap: 2px;
    padding: 6px 8px;
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
</style>
