<script setup lang="ts">
import { CheckCircle, Package, ShoppingBag, Loader2, AlertCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useCartStore } from '~/stores/cart'

definePageMeta({
  layout: 'checkout'
})

const route = useRoute()
const cartStore = useCartStore()
const sessionId = computed(() => route.query.session_id as string)

const loading = ref(true)
const error = ref<string | null>(null)
const orderData = ref<{
  success: boolean
  status: string
  orderNumber: string | null
  total?: number
} | null>(null)

// Verify payment session on mount
onMounted(async () => {
  if (!sessionId.value) {
    error.value = 'No session ID provided'
    loading.value = false
    return
  }

  try {
    // Use $fetch for client-side API calls (not useFetch which is for SSR)
    const result = await $fetch('/api/stripe/verify-session', {
      query: { session_id: sessionId.value }
    })

    orderData.value = result as any

    if (orderData.value?.success) {
      // Clear local cart after successful payment verification
      cartStore.clearCart()
    }
  } catch (e: any) {
    error.value = e.data?.statusMessage || e.message || 'Failed to verify payment'
  } finally {
    loading.value = false
  }
})

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(price)
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12">
    <div class="container max-w-lg">
      <div class="relative">
        <!-- Glassmorphism effect -->
        <div 
          :class="[
            'absolute inset-0 rounded-3xl blur-xl',
            loading ? 'bg-gradient-to-br from-primary/20 to-primary/10' : 
            error || !orderData?.success ? 'bg-gradient-to-br from-red-500/20 to-red-500/10' :
            'bg-gradient-to-br from-green-500/20 to-primary/10'
          ]" 
        />
        
        <div class="relative bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl">
          <!-- Loading State -->
          <template v-if="loading">
            <div class="mb-6">
              <div class="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                <Loader2 class="w-10 h-10 text-primary animate-spin" />
              </div>
            </div>
            <h1 class="text-2xl font-bold mb-3">Verifying Payment...</h1>
            <p class="text-muted-foreground">Please wait while we confirm your payment.</p>
          </template>

          <!-- Error State -->
          <template v-else-if="error || !orderData?.success">
            <div class="mb-6">
              <div class="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle class="w-10 h-10 text-red-500" />
              </div>
            </div>
            <h1 class="text-2xl font-bold mb-3">Payment Issue</h1>
            <p class="text-muted-foreground mb-6">
              {{ error || 'Your payment could not be verified. Please contact support.' }}
            </p>
            <Button as-child>
              <NuxtLink to="/cart">Return to Cart</NuxtLink>
            </Button>
          </template>

          <!-- Success State -->
          <template v-else>
            <!-- Success Icon -->
            <div class="relative mb-6">
              <div class="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle class="w-10 h-10 text-green-500" />
              </div>
              <!-- Animated ring -->
              <div class="absolute inset-0 w-20 h-20 mx-auto rounded-full border-2 border-green-500/30 animate-ping" />
            </div>

            <!-- Title -->
            <h1 class="text-3xl md:text-4xl font-bold mb-3">
              Payment Successful!
            </h1>
            <p class="text-muted-foreground mb-6">
              Thank you for your purchase. Your order has been placed successfully.
            </p>

            <!-- Order Number -->
            <div class="bg-muted/30 rounded-xl p-4 mb-8 border border-white/5">
              <p class="text-sm text-muted-foreground mb-1">Order Number</p>
              <p class="text-xl font-mono font-bold text-primary">
                {{ orderData.orderNumber || 'Processing...' }}
              </p>
              <p v-if="orderData.total" class="text-sm text-muted-foreground mt-2">
                Total: {{ formatPrice(orderData.total) }}
              </p>
            </div>

            <!-- Info -->
            <div class="space-y-3 text-sm text-muted-foreground mb-8">
              <div class="flex items-center justify-center gap-2">
                <Package class="w-4 h-4" />
                <span>Your order is confirmed — view it anytime in your account.</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-col sm:flex-row gap-3">
              <Button as-child variant="outline" class="flex-1 border-white/10 hover:bg-white/10">
                <NuxtLink to="/account/orders">
                  <Package class="mr-2 h-4 w-4" />
                  View Orders
                </NuxtLink>
              </Button>
              <Button as-child class="flex-1 shadow-lg shadow-primary/25">
                <NuxtLink to="/products">
                  <ShoppingBag class="mr-2 h-4 w-4" />
                  Continue Shopping
                </NuxtLink>
              </Button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
