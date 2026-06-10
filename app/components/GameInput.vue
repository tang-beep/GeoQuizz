<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  modelValue: string
  placeholder: string
}>()

const emit = defineEmits([
  'update:modelValue'
])

const inputRef =
  ref<HTMLInputElement | null>(
    null
  )

function focus() {
  requestAnimationFrame(() => {
    inputRef.value?.focus()
  })
}

onMounted(() => {
  focus()
})
</script>

<template>
  <input
    ref="inputRef"
    :value="modelValue"
    type="text"
    :placeholder="placeholder"
    class="mt-8 w-full rounded-xl bg-zinc-800 p-4 text-center text-lg text-white outline-none"
    @input="
      emit(
        'update:modelValue',
        ($event.target as HTMLInputElement)
          .value
      )
    "
    @blur="focus"
  >
</template>