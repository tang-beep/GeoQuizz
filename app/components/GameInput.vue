<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder: string
  inputRef: HTMLInputElement | null
}>()

const emit = defineEmits([
  'update:modelValue',
  'enter'
])
</script>

<template>
  <input
    :ref="(el) => inputRef = el as HTMLInputElement"
    :value="modelValue"
    type="text"
    :placeholder="placeholder"
    class="mt-10 w-full max-w-md rounded-xl bg-zinc-800 p-4 text-center text-xl text-white outline-none"
    @input="
      emit(
        'update:modelValue',
        ($event.target as HTMLInputElement).value
      )
    "
    @keyup.enter="emit('enter')"
  >
</template>