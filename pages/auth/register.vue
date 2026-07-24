<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'auth'
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

watch(user, () => {
  if (user.value) {
    router.push('/')
  }
})

const handleRegister = async () => {
    if (password.value !== confirmPassword.value) {
        error.value = "Passwords do not match"
        return
    }

    loading.value = true
    error.value = null
    try {
        const { error: err } = await client.auth.signUp({
            email: email.value,
            password: password.value,
            options: {
                data: {
                    full_name: fullName.value
                }
            }
        })
        if (err) throw err

        // Email confirmation is disabled for the demo, so signup returns a session
        // and signs the user straight in. The user watcher also redirects to '/'.
        toast.success("Account created — you're signed in")
        router.push('/')
    } catch (e: any) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="grid gap-6">
    <div class="grid gap-2 text-center">
      <h1 class="text-3xl font-bold">Create an account</h1>
      <p class="text-balance text-muted-foreground">
        Enter your information to create an account
      </p>
    </div>

    <form @submit.prevent="handleRegister">
      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="full-name">Full Name</Label>
          <Input id="full-name" placeholder="John Doe" v-model="fullName" required />
        </div>
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
          <Input id="password" type="password" v-model="password" required />
        </div>
        <div class="grid gap-2">
          <Label for="confirm-password">Confirm Password</Label>
          <Input id="confirm-password" type="password" v-model="confirmPassword" required />
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
          Create account
        </button>
      </div>
    </form>

    <div class="text-center text-sm">
      Already have an account?
      <NuxtLink to="/auth/login" class="underline hover:text-primary">
        Sign in
      </NuxtLink>
    </div>
  </div>
</template>
