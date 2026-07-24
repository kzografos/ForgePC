<script setup lang="ts">
import { ShieldCheck, Truck, Headset, Tag } from 'lucide-vue-next'

const features = [
  { n: '01', label: 'QUALITY',  icon: ShieldCheck, title: 'Premium quality', body: 'Sourced only from authorized distributors' },
  { n: '02', label: 'SHIPPING', icon: Truck,       title: 'Fast shipping',   body: 'Express delivery across Europe' },
  { n: '03', label: 'SUPPORT',  icon: Headset,     title: 'Expert support',  body: 'Technical help from certified builders' },
  { n: '04', label: 'PRICING',  icon: Tag,         title: 'Best prices',     body: 'Competitive pricing, price-match guarantee' },
]

const root = ref<HTMLElement | null>(null)
const visible = ref(false)

onMounted(() => {
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  // Reveal immediately (no scroll animation) when reduced motion is requested or IO is unavailable.
  if (prefersReduced || !('IntersectionObserver' in window)) {
    visible.value = true
    return
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          visible.value = true
          observer.disconnect()
          break
        }
      }
    },
    { threshold: 0.15 },
  )
  // Cast: happy-dom DOM types (pulled in by the test toolchain during typecheck)
  // clash with lib.dom's Element; the runtime value is a real Element.
  if (root.value) observer.observe(root.value as unknown as Element)
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <section ref="root">
    <!-- Section header -->
    <header class="mb-8">
      <p class="font-mono text-[11px] uppercase tracking-[0.14em] text-primary">Why KZProducts</p>
      <h2 class="mt-2 text-3xl font-medium tracking-[-0.02em] text-foreground md:text-4xl">
        Everything your build needs
      </h2>
      <p class="mt-3 max-w-[46ch] text-sm text-muted-foreground">
        Authorized parts, fast EU shipping, and real builder support.
      </p>
    </header>

    <!-- Grid: 1 col (sm) -> 2x2 (md) -> 4 across (lg+). Explicit breakpoints, no auto-fit. -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="(f, i) in features"
        :key="f.n"
        class="fl-card rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"
        :class="{ 'is-visible': visible }"
        :style="{ '--fl-delay': `${i * 70}ms` }"
      >
        <span
          class="fl-icon inline-flex h-9 w-9 items-center justify-center rounded-[9px] bg-violet-500/[0.14] text-violet-300"
        >
          <component :is="f.icon" class="h-4 w-4" :stroke-width="2" />
        </span>
        <p class="mt-3 font-mono text-[10px] tracking-[0.12em] text-muted-foreground">
          {{ f.n }} / {{ f.label }}
        </p>
        <h3 class="mt-1 text-sm font-medium text-foreground">{{ f.title }}</h3>
        <p class="mt-1 text-[12.5px] leading-snug text-muted-foreground">{{ f.body }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fl-card {
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 450ms ease-out var(--fl-delay, 0ms),
    transform 450ms ease-out var(--fl-delay, 0ms),
    translate 180ms ease,
    border-color 180ms ease;
  will-change: opacity, transform;
}
.fl-card.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.fl-icon {
  transition: transform 180ms ease;
}
.fl-card:hover {
  translate: 0 -3px;
  border-color: rgba(167, 139, 250, 0.35);
}
.fl-card:hover .fl-icon {
  transform: scale(1.05);
}

/* Disable ALL motion for users who ask for reduced motion. */
@media (prefers-reduced-motion: reduce) {
  .fl-card,
  .fl-icon {
    transition: none !important;
    transform: none !important;
    translate: none !important;
  }
  .fl-card {
    opacity: 1 !important;
  }
}
</style>
