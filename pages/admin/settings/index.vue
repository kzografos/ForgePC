<script setup lang="ts">
import { Settings, Store, Palette, Bell, Shield, Globe } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

// Settings state
const settings = ref({
  storeName: 'ForgePC',
  storeEmail: 'support@forgepc.com',
  currency: 'EUR',
  language: 'el',
  emailNotifications: true,
  orderNotifications: true,
  lowStockAlerts: true
})

const saving = ref(false)

// Save settings
const handleSave = async () => {
  saving.value = true
  // Simulate save
  await new Promise(resolve => setTimeout(resolve, 1000))
  toast.success('Settings saved successfully')
  saving.value = false
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">Settings</h1>
      <p class="text-slate-400">Configure your store preferences</p>
    </div>

    <div class="space-y-6">
      <!-- Store Settings -->
      <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20">
            <Store class="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-white">Store Information</h2>
            <p class="text-sm text-slate-400">Basic store details</p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">Store Name</label>
            <input
              v-model="settings.storeName"
              type="text"
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-violet-500/50"
            />
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">Contact Email</label>
            <input
              v-model="settings.storeEmail"
              type="email"
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-violet-500/50"
            />
          </div>
        </div>
      </div>

      <!-- Localization -->
      <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20">
            <Globe class="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-white">Localization</h2>
            <p class="text-sm text-slate-400">Regional settings</p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">Currency</label>
            <select
              v-model="settings.currency"
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-violet-500/50"
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="GBP">British Pound (£)</option>
            </select>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-300">Language</label>
            <select
              v-model="settings.language"
              class="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-violet-500/50"
            >
              <option value="el">Greek</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div class="flex items-center gap-3 mb-6">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
            <Bell class="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-white">Notifications</h2>
            <p class="text-sm text-slate-400">Manage alerts and notifications</p>
          </div>
        </div>

        <div class="space-y-4">
          <label class="flex items-center justify-between cursor-pointer">
            <div>
              <p class="font-medium text-white">Email Notifications</p>
              <p class="text-sm text-slate-400">Receive updates via email</p>
            </div>
            <div class="relative">
              <input type="checkbox" v-model="settings.emailNotifications" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-violet-500 transition-colors" />
              <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
          </label>

          <label class="flex items-center justify-between cursor-pointer">
            <div>
              <p class="font-medium text-white">Order Notifications</p>
              <p class="text-sm text-slate-400">Get notified for new orders</p>
            </div>
            <div class="relative">
              <input type="checkbox" v-model="settings.orderNotifications" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-violet-500 transition-colors" />
              <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
          </label>

          <label class="flex items-center justify-between cursor-pointer">
            <div>
              <p class="font-medium text-white">Low Stock Alerts</p>
              <p class="text-sm text-slate-400">Alert when products are running low</p>
            </div>
            <div class="relative">
              <input type="checkbox" v-model="settings.lowStockAlerts" class="sr-only peer" />
              <div class="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:bg-violet-500 transition-colors" />
              <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
            </div>
          </label>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button
          @click="handleSave"
          :disabled="saving"
          class="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-6 py-3 font-medium text-white transition-colors hover:bg-violet-600 disabled:opacity-50"
        >
          <Settings v-if="!saving" class="h-5 w-5" />
          <span v-if="saving">Saving...</span>
          <span v-else>Save Settings</span>
        </button>
      </div>
    </div>
  </div>
</template>
