<script setup lang="ts">
import { Shield, Eye, Lock, UserCheck, Database, Mail } from 'lucide-vue-next'

useSeoMeta({
  title: 'Privacy Policy - ForgePC',
  description: 'Learn how we collect, use, and protect your personal information at ForgePC.'
})

const lastUpdated = 'January 15, 2026'

const sections = [
  {
    icon: Database,
    title: 'Information We Collect',
    content: `We collect information you provide directly to us, including:
    
• **Personal Information**: Name, email address, phone number, and shipping address when you create an account or place an order.

• **Payment Information**: Credit card details and billing address, which are securely processed by our payment providers (Stripe).

• **Order History**: Records of your purchases, returns, and customer service interactions.

• **Device Information**: IP address, browser type, and device identifiers for security and analytics purposes.`
  },
  {
    icon: Eye,
    title: 'How We Use Your Information',
    content: `We use the information we collect to:

• Process and fulfill your orders, including shipping and delivery notifications.

• Send you order confirmations, receipts, and customer service communications.

• Improve our products, services, and website functionality.

• Personalize your shopping experience with relevant product recommendations.

• Detect and prevent fraud or other unauthorized activities.

• Comply with legal obligations and protect our rights.`
  },
  {
    icon: UserCheck,
    title: 'Information Sharing',
    content: `We do not sell your personal information. We may share your information with:

• **Service Providers**: Shipping carriers, payment processors, and analytics services that help us operate our business.

• **Legal Requirements**: When required by law, court order, or to protect our rights and safety.

• **Business Transfers**: In connection with a merger, acquisition, or sale of assets.

All third parties are required to protect your information and use it only for the purposes we specify.`
  },
  {
    icon: Lock,
    title: 'Data Security',
    content: `We implement industry-standard security measures including:

• **Encryption**: All data transmitted between your browser and our servers is encrypted using SSL/TLS.

• **Secure Storage**: Your data is stored on secure servers with restricted access.

• **Payment Security**: We are PCI-DSS compliant and never store full credit card numbers on our servers.

• **Regular Audits**: We conduct regular security assessments and updates.`
  },
  {
    icon: Shield,
    title: 'Your Rights',
    content: `Under GDPR and applicable privacy laws, you have the right to:

• **Access**: Request a copy of the personal data we hold about you.

• **Rectification**: Request correction of inaccurate personal data.

• **Erasure**: Request deletion of your personal data under certain circumstances.

• **Data Portability**: Receive your data in a structured, machine-readable format.

• **Opt-Out**: Unsubscribe from marketing communications at any time.

To exercise these rights, please contact us at privacy@forgepc.com.`
  },
  {
    icon: Mail,
    title: 'Cookies & Tracking',
    content: `We use cookies and similar technologies to:

• Keep you logged in and remember your preferences.

• Analyze website traffic and usage patterns.

• Provide personalized content and advertisements.

You can manage cookie preferences through your browser settings. Note that disabling cookies may affect website functionality.`
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
          <Shield class="w-8 h-8 text-primary" />
        </div>
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          Privacy Policy
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
            v-for="section in sections" 
            :key="section.title"
            class="border-b border-border pb-12 last:border-0"
          >
            <div class="flex items-center gap-4 mb-6">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <component :is="section.icon" class="w-6 h-6 text-primary" />
              </div>
              <h2 class="text-2xl font-bold">{{ section.title }}</h2>
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
        <h2 class="text-2xl font-bold mb-4">Questions About Privacy?</h2>
        <p class="text-muted-foreground mb-6 max-w-xl mx-auto">
          If you have any questions about this Privacy Policy, please contact our Data Protection Officer.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="mailto:privacy@forgepc.com"
            class="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            privacy@forgepc.com
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
