<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder: string
}>()

const emit = defineEmits([
  'update:modelValue'
])
</script>

<template>
  <input
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
  >
</template>