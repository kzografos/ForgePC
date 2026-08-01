<script setup lang="ts">
import { ArrowLeft, Sparkles } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="relative flex min-h-screen flex-col font-sans antialiased text-foreground overflow-hidden">
    <!-- Gradient Background -->
    <div class="fixed inset-0 bg-background">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
    </div>

    <!-- Back Button -->
    <div class="absolute left-4 top-4 md:left-8 md:top-8 z-20">
      <Button variant="ghost" as-child class="hover:bg-white/10">
        <NuxtLink to="/">
          <ArrowLeft class="mr-2 h-4 w-4" /> Back to Home
        </NuxtLink>
      </Button>
    </div>
    
    <!-- Content -->
    <div class="relative flex flex-1 items-center justify-center p-4">
      <div class="w-full max-w-md space-y-8">
        <!-- Logo -->
        <div class="text-center">
          <NuxtLink to="/" class="inline-flex items-center gap-2 group">
            <div class="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Sparkles class="h-6 w-6 text-primary" />
            </div>
            <span class="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              ForgePC
            </span>
          </NuxtLink>
        </div>
        
        <!-- Auth Card -->
        <div class="relative">
          <!-- Glassmorphism effect -->
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl blur-xl" />
          <div class="relative bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/20">
            <slot />
          </div>
        </div>
        
        <!-- Footer note -->
        <p class="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  </div>
</template>

