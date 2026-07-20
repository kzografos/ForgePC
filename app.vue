<script setup lang="ts">
import { Toaster } from 'vue-sonner'

// HIGH-3: global OpenGraph + Twitter card defaults (pages may override title/description).
const siteUrl = useRuntimeConfig().public.siteUrl as string
const ogImage = `${siteUrl}/og-image.png`
useSeoMeta({
  ogSiteName: 'KZProducts',
  ogType: 'website',
  ogUrl: siteUrl,
  ogTitle: 'KZProducts — Build Your Dream PC',
  ogDescription: 'The best CPUs, GPUs, and components for gaming and workstation builds.',
  ogImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/png',
  ogImageAlt: 'KZProducts — Build Your Dream PC',
  twitterCard: 'summary_large_image',
  twitterTitle: 'KZProducts — Build Your Dream PC',
  twitterDescription: 'The best CPUs, GPUs, and components for gaming and workstation builds.',
  twitterImage: ogImage,
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Toast notifications - direct import from vue-sonner -->
    <Toaster 
      position="bottom-left" 
      theme="dark"
      :rich-colors="true"
      :close-button="true"
      :toast-options="{
        style: {
          background: '#0f172a',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white'
        }
      }"
    />
  </div>
</template>

<style>
/* Ensure toasts are always visible */
[data-sonner-toaster] {
  z-index: 99999 !important;
}
</style>
