<script setup lang="ts">
import { Search, Menu, Sparkles, ChevronDown, Cpu, MonitorSpeaker, MemoryStick, HardDrive } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import type { Database } from '~/types/database.types'

type HeaderCategory = Pick<Database['public']['Tables']['categories']['Row'], 'id' | 'name' | 'slug'>

const user = useSupabaseUser()
const client = useSupabaseClient<Database>()
const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const isScrolled = ref(false)
const mobileMenuOpen = ref(false)
const categories = ref<HeaderCategory[]>([])
const showGlobalSearch = computed(() => route.path !== '/products')

// Category icon mapping
const categoryIcons: Record<string, any> = {
  cpu: Cpu,
  gpu: MonitorSpeaker,
  ram: MemoryStick,
  ssd: HardDrive,
  storage: HardDrive,
}

// Fetch categories from Supabase
onMounted(async () => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 10
  }
  window.addEventListener('scroll', handleScroll)
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))
  
  // Fetch categories - only needed columns
  const { data } = await client
    .from('categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })
  
  if (data) categories.value = data
})

const handleLogout = async () => {
  await client.auth.signOut()
  router.push('/auth/login')
}

const handleSearch = () => {
  if (searchQuery.value) {
    router.push({ path: '/products', query: { q: searchQuery.value } })
  }
}

const getIcon = (slug: string) => categoryIcons[slug] || Cpu
const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const isRouteActive = (path: string) => route.path === path
const isCategoryActive = (slug: string) => route.path === `/categories/${slug}`

const mobileNavLinkClass = (path: string) => [
  'flex items-center rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
  isRouteActive(path)
    ? 'border-violet-500/40 bg-violet-500/15 text-violet-300'
    : 'border-white/10 bg-white/[0.03] text-slate-100 hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300'
]

const mobileCategoryLinkClass = (slug: string) => [
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
  isCategoryActive(slug)
    ? 'bg-violet-500/15 text-violet-300'
    : 'text-slate-200 hover:bg-white/5 hover:text-violet-300'
]

watch(() => route.fullPath, closeMobileMenu)
</script>

