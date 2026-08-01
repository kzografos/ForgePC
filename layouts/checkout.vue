<script setup lang="ts">
import { Lock } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-muted/20">
    <header class="border-b bg-background">
       <div class="container h-16 flex items-center justify-between">
          <NuxtLink to="/" class="font-bold text-xl">ForgePC</NuxtLink>
          <div class="flex items-center text-sm text-muted-foreground">
             <Lock class="w-4 h-4 mr-2" /> Secure Checkout
          </div>
       </div>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>
