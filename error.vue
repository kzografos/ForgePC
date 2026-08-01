<script setup lang="ts">
import { Sparkles, Home, ArrowLeft } from 'lucide-vue-next'
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const code = computed(() => props.error?.statusCode || 500)
const is404 = computed(() => code.value === 404)
const title = computed(() => (is404.value ? 'Page not found' : 'Something went wrong'))
const message = computed(() =>
  is404.value
    ? "The page you're looking for doesn't exist or may have moved."
    : props.error?.statusMessage || 'An unexpected error occurred. Please try again.'
)

useSeoMeta({ title: () => `${code.value} — ForgePC` })

// clearError resets Nuxt's error state, then routes.
const go = (path: string) => clearError({ redirect: path })
</script>

<template>
  <div
    class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 font-sans antialiased text-foreground"
  >
    <!-- Themed background (matches auth layout) -->
    <div class="fixed inset-0 bg-background">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
      <div
        class="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/4 rounded-full bg-primary/20 blur-[120px]"
      />
      <div
        class="absolute bottom-0 left-0 h-[400px] w-[400px] translate-y-1/2 -translate-x-1/4 rounded-full bg-primary/15 blur-[100px]"
      />
    </div>

    <!-- Brand -->
    <button
      class="absolute left-6 top-6 flex items-center gap-2 text-foreground/90 transition-colors hover:text-foreground"
      @click="go('/')"
    >
      <span class="rounded-lg bg-primary/10 p-1.5">
        <Sparkles class="h-5 w-5 text-primary" />
      </span>
      <span class="font-bold">ForgePC</span>
    </button>

    <!-- Content -->
    <div class="relative z-10 mx-auto max-w-lg px-6 text-center">
      <p
        class="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-8xl font-extrabold tracking-tight text-transparent sm:text-9xl"
      >
        {{ code }}
      </p>
      <h1 class="mt-4 text-2xl font-bold sm:text-3xl">{{ title }}</h1>
      <p class="mx-auto mt-3 max-w-md text-muted-foreground">{{ message }}</p>

      <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 sm:w-auto"
          @click="go('/')"
        >
          <Home class="h-4 w-4" />
          Back to Home
        </button>
        <button
          class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 font-medium text-foreground transition-colors hover:bg-white/10 sm:w-auto"
          @click="go('/products')"
        >
          <ArrowLeft class="h-4 w-4" />
          Browse Products
        </button>
      </div>
    </div>
  </div>
</template>
