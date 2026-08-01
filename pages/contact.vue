<script setup lang="ts">
import { Mail, Clock, MapPin, Send, Loader2, CheckCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

useSeoMeta({
  title: 'Contact Us - ForgePC',
  description: 'Get in touch with our team for support, inquiries, or partnership opportunities.'
})

// Form state
const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const errors = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)
const isSuccess = ref(false)

// Validation
const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validateForm = () => {
  let isValid = true
  
  // Reset errors
  errors.name = ''
  errors.email = ''
  errors.subject = ''
  errors.message = ''
  
  if (!form.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  }
  
  if (!form.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!validateEmail(form.email)) {
    errors.email = 'Please enter a valid email'
    isValid = false
  }
  
  if (!form.subject.trim()) {
    errors.subject = 'Subject is required'
    isValid = false
  }
  
  if (!form.message.trim()) {
    errors.message = 'Message is required'
    isValid = false
  } else if (form.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  isSubmitting.value = false
  isSuccess.value = true
  
  // Reset form
  form.name = ''
  form.email = ''
  form.subject = ''
  form.message = ''
}

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    details: 'support@forgepc.com',
    subtext: 'We reply within 24 hours'
  },
  {
    icon: Clock,
    title: 'Office Hours',
    details: 'Mon - Fri: 9:00 - 18:00',
    subtext: 'Sat: 10:00 - 14:00 (CET)'
  },
  {
    icon: MapPin,
    title: 'Location',
    details: 'Athens, Greece',
    subtext: 'European Union'
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
        <span class="inline-block px-3 py-1 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary">
          Get in Touch
        </span>
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
          We'd Love to Hear From You
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have a question, need support, or want to discuss a partnership? Our team is ready to help.
        </p>
      </div>
    </section>

    <!-- Contact Cards -->
    <section class="py-12 border-b">
      <div class="container">
        <div class="grid md:grid-cols-3 gap-6">
          <Card v-for="info in contactInfo" :key="info.title" class="text-center border-0 bg-gradient-to-br from-card to-card/50">
            <CardContent class="p-6">
              <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <component :is="info.icon" class="w-6 h-6 text-primary" />
              </div>
              <h3 class="font-semibold mb-1">{{ info.title }}</h3>
              <p class="text-foreground font-medium">{{ info.details }}</p>
              <p class="text-sm text-muted-foreground">{{ info.subtext }}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- Contact Form Section -->
    <section class="py-16 lg:py-24">
      <div class="container">
        <div class="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <!-- Info Side -->
          <div>
            <h2 class="text-3xl font-bold tracking-tight mb-6">Send Us a Message</h2>
            <p class="text-muted-foreground text-lg mb-8 leading-relaxed">
              Fill out the form and our team will get back to you within 24 hours. 
              For urgent inquiries, mention "URGENT" in your subject line.
            </p>
            
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail class="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 class="font-medium mb-1">Customer Support</h4>
                  <p class="text-muted-foreground text-sm">For order inquiries, returns, and general support</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail class="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h4 class="font-medium mb-1">Technical Questions</h4>
                  <p class="text-muted-foreground text-sm">Need help with compatibility or build advice</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Mail class="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h4 class="font-medium mb-1">Business Inquiries</h4>
                  <p class="text-muted-foreground text-sm">Partnerships, wholesale, and B2B opportunities</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Side -->
          <Card class="border-0 shadow-xl bg-gradient-to-br from-card to-card/80">
            <CardHeader>
              <CardTitle>Contact Form</CardTitle>
              <CardDescription>All fields are required</CardDescription>
            </CardHeader>
            <CardContent>
              <!-- Success Message -->
              <div v-if="isSuccess" class="text-center py-8">
                <div class="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle class="w-8 h-8 text-green-500" />
                </div>
                <h3 class="text-xl font-semibold mb-2">Message Sent!</h3>
                <p class="text-muted-foreground mb-6">We'll get back to you within 24 hours.</p>
                <Button variant="outline" @click="isSuccess = false">Send Another Message</Button>
              </div>
              
              <!-- Form -->
              <form v-else @submit.prevent="handleSubmit" class="space-y-5">
                <div class="space-y-2">
                  <label class="text-sm font-medium" for="name">Full Name</label>
                  <Input 
                    id="name"
                    v-model="form.name" 
                    placeholder="John Doe"
                    :class="errors.name ? 'border-destructive' : ''"
                  />
                  <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
                </div>
                
                <div class="space-y-2">
                  <label class="text-sm font-medium" for="email">Email Address</label>
                  <Input 
                    id="email"
                    type="email"
                    v-model="form.email" 
                    placeholder="john@example.com"
                    :class="errors.email ? 'border-destructive' : ''"
                  />
                  <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
                </div>
                
                <div class="space-y-2">
                  <label class="text-sm font-medium" for="subject">Subject</label>
                  <Input 
                    id="subject"
                    v-model="form.subject" 
                    placeholder="How can we help?"
                    :class="errors.subject ? 'border-destructive' : ''"
                  />
                  <p v-if="errors.subject" class="text-sm text-destructive">{{ errors.subject }}</p>
                </div>
                
                <div class="space-y-2">
                  <label class="text-sm font-medium" for="message">Message</label>
                  <textarea 
                    id="message"
                    v-model="form.message" 
                    placeholder="Tell us more about your inquiry..."
                    rows="5"
                    class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    :class="errors.message ? 'border-destructive' : ''"
                  />
                  <p v-if="errors.message" class="text-sm text-destructive">{{ errors.message }}</p>
                </div>
                
                <Button type="submit" class="w-full shadow-lg" :disabled="isSubmitting">
                  <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                  <Send v-else class="mr-2 h-4 w-4" />
                  {{ isSubmitting ? 'Sending...' : 'Send Message' }}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  </div>
</template>
