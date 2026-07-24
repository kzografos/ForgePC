<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import { Button } from "@/components/ui/button";
import CategoryShowcase from "@/components/home/CategoryShowcase.vue";
import FeatureList from "@/components/home/FeatureList.vue";
import AnimatedBackground from "@/components/ui/AnimatedBackground.vue";
const HeroAnimatedBeam = defineAsyncComponent(() => import("@/components/home/HeroAnimatedBeam.vue"));

// Fetch frontmatter from content
const { data: page } = await useAsyncData("index", () =>
  queryContent("/").findOne(),
);
</script>

<template>
  <div class="relative min-h-screen bg-slate-950">
    <!-- Animated Background -->
    <AnimatedBackground />

    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="container relative py-12 lg:py-16">
        <div class="text-center space-y-8 max-w-4xl mx-auto">
          <!-- Gradient Title -->
          <h1
            class="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl bg-gradient-to-r from-white via-white to-violet-400 bg-clip-text text-transparent animate-slide-down-bounce"
          >
            {{ page?.hero?.title || "Build Your Dream PC" }}
          </h1>

          <!-- Subtitle -->
          <p class="mx-auto max-w-[700px] text-lg sm:text-xl text-slate-400">
            {{
              page?.hero?.subtitle ||
              "The best CPUs, GPUs, and components for gaming and workstation builds."
            }}
          </p>
        </div>

        <!-- Animated Beam Visualization - Full Width (now above buttons) -->
        <div class="mt-8">
          <HeroAnimatedBeam />
        </div>

        <!-- CTA Buttons - Now below beam with slide-up animation -->
        <div
          class="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-6 mt-2 animate-slide-up-fade"
        >
          <!-- Primary Button with Glow -->
          <NuxtLink
            :to="page?.hero?.cta_primary_link || '/products'"
            class="group relative inline-flex w-full items-center justify-center sm:w-auto sm:min-w-40"
          >
            <span
              class="absolute inset-0 rounded-xl bg-violet-500/30 blur-xl transition-all duration-300 group-hover:bg-violet-500/50 group-hover:blur-2xl"
            />
            <span
              class="relative inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-8 py-3 text-base font-semibold text-white transition-all duration-300 hover:bg-violet-500 hover:scale-105"
            >
              {{ page?.hero?.cta_primary || "Shop Now" }}
            </span>
          </NuxtLink>

          <!-- Secondary Button -->
          <NuxtLink
            :to="page?.hero?.cta_secondary_link || '/about'"
            class="inline-flex w-full items-center justify-center rounded-xl border border-white/20 bg-white/5 px-8 py-3 text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/30 sm:w-auto sm:min-w-40"
          >
            {{ page?.hero?.cta_secondary || "Learn More About Us" }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Category Showcase -->
    <div class="container relative">
      <CategoryShowcase />
    </div>

    <!-- Features Section -->
    <div class="container relative py-16">
      <FeatureList />
    </div>
  </div>
</template>
