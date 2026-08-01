<script setup lang="ts">
import { Shield, Truck, HeadphonesIcon, BadgeCheck, ArrowRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

useSeoMeta({
  title: 'About Us - ForgePC',
  description: 'Learn about our mission to provide premium PC hardware to enthusiasts and professionals.'
})

const features = [
  {
    icon: BadgeCheck,
    title: 'Premium Quality',
    description: 'We source only from authorized distributors, ensuring authentic products with full warranty coverage.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    icon: Truck,
    title: 'Fast Shipping',
    description: 'Express delivery across Europe with careful packaging to ensure your components arrive perfectly.',
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  },
  {
    icon: HeadphonesIcon,
    title: 'Expert Support',
    description: 'Our team of PC enthusiasts provides technical assistance for builds and upgrades.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  },
  {
    icon: Shield,
    title: 'Price Guarantee',
    description: 'Competitive pricing with our price-match guarantee. Find it cheaper, we\'ll match it.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10'
  }
]

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '500+', label: 'Products' },
  { value: '24h', label: 'Average Shipping' },
  { value: '99.9%', label: 'Satisfaction Rate' }
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-20 lg:py-32">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
        <div class="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-primary/5 to-transparent blur-3xl" />
      </div>
      
      <div class="container relative">
        <div class="max-w-3xl">
          <span class="inline-block px-3 py-1 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary">
            About ForgePC
          </span>
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            Built by Enthusiasts,
            <span class="text-primary">For Enthusiasts</span>
          </h1>
          <p class="text-xl text-muted-foreground leading-relaxed mb-8">
            At ForgePC, we believe everyone deserves access to premium PC hardware. 
            We've built our reputation on quality, expertise, and exceptional customer service.
          </p>
          <div class="flex flex-wrap gap-4">
            <Button size="lg" class="shadow-lg shadow-primary/25" as-child>
              <NuxtLink to="/products">
                Shop Now
                <ArrowRight class="ml-2 h-4 w-4" />
              </NuxtLink>
            </Button>
            <Button variant="outline" size="lg" as-child>
              <NuxtLink to="/contact">Contact Us</NuxtLink>
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-16 border-y bg-muted/30">
      <div class="container">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <div class="text-4xl font-bold text-primary mb-2">{{ stat.value }}</div>
            <div class="text-sm text-muted-foreground">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 lg:py-28">
      <div class="container">
        <div class="text-center max-w-2xl mx-auto mb-16">
          <h2 class="text-3xl font-bold tracking-tight mb-4">Why Choose Us?</h2>
          <p class="text-muted-foreground text-lg">
            We're committed to providing the best shopping experience for PC builders.
          </p>
        </div>
        
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card v-for="feature in features" :key="feature.title" class="border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent class="p-6">
              <div :class="[feature.bg, 'w-12 h-12 rounded-xl flex items-center justify-center mb-4']">
                <component :is="feature.icon" :class="[feature.color, 'w-6 h-6']" />
              </div>
              <h3 class="font-semibold text-lg mb-2">{{ feature.title }}</h3>
              <p class="text-muted-foreground text-sm leading-relaxed">{{ feature.description }}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div class="container text-center">
        <h2 class="text-3xl font-bold mb-4">Ready to Build Your Dream PC?</h2>
        <p class="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
          Browse our extensive catalog of premium components and start building today.
        </p>
        <Button size="lg" class="shadow-lg shadow-primary/25" as-child>
          <NuxtLink to="/products">
            Explore Products
            <ArrowRight class="ml-2 h-4 w-4" />
          </NuxtLink>
        </Button>
      </div>
    </section>
  </div>
</template>
