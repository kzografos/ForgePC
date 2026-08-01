<script setup lang="ts">
import { adminNavigation } from '~/config/admin.nav'
import { Menu, X, Search, Bell, LogOut, ChevronDown } from 'lucide-vue-next'
import { Toaster } from 'vue-sonner'

// Note: Middleware is defined in each admin page, not in layout

const user = useSupabaseUser()
const client = useSupabaseClient()
const route = useRoute()

// Sidebar state
const sidebarOpen = ref(true)
const mobileMenuOpen = ref(false)

// Toggle sidebar
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// Check if route is active
const isActive = (href: string) => {
  if (href === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(href)
}

// Logout
const handleLogout = async () => {
  await client.auth.signOut()
  navigateTo('/')
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <!-- Mobile menu overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        @click="mobileMenuOpen = false"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-0 left-0 z-50 h-full border-r border-white/10 bg-slate-950/80 backdrop-blur-md transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <!-- Logo - Links to Home Page -->
      <div class="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 group-hover:bg-violet-500/30 transition-colors">
            <span class="text-xl font-bold text-violet-400">K</span>
          </div>
          <span
            v-if="sidebarOpen"
            class="text-lg font-semibold transition-opacity duration-200 group-hover:text-violet-300"
          >
            ForgePC
          </span>
        </NuxtLink>
        <button
          class="hidden rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:block"
          @click="toggleSidebar"
        >
          <Menu class="h-5 w-5" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4">
        <div v-for="(section, idx) in adminNavigation" :key="idx" class="mb-6">
          <p
            v-if="section.title && sidebarOpen"
            class="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            {{ section.title }}
          </p>
          <div v-else-if="section.title && !sidebarOpen" class="mb-2 h-px bg-white/10" />
          
          <ul class="space-y-1">
            <li v-for="item in section.items" :key="item.href">
              <NuxtLink
                :to="item.href"
                :class="[
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive(item.href)
                    ? 'bg-violet-500/20 text-violet-400 shadow-lg shadow-violet-500/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                ]"
                :title="!sidebarOpen ? item.label : undefined"
              >
                <component
                  :is="item.icon"
                  :class="[
                    'h-5 w-5 flex-shrink-0',
                    isActive(item.href) ? 'text-violet-400' : ''
                  ]"
                />
                <span
                  v-if="sidebarOpen"
                  class="transition-opacity duration-200"
                >
                  {{ item.label }}
                </span>
                <span
                  v-if="item.badge && sidebarOpen"
                  class="ml-auto rounded-full bg-violet-500 px-2 py-0.5 text-xs font-medium text-white"
                >
                  {{ item.badge }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>

      <!-- User section -->
      <div class="border-t border-white/10 p-4">
        <button
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          @click="handleLogout"
        >
          <LogOut class="h-5 w-5 flex-shrink-0" />
          <span v-if="sidebarOpen">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main content wrapper -->
    <div
      :class="[
        'min-h-screen transition-all duration-300',
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      ]"
    >
      <!-- Top bar -->
      <header class="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div class="flex h-16 items-center justify-between px-4 lg:px-6">
          <!-- Mobile menu button -->
          <button
            class="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
            @click="mobileMenuOpen = !mobileMenuOpen"
          >
            <Menu v-if="!mobileMenuOpen" class="h-5 w-5" />
            <X v-else class="h-5 w-5" />
          </button>

          <!-- Search -->
          <div class="hidden flex-1 lg:block lg:max-w-md">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                class="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <!-- Right side -->
          <div class="flex items-center gap-3">
            <!-- Notifications -->
            <AdminNotificationDropdown />

            <!-- User dropdown -->
            <div class="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-1.5">
              <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20">
                <span class="text-sm font-medium text-violet-400">
                  {{ user?.email?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <div class="hidden sm:block">
                <p class="text-sm font-medium text-white">Admin</p>
                <p class="text-xs text-slate-400">{{ user?.email }}</p>
              </div>
              <ChevronDown class="h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 lg:p-6">
        <slot />
      </main>
    </div>
    
    <!-- Toast notifications for admin panel -->
    <Toaster 
      position="bottom-left" 
      theme="dark"
      :rich-colors="true"
      :close-button="true"
    />
  </div>
</template>
