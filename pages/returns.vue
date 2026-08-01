<script setup lang="ts">
import { RefreshCw, Package, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'

useSeoMeta({
  title: 'Returns & Refunds - ForgePC',
  description: 'Learn about our 30-day return policy, refund process, and how to return or exchange products.'
})

const returnSteps = [
  {
    step: 1,
    title: 'Initiate Return',
    description: 'Log into your account, go to Order History, and click "Return Item" on the order you want to return.'
  },
  {
    step: 2,
    title: 'Print Label',
    description: 'We\'ll email you a prepaid return shipping label. Print it and attach it to your package.'
  },
  {
    step: 3,
    title: 'Ship It Back',
    description: 'Drop off the package at any authorized shipping location. Keep the receipt for tracking.'
  },
  {
    step: 4,
    title: 'Get Refunded',
    description: 'Once we receive and inspect your return, your refund will be processed within 3-5 business days.'
  }
]

const eligibleItems = [
  'Unopened products in original packaging',
  'Products with all accessories and manuals',
  'Items purchased within the last 30 days',
  'Products without physical damage',
  'Items with original receipt or order confirmation'
]

const nonEligibleItems = [
  'Opened software or digital products',
  'Custom-built or configured systems',
  'Products with missing components',
  'Items damaged by misuse',
  'Products purchased over 30 days ago'
]

const policies = [
  {
    title: 'Refund Timeline',
    value: '3-5 Days',
    description: 'After we receive your return'
  },
  {
    title: 'Return Window',
    value: '30 Days',
    description: 'From date of delivery'
  },
  {
    title: 'Return Shipping',
    value: 'Free',
    description: 'For defective products'
  }
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 py-16 lg:py-24">
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-1/2 -right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl" />
      </div>
      
      <div class="container relative text-center">
        <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <RefreshCw class="w-8 h-8 text-primary" />
        </div>
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          Returns & Refunds
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          Hassle-free 30-day returns. We want you to be completely satisfied with your purchase.
        </p>
      </div>
    </section>

    <!-- Policy Highlights -->
    <section class="py-12 border-b">
      <div class="container">
        <div class="grid md:grid-cols-3 gap-6">
          <Card 
            v-for="policy in policies" 
            :key="policy.title"
            class="border-0 bg-gradient-to-br from-card to-card/50 text-center"
          >
            <CardContent class="p-6">
              <p class="text-sm text-muted-foreground mb-1">{{ policy.title }}</p>
              <p class="text-3xl font-bold text-primary mb-1">{{ policy.value }}</p>
              <p class="text-sm text-muted-foreground">{{ policy.description }}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- Return Process -->
    <section class="py-16 lg:py-24">
      <div class="container">
        <h2 class="text-2xl font-bold text-center mb-12">How to Return an Item</h2>
        <div class="grid md:grid-cols-4 gap-6">
          <div 
            v-for="(item, index) in returnSteps" 
            :key="item.step"
            class="relative"
          >
            <Card class="border-0 bg-gradient-to-br from-card to-card/50 h-full">
              <CardContent class="p-6">
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span class="text-primary font-bold">{{ item.step }}</span>
                </div>
                <h3 class="font-semibold mb-2">{{ item.title }}</h3>
                <p class="text-sm text-muted-foreground leading-relaxed">{{ item.description }}</p>
              </CardContent>
            </Card>
            <!-- Arrow connector -->
            <div 
              v-if="index < returnSteps.length - 1" 
              class="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10"
            >
              <ArrowRight class="w-6 h-6 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Eligibility -->
    <section class="py-16 bg-muted/30">
      <div class="container">
        <h2 class="text-2xl font-bold text-center mb-12">Return Eligibility</h2>
        <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Eligible -->
          <Card class="border-0 bg-gradient-to-br from-card to-card/50">
            <CardContent class="p-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle class="w-5 h-5 text-green-500" />
                </div>
                <h3 class="font-semibold text-lg">Eligible for Return</h3>
              </div>
              <ul class="space-y-3">
                <li 
                  v-for="item in eligibleItems" 
                  :key="item"
                  class="flex items-start gap-3"
                >
                  <CheckCircle class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span class="text-sm text-muted-foreground">{{ item }}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <!-- Not Eligible -->
          <Card class="border-0 bg-gradient-to-br from-card to-card/50">
            <CardContent class="p-6">
              <div class="flex items-center gap-3 mb-6">
                <div class="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle class="w-5 h-5 text-red-500" />
                </div>
                <h3 class="font-semibold text-lg">Not Eligible</h3>
              </div>
              <ul class="space-y-3">
                <li 
                  v-for="item in nonEligibleItems" 
                  :key="item"
                  class="flex items-start gap-3"
                >
                  <XCircle class="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span class="text-sm text-muted-foreground">{{ item }}</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="py-16">
      <div class="container text-center">
        <h2 class="text-2xl font-bold mb-4">Need Help With a Return?</h2>
        <p class="text-muted-foreground mb-6 max-w-xl mx-auto">
          Our support team can guide you through the process or help with any questions.
        </p>
        <NuxtLink 
          to="/contact" 
          class="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          Contact Support
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
