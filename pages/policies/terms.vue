<script setup lang="ts">
import { FileText, ShoppingBag, CreditCard, Truck, Shield, Scale, AlertTriangle } from 'lucide-vue-next'

useSeoMeta({
  title: 'Terms of Service - ForgePC',
  description: 'Read our terms and conditions for using the ForgePC website and purchasing our products.'
})

const lastUpdated = 'January 15, 2026'

const sections = [
  {
    icon: FileText,
    title: 'Acceptance of Terms',
    content: `By accessing and using the ForgePC website (the "Site") and purchasing our products, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Site.

These Terms constitute a legally binding agreement between you and ForgePC ("we", "us", or "our"). We reserve the right to update these Terms at any time, and your continued use of the Site constitutes acceptance of any changes.`
  },
  {
    icon: ShoppingBag,
    title: 'Products & Orders',
    content: `**Product Information**: We strive to display accurate product descriptions, specifications, and pricing. However, we do not warrant that product descriptions or other content is accurate, complete, or error-free.

**Order Acceptance**: All orders are subject to acceptance. We reserve the right to refuse or cancel any order for any reason, including but not limited to product availability, errors in pricing, or suspected fraud.

**Pricing**: Prices are displayed in Euros (€) and are subject to change without notice. Applicable taxes and shipping charges will be added at checkout.

**Availability**: Product availability is subject to change. If a product becomes unavailable after your order is placed, we will notify you and offer alternatives or a full refund.`
  },
  {
    icon: CreditCard,
    title: 'Payment Terms',
    content: `**Payment Methods**: We accept major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for orders over €500.

**Payment Processing**: All payments are processed securely through our third-party payment provider, Stripe. We do not store your full credit card details on our servers.

**Currency**: All transactions are processed in Euros (€). If paying in another currency, your bank may apply conversion fees.

**Payment Failure**: If payment fails, your order will not be processed. You may attempt to place the order again with valid payment information.`
  },
  {
    icon: Truck,
    title: 'Shipping & Delivery',
    content: `**Shipping Times**: Estimated delivery times are provided for informational purposes and are not guaranteed. Delays may occur due to factors beyond our control.

**Risk of Loss**: Risk of loss and title for products pass to you upon delivery to the carrier.

**Customs & Duties**: For international orders, you are responsible for any customs duties, taxes, or import fees imposed by your country.

**Address Accuracy**: You are responsible for providing accurate shipping information. We are not liable for delays or non-delivery due to incorrect addresses.`
  },
  {
    icon: Shield,
    title: 'Warranty & Liability',
    content: `**Product Warranty**: Products are covered by the manufacturer's warranty. Warranty terms vary by product and manufacturer.

**Limitation of Liability**: To the maximum extent permitted by law, ForgePC shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our products or services.

**Maximum Liability**: Our total liability for any claim shall not exceed the amount you paid for the specific product giving rise to the claim.

**Disclaimer**: Products are provided "as is" without warranties of any kind, except as expressly stated in the manufacturer's warranty.`
  },
  {
    icon: Scale,
    title: 'Intellectual Property',
    content: `**Ownership**: All content on this Site, including text, graphics, logos, images, and software, is the property of ForgePC or its licensors and is protected by intellectual property laws.

**Limited License**: You are granted a limited, non-exclusive license to access and use the Site for personal, non-commercial purposes.

**Restrictions**: You may not reproduce, distribute, modify, or create derivative works from any content on this Site without our prior written consent.`
  },
  {
    icon: AlertTriangle,
    title: 'Governing Law & Disputes',
    content: `**Governing Law**: These Terms are governed by the laws of the Hellenic Republic (Greece), without regard to its conflict of law provisions.

**Dispute Resolution**: Any disputes arising from these Terms or your use of our Site shall be resolved through good-faith negotiation. If negotiation fails, disputes shall be submitted to the competent courts of Athens, Greece.

**Severability**: If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.

**Entire Agreement**: These Terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and ForgePC.`
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
          <FileText class="w-8 h-8 text-primary" />
        </div>
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          Terms of Service
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          Please read these terms carefully before using our website or making a purchase.
        </p>
        <p class="text-sm text-muted-foreground">
          Last Updated: {{ lastUpdated }}
        </p>
      </div>
    </section>

    <!-- Content Sections -->
    <section class="py-16 lg:py-24">
      <div class="container">
        <div class="max-w-4xl mx-auto space-y-12">
          <div 
            v-for="(section, index) in sections" 
            :key="section.title"
            class="border-b border-border pb-12 last:border-0"
          >
            <div class="flex items-center gap-4 mb-6">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <component :is="section.icon" class="w-6 h-6 text-primary" />
              </div>
              <h2 class="text-2xl font-bold">
                <span class="text-muted-foreground mr-2">{{ index + 1 }}.</span>
                {{ section.title }}
              </h2>
            </div>
            <div 
              class="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line"
              v-html="section.content.replace(/\*\*(.*?)\*\*/g, '<strong class=\'text-foreground\'>$1</strong>')"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section class="py-16 bg-muted/30">
      <div class="container text-center">
        <h2 class="text-2xl font-bold mb-4">Questions About These Terms?</h2>
        <p class="text-muted-foreground mb-6 max-w-xl mx-auto">
          If you have any questions about our Terms of Service, please don't hesitate to contact us.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="mailto:legal@forgepc.com"
            class="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            legal@forgepc.com
          </a>
          <NuxtLink 
            to="/contact" 
            class="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            Contact Form
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