<template>
  <header 
    class="sticky top-0 z-50 w-full transition-all duration-300"
    :class="[
      isScrolled 
        ? 'bg-slate-950/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-violet-500/5' 
        : 'bg-slate-950/50 backdrop-blur-md border-b border-transparent'
    ]"
  >
    <!-- Glassmorphism gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-transparent to-violet-500/5 pointer-events-none" />
    
    <div class="container relative flex h-16 items-center gap-2">
      <!-- Mobile Menu -->
      <Sheet v-model:open="mobileMenuOpen">
        <SheetTrigger as-child>
          <Button variant="ghost" class="shrink-0 px-0 text-base hover:bg-white/10 focus-visible:bg-white/10 focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
            <Menu class="h-6 w-6" />
            <span class="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="w-[min(84vw,22rem)] bg-background/95 p-0 backdrop-blur-xl border-r border-white/10">
          <nav class="flex h-full flex-col gap-6 overflow-y-auto px-5 py-6 pr-8">
            <NuxtLink to="/" class="flex items-center gap-2 text-lg font-bold" @click="closeMobileMenu">
              <Sparkles class="h-5 w-5 text-primary" />
              ForgePC
            </NuxtLink>

            <div class="space-y-2">
              <NuxtLink
                to="/products"
                :class="mobileNavLinkClass('/products')"
                @click="closeMobileMenu"
              >
                Products
              </NuxtLink>
            </div>

            <div class="space-y-2 border-t border-white/10 pt-4">
              <span class="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Categories</span>
              <div class="flex flex-col gap-1">
                <NuxtLink 
                  v-for="cat in categories" 
                  :key="cat.id"
                  :to="`/categories/${cat.slug}`" 
                  :class="mobileCategoryLinkClass(cat.slug)"
                  @click="closeMobileMenu"
                >
                  <span class="flex h-8 w-8 items-center justify-center rounded-md bg-white/5 text-violet-300">
                    <component :is="getIcon(cat.slug)" class="h-4 w-4" />
                  </span>
                  {{ cat.name }}
                </NuxtLink>
              </div>
            </div>

            <div class="space-y-2 border-t border-white/10 pt-4">
              <NuxtLink
                to="/about"
                :class="mobileNavLinkClass('/about')"
                @click="closeMobileMenu"
              >
                About
              </NuxtLink>
              <NuxtLink
                to="/contact"
                :class="mobileNavLinkClass('/contact')"
                @click="closeMobileMenu"
              >
                Contact
              </NuxtLink>
            </div>

            <div v-if="!user" class="flex flex-col gap-2 border-t border-white/10 pt-4">
              <Button variant="ghost" class="justify-start text-foreground/70 hover:bg-white/10 hover:text-foreground" as-child>
                <NuxtLink to="/auth/login" @click="closeMobileMenu">Login</NuxtLink>
              </Button>
              <Button class="bg-primary/90 hover:bg-primary" as-child>
                <NuxtLink to="/auth/register" @click="closeMobileMenu">Sign Up</NuxtLink>
              </Button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>

      <!-- Logo -->
      <div class="mr-4 hidden md:flex">
        <NuxtLink to="/" class="mr-6 flex items-center space-x-2 group">
          <div class="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Sparkles class="h-5 w-5 text-primary" />
          </div>
          <span class="hidden font-bold sm:inline-block bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            ForgePC
          </span>
        </NuxtLink>
        <nav class="flex items-center space-x-1 text-sm font-medium">
          <NuxtLink 
            to="/products" 
            class="px-3 py-2 rounded-lg transition-all hover:bg-white/10 hover:text-foreground text-foreground/60"
          >
            Products
          </NuxtLink>
          
          <!-- Categories Dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button 
                variant="ghost" 
                class="px-3 py-2 h-auto text-sm font-medium text-foreground/60 hover:text-foreground hover:bg-white/10"
              >
                Categories
                <ChevronDown class="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-56 bg-background/95 backdrop-blur-xl border-white/10">
              <DropdownMenuLabel>Shop by Category</DropdownMenuLabel>
              <DropdownMenuSeparator class="bg-white/10" />
              <DropdownMenuItem 
                v-for="cat in categories" 
                :key="cat.id"
                @click="router.push(`/categories/${cat.slug}`)"
                class="cursor-pointer focus:bg-white/10"
              >
                <component :is="getIcon(cat.slug)" class="mr-2 h-4 w-4 text-primary" />
                {{ cat.name }}
              </DropdownMenuItem>
              <DropdownMenuSeparator class="bg-white/10" />
              <DropdownMenuItem @click="router.push('/categories')" class="cursor-pointer focus:bg-white/10">
                View All Categories
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <NuxtLink 
            to="/about" 
            class="px-3 py-2 rounded-lg transition-all hover:bg-white/10 hover:text-foreground text-foreground/60"
          >
            About
          </NuxtLink>
        </nav>
      </div>

      <!-- Search & Actions -->
      <div
        :class="[
          'flex min-w-0 flex-1 items-center gap-2 md:justify-end',
          showGlobalSearch ? 'justify-between' : 'justify-end'
        ]"
      >
        <div v-if="showGlobalSearch" class="min-w-0 flex-1 md:w-auto md:flex-none">
          <div class="relative group">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              v-model="searchQuery"
              type="search"
              placeholder="Search products..."
              class="min-w-0 pl-9 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-white/5 border-white/10 focus:border-primary/50 focus:bg-white/10 transition-all"
              @keyup.enter="handleSearch"
            />
          </div>
        </div>
        <nav class="flex shrink-0 items-center gap-1">
          <!-- Cart Sheet -->
          <LazyCartSheet />

          <!-- User Menu -->
          <UserMenu />
        </nav>
      </div>
    </div>
  </header>
</template>
