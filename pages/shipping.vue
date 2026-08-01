<script setup lang="ts">
import { Truck, Clock, MapPin, Package, CheckCircle, Globe } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'

useSeoMeta({
  title: 'Shipping Information - ForgePC',
  description: 'Learn about our shipping options, delivery times, and shipping zones across Europe and worldwide.'
})

const shippingMethods = [
  {
    icon: Truck,
    name: 'Standard Shipping',
    time: '3-5 Business Days',
    price: '€9.99',
    freeAbove: '€100',
    description: 'Reliable delivery for non-urgent orders',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10'
  },
  {
    icon: Clock,
    name: 'Express Shipping',
    time: '1-2 Business Days',
    price: '€19.99',
    freeAbove: '€300',
    description: 'Fast delivery for when you need it quick',
    color: 'text-green-500',
    bg: 'bg-green-500/10'
  },
  {
    icon: Package,
    name: 'Same Day Delivery',
    time: 'Same Day',
    price: '€29.99',
    freeAbove: null,
    description: 'Available in select cities (order by 2 PM)',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  }
]

const shippingZones = [
  {
    zone: 'Zone 1 - EU Core',
    countries: 'Germany, France, Netherlands, Belgium, Austria',
    standard: '2-3 days',
    express: '1 day'
  },
  {
    zone: 'Zone 2 - EU Extended',
    countries: 'Italy, Spain, Portugal, Poland, Czech Republic',
    standard: '3-5 days',
    express: '1-2 days'
  },
  {
    zone: 'Zone 3 - EU Periphery',
    countries: 'Greece, Finland, Ireland, Romania, Bulgaria',
    standard: '4-6 days',
    express: '2-3 days'
  },
  {
    zone: 'Zone 4 - International',
    countries: 'UK, Switzerland, Norway, USA, Canada',
    standard: '7-14 days',
    express: '3-5 days'
  }
]

const features = [
  { icon: CheckCircle, text: 'Tracking number for all orders' },
  { icon: CheckCircle, text: 'Insurance included on orders over €200' },
  { icon: CheckCircle, text: 'Signature required for high-value items' },
  { icon: CheckCircle, text: 'Eco-friendly packaging materials' }
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
          <Truck class="w-8 h-8 text-primary" />
        </div>
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          Shipping Information
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          Fast, reliable shipping across Europe and worldwide. Free shipping on orders over €100.
        </p>
      </div>
    </section>

    <!-- Shipping Methods -->
    <section class="py-16 border-b">
      <div class="container">
        <h2 class="text-2xl font-bold text-center mb-12">Shipping Options</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <Card 
            v-for="method in shippingMethods" 
            :key="method.name"
            class="border-0 bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all"
          >
            <CardContent class="p-6 text-center">
              <div :class="[method.bg, 'w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4']">
                <component :is="method.icon" :class="[method.color, 'w-7 h-7']" />
              </div>
              <h3 class="font-semibold text-lg mb-2">{{ method.name }}</h3>
              <p class="text-2xl font-bold text-primary mb-1">{{ method.price }}</p>
              <p class="text-muted-foreground text-sm mb-3">{{ method.time }}</p>
              <p class="text-sm text-muted-foreground">{{ method.description }}</p>
              <p v-if="method.freeAbove" class="text-xs text-green-500 mt-3">
                Free on orders over {{ method.freeAbove }}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- Shipping Zones -->
    <section class="py-16 lg:py-24">
      <div class="container">
        <div class="flex items-center gap-4 justify-center mb-12">
          <Globe class="w-8 h-8 text-primary" />
          <h2 class="text-2xl font-bold">Shipping Zones & Delivery Times</h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-border">
                <th class="text-left py-4 px-4 font-semibold">Zone</th>
                <th class="text-left py-4 px-4 font-semibold">Countries</th>
                <th class="text-center py-4 px-4 font-semibold">Standard</th>
                <th class="text-center py-4 px-4 font-semibold">Express</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="zone in shippingZones" 
                :key="zone.zone"
                class="border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <td class="py-4 px-4 font-medium">{{ zone.zone }}</td>
                <td class="py-4 px-4 text-muted-foreground text-sm">{{ zone.countries }}</td>
                <td class="py-4 px-4 text-center">{{ zone.standard }}</td>
                <td class="py-4 px-4 text-center text-green-500">{{ zone.express }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 bg-muted/30">
      <div class="container">
        <h2 class="text-2xl font-bold text-center mb-8">What's Included</h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="feature in features" 
            :key="feature.text"
            class="flex items-center gap-3"
          >
            <component :is="feature.icon" class="w-5 h-5 text-green-500 flex-shrink-0" />
            <span class="text-sm">{{ feature.text }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="py-16">
      <div class="container text-center">
        <h2 class="text-2xl font-bold mb-4">Questions About Shipping?</h2>
        <p class="text-muted-foreground mb-6 max-w-xl mx-auto">
          Our team is ready to help with any shipping inquiries or special delivery requirements.
        </p>
        <NuxtLink 
          to="/contact" 
          class="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
        >
          Contact Us
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
