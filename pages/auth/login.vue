<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

definePageMeta({
  layout: 'auth'
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

// Demo accounts printed on the login screen (HIGH-1).
// NOTE: these strings must match the Supabase Auth users you provisioned.
const demoAccounts = [
  { label: 'Admin', email: 'admin@forgepc.dev', password: 'DemoAdmin123' },
  { label: 'Shopper', email: 'shopper@forgepc.dev', password: 'DemoUser123' },
]
const fillDemo = (account: { email: string; password: string }) => {
  email.value = account.email
  password.value = account.password
}

watch(user, () => {
  if (user.value) {
    router.push('/')
  }
})

const handleLogin = async () => {
    loading.value = true
    error.value = null
    try {
        const { error: err } = await client.auth.signInWithPassword({
            email: email.value,
            password: password.value
        })
        if (err) throw err
        router.push('/')
    } catch (e: any) {
        error.value = e.message
        
        // Track failed login attempt for security alerts
        try {
          await $fetch('/api/auth/track-failed-attempt', {
            method: 'POST',
            body: { email: email.value }
          })
        } catch (trackError) {
          // Silent fail - don't expose tracking to user
          console.error('Failed to track login attempt:', trackError)
        }
    } finally {
        loading.value = false
    }
}

</script>

<template>
  <div class="grid gap-6">
    <div class="grid gap-2 text-center">
      <h1 class="text-2xl font-bold">Welcome back</h1>
      <p class="text-muted-foreground text-sm">
        Enter your credentials to access your account
      </p>
    </div>

    <!-- Demo accounts (HIGH-1) -->
    <div class="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
      <p class="mb-3 font-medium text-foreground">
        Demo accounts
        <span class="font-normal text-muted-foreground">— click to fill</span>
      </p>
      <div class="grid gap-2">
        <button
          v-for="account in demoAccounts"
          :key="account.email"
          type="button"
          class="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-white/10"
          @click="fillDemo(account)"
        >
          <span class="min-w-0">
            <span class="font-medium text-foreground">{{ account.label }}</span>
            <span class="block truncate text-xs text-muted-foreground">{{ account.email }}</span>
          </span>
          <span class="shrink-0 text-xs font-medium text-primary">Use &rarr;</span>
        </button>
      </div>
    </div>

    <form @submit.prevent="handleLogin">
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            placeholder="name@example.com"
            type="email"
            auto-capitalize="none"
            auto-complete="email"
            auto-correct="off"
            v-model="email"
            required
          />
        </div>
        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            type="password"
            auto-complete="current-password"
            v-model="password"
            required
          />
        </div>
        
        <div v-if="error" class="text-sm text-destructive">
          {{ error }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="inline-flex w-full items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          Sign In
        </button>
      </div>
    </form>
    
    <div class="text-center text-sm">
      Don't have an account? 
      <NuxtLink to="/auth/register" class="underline hover:text-primary">
        Sign up
      </NuxtLink>
    </div>
  </div>
</template>
