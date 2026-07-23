<script setup lang="ts">
import {
  Sparkles,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
} from 'lucide-vue-next'
</script>

<template>
  <footer class="relative border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
    <div
      class="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent"
    />

    <div class="container py-12 md:py-16">
      <div class="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5 md:gap-8">
        <div class="col-span-2 md:col-span-1">
          <NuxtLink to="/" class="mb-4 flex items-center gap-2">
            <div class="rounded-lg bg-violet-500/20 p-1.5">
              <Sparkles class="h-5 w-5 text-violet-400" />
            </div>
            <span class="font-bold text-white">KZProducts</span>
          </NuxtLink>
          <p class="max-w-xs text-sm text-slate-400">
            Premium PC components for gaming and workstation builds.
          </p>
        </div>

        <div>
          <h3 class="mb-4 text-sm font-semibold text-white">About</h3>
          <ul class="space-y-3 text-sm">
            <li>
              <NuxtLink
                to="/about"
                class="transition-colors text-slate-400 hover:text-violet-400"
              >Our Story</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/contact"
                class="transition-colors text-slate-400 hover:text-violet-400"
              >Contact Us</NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="mb-4 text-sm font-semibold text-white">Support</h3>
          <ul class="space-y-3 text-sm">
            <li>
              <NuxtLink
                to="/faq"
                class="transition-colors text-slate-400 hover:text-violet-400"
              >FAQ</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/shipping"
                class="transition-colors text-slate-400 hover:text-violet-400"
              >Shipping</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/returns"
                class="transition-colors text-slate-400 hover:text-violet-400"
              >Returns</NuxtLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="mb-4 text-sm font-semibold text-white">Legal</h3>
          <ul class="space-y-3 text-sm">
            <li>
              <NuxtLink
                to="/policies/privacy"
                class="transition-colors text-slate-400 hover:text-violet-400"
              >Privacy Policy</NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/policies/terms"
                class="transition-colors text-slate-400 hover:text-violet-400"
              >Terms of Service</NuxtLink>
            </li>
          </ul>
        </div>

        <div class="min-w-0">
          <h3 class="mb-4 text-sm font-semibold text-white">Connect</h3>
          <div class="grid max-w-[7.25rem] grid-cols-3 gap-2">
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on X (Twitter)"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-violet-500/30 hover:text-violet-400"
            >
              <Twitter class="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Facebook"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-violet-500/30 hover:text-violet-400"
            >
              <Facebook class="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-violet-500/30 hover:text-violet-400"
            >
              <Instagram class="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="https://www.linkedin.com/in/konszogr/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect on LinkedIn"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-violet-500/30 hover:text-violet-400"
            >
              <Linkedin class="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="mailto:konszografos@gmail.com"
              aria-label="Email support at KZProducts"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 transition-all hover:border-violet-500/30 hover:text-violet-400"
            >
              <Mail class="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>

      <div class="mt-10 border-t border-white/10 pt-8">
        <div class="mx-auto max-w-md text-center">
          <h3 class="mb-2 text-lg font-semibold text-white">
            Subscribe to Our Newsletter
          </h3>
          <p class="mb-4 text-sm text-slate-400">
            Get the latest deals, product updates, and exclusive offers.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div class="mt-12 border-t border-white/10 pt-8">
        <div class="flex justify-center">
          <p class="text-center text-sm text-slate-400">
            &copy; {{ new Date().getFullYear() }} KZProducts. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  </footer>
</template>
