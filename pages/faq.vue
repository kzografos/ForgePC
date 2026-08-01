<script setup lang="ts">
import { ChevronDown, HelpCircle, ShoppingCart, Truck, RefreshCw, CreditCard, Shield } from 'lucide-vue-next'
import { Card, CardContent } from '@/components/ui/card'

useSeoMeta({
  title: 'FAQ - ForgePC',
  description: 'Find answers to frequently asked questions about orders, shipping, returns, and more.'
})

const openIndex = ref<number | null>(null)

const toggleFaq = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index
}

const faqCategories = [
  {
    icon: ShoppingCart,
    title: 'Orders',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    questions: [
      {
        question: 'How do I track my order?',
        answer: 'Once your order ships, you\'ll receive an email with a tracking number. You can also view your order status in your account dashboard under "Order History".'
      },
      {
        question: 'Can I modify or cancel my order?',
        answer: 'Orders can be modified or cancelled within 1 hour of placement. After that, please contact our support team and we\'ll do our best to accommodate your request.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for orders over €500.'
      }
    ]
  },
  {
    icon: Truck,
    title: 'Shipping',
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    questions: [
      {
        question: 'How long does shipping take?',
        answer: 'Standard shipping takes 3-5 business days within the EU. Express shipping (1-2 days) is available for an additional fee. See our Shipping page for detailed information.'
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes! We ship to most countries worldwide. International shipping times vary from 5-14 business days depending on the destination.'
      },
      {
        question: 'Is shipping free?',
        answer: 'We offer free standard shipping on orders over €100 within the EU. For orders under €100, a flat rate of €9.99 applies.'
      }
    ]
  },
  {
    icon: RefreshCw,
    title: 'Returns & Refunds',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    questions: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 30-day return policy for most items. Products must be in original condition with all packaging. See our Returns page for full details.'
      },
      {
        question: 'How long do refunds take?',
        answer: 'Once we receive your return, refunds are processed within 3-5 business days. The refund will appear on your original payment method within 5-10 additional days.'
      },
      {
        question: 'Can I exchange an item?',
        answer: 'Yes! If you need a different product, simply return the original item and place a new order. For defective items, contact support for a direct exchange.'
      }
    ]
  },
  {
    icon: Shield,
    title: 'Warranty & Support',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    questions: [
      {
        question: 'What warranty do products have?',
        answer: 'All products come with manufacturer\'s warranty (typically 2-5 years). We also offer extended warranty options at checkout for additional peace of mind.'
      },
      {
        question: 'How do I get technical support?',
        answer: 'Our expert team is available via email, phone, or live chat. We can help with compatibility questions, build advice, and troubleshooting.'
      },
      {
        question: 'Are all products authentic?',
        answer: 'Absolutely. We source exclusively from authorized distributors and manufacturers. Every product comes with full warranty and authenticity guarantee.'
      }
    ]
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
          <HelpCircle class="w-8 h-8 text-primary" />
        </div>
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          Frequently Asked Questions
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find quick answers to common questions about orders, shipping, returns, and more.
        </p>
      </div>
    </section>

    <!-- FAQ Categories -->
    <section class="py-16 lg:py-24">
      <div class="container">
        <div class="space-y-12">
          <div v-for="(category, catIndex) in faqCategories" :key="category.title">
            <!-- Category Header -->
            <div class="flex items-center gap-4 mb-6">
              <div :class="[category.bg, 'w-12 h-12 rounded-xl flex items-center justify-center']">
                <component :is="category.icon" :class="[category.color, 'w-6 h-6']" />
              </div>
              <h2 class="text-2xl font-bold">{{ category.title }}</h2>
            </div>
            
            <!-- Questions -->
            <div class="space-y-4">
              <Card 
                v-for="(faq, index) in category.questions" 
                :key="index"
                class="border-0 bg-gradient-to-br from-card to-card/50 overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                @click="toggleFaq(catIndex * 10 + index)"
              >
                <CardContent class="p-0">
                  <div class="p-6">
                    <div class="flex items-center justify-between gap-4">
                      <h3 class="font-semibold text-lg">{{ faq.question }}</h3>
                      <ChevronDown 
                        class="w-5 h-5 text-muted-foreground transition-transform flex-shrink-0"
                        :class="{ 'rotate-180': openIndex === catIndex * 10 + index }"
                      />
                    </div>
                    <Transition
                      enter-active-class="transition-all duration-300 ease-out"
                      enter-from-class="opacity-0 max-h-0"
                      enter-to-class="opacity-100 max-h-40"
                      leave-active-class="transition-all duration-200 ease-in"
                      leave-from-class="opacity-100 max-h-40"
                      leave-to-class="opacity-0 max-h-0"
                    >
                      <p 
                        v-if="openIndex === catIndex * 10 + index" 
                        class="text-muted-foreground mt-4 leading-relaxed"
                      >
                        {{ faq.answer }}
                      </p>
                    </Transition>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact CTA -->
    <section class="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
      <div class="container text-center">
        <h2 class="text-2xl font-bold mb-4">Still Have Questions?</h2>
        <p class="text-muted-foreground mb-6 max-w-xl mx-auto">
          Our support team is here to help. Reach out and we'll get back to you within 24 hours.
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
