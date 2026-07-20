<script setup lang="ts">
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Package, 
  Minus, 
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Database } from '~/types/database.types'

type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: { name: string } | null
}

type AdminNotification = Database['public']['Tables']['admin_notifications']['Row']

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient<Database>()

const productId = computed(() => route.params.id as string)

// State
const product = ref<Product | null>(null)
const loading = ref(true)
const saving = ref(false)
const stockInput = ref(0)
const notifications = ref<AdminNotification[]>([])

// Drawer for editing
const drawerOpen = ref(false)

// Delete confirmation
const deleteConfirmOpen = ref(false)

// Fetch product
async function fetchProduct() {
  loading.value = true
  try {
    const { data, error } = await client
      .from('products')
      .select('*, categories(name)')
      .eq('id', productId.value)
      .single()

    if (error) throw error
    product.value = data
    stockInput.value = data.stock_quantity || 0
  } catch (error) {
    console.error('Error fetching product:', error)
    toast.error('Product not found')
    router.push('/admin/products')
  } finally {
    loading.value = false
  }
}

// Fetch related notifications
async function fetchNotifications() {
  try {
    const { data } = await client
      .from('admin_notifications')
      .select('*')
      .eq('related_id', productId.value)
      .order('created_at', { ascending: false })
      .limit(5)

    notifications.value = data || []
  } catch (error) {
    console.error('Error fetching notifications:', error)
  }
}

// Update stock
async function updateStock(newQuantity: number) {
  if (!product.value || newQuantity < 0) return
  
  saving.value = true
  try {
    const { error } = await client
      .from('products')
      .update({ stock_quantity: newQuantity })
      .eq('id', product.value.id)

    if (error) throw error

    product.value.stock_quantity = newQuantity
    stockInput.value = newQuantity
    toast.success('Stock updated successfully')
  } catch (error: any) {
    console.error('Error updating stock:', error)
    toast.error(error.message || 'Failed to update stock')
  } finally {
    saving.value = false
  }
}

// Quick adjust stock
function adjustStock(amount: number) {
  const currentStock = product.value?.stock_quantity || 0
  const newStock = Math.max(0, currentStock + amount)
  updateStock(newStock)
}

// Auto-save stock on blur (only if changed)
function handleStockBlur() {
  if (stockInput.value !== product.value?.stock_quantity && stockInput.value >= 0) {
    updateStock(stockInput.value)
  }
}

// Delete product
const { blockedInDemo } = useDemoGuard()
async function handleDelete() {
  if (!product.value) return
  if (blockedInDemo('Deleting products')) return

  try {
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', product.value.id)

    if (error) throw error

    toast.success('Product deleted successfully')
    router.push('/admin/products')
  } catch (error: any) {
    console.error('Delete error:', error)
    toast.error(error.message || 'Failed to delete product')
  }
}

// Format currency
function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

// Format date
function formatDate(date: string | null) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Stock status
const stockStatus = computed(() => {
  const qty = product.value?.stock_quantity || 0
  if (qty === 0) return { label: 'Out of Stock', color: 'text-red-400 bg-red-500/20', icon: XCircle }
  if (qty <= 10) return { label: 'Low Stock', color: 'text-amber-400 bg-amber-500/20', icon: AlertTriangle }
  return { label: 'In Stock', color: 'text-emerald-400 bg-emerald-500/20', icon: CheckCircle }
})

// Handle drawer saved
function handleDrawerSaved() {
  fetchProduct()
}

onMounted(() => {
  fetchProduct()
  fetchNotifications()
})
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>

    <template v-else-if="product">
      <!-- Header -->
      <div class="mb-6">
        <!-- Breadcrumb -->
        <div class="mb-4 flex items-center gap-2 text-sm text-slate-400">
          <NuxtLink to="/admin/products" class="hover:text-white transition-colors">
            Products
          </NuxtLink>
          <span>/</span>
          <span class="text-white">{{ product.name }}</span>
        </div>

        <!-- Title & Actions -->
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <button
              @click="router.push('/admin/products')"
              class="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <ArrowLeft class="h-5 w-5" />
            </button>
            <div>
              <h1 class="text-2xl font-bold text-white">{{ product.name }}</h1>
              <p class="text-sm text-slate-400">{{ product.slug }}</p>
            </div>
            <span
              :class="[
                'rounded-full px-3 py-1 text-xs font-medium',
                product.is_active
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-slate-500/20 text-slate-400'
              ]"
            >
              {{ product.is_active ? 'Active' : 'Draft' }}
            </span>
          </div>

          <div class="flex items-center gap-3">
            <button
              @click="drawerOpen = true"
              class="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 font-medium text-white transition-colors hover:bg-white/10"
            >
              <Pencil class="h-4 w-4" />
              Edit
            </button>
            <button
              @click="deleteConfirmOpen = true"
              class="flex items-center gap-2 rounded-xl bg-rose-500/10 px-4 py-2.5 font-medium text-rose-400 transition-colors hover:bg-rose-500/20"
            >
              <Trash2 class="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- Product Info (2 cols) -->
        <div class="space-y-6 lg:col-span-2">
          <!-- Main Info Card -->
          <div class="rounded-2xl border border-white/10 bg-slate-800/50 overflow-hidden">
            <div class="flex flex-col md:flex-row">
              <!-- Image -->
              <div class="md:w-64 shrink-0">
                <NuxtImg
                  :src="product.images?.[0] || '/placeholder.png'"
                  :alt="product.name"
                  loading="lazy"
                  width="256"
                  height="256"
                  format="webp"
                  class="h-64 w-full object-cover md:h-full"
                />
              </div>

              <!-- Details -->
              <div class="flex-1 p-6">
                <div class="space-y-4">
                  <div>
                    <label class="text-xs font-medium uppercase text-slate-500">Category</label>
                    <p class="text-white">{{ product.categories?.name || 'Uncategorized' }}</p>
                  </div>

                  <div>
                    <label class="text-xs font-medium uppercase text-slate-500">Description</label>
                    <p class="text-slate-300 text-sm line-clamp-3">
                      {{ product.description || 'No description' }}
                    </p>
                  </div>

                  <div class="flex gap-6">
                    <div>
                      <label class="text-xs font-medium uppercase text-slate-500">Price</label>
                      <p class="text-xl font-bold text-white">{{ formatCurrency(product.price) }}</p>
                    </div>
                    <div v-if="product.compare_at_price">
                      <label class="text-xs font-medium uppercase text-slate-500">Compare At</label>
                      <p class="text-lg text-slate-500 line-through">{{ formatCurrency(product.compare_at_price) }}</p>
                    </div>
                  </div>

                  <div class="flex gap-6 text-sm">
                    <div>
                      <label class="text-xs font-medium uppercase text-slate-500">Created</label>
                      <p class="text-slate-400">{{ formatDate(product.created_at) }}</p>
                    </div>
                    <div>
                      <label class="text-xs font-medium uppercase text-slate-500">Updated</label>
                      <p class="text-slate-400">{{ formatDate(product.updated_at) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Related Notifications -->
          <div v-if="notifications.length > 0" class="rounded-2xl border border-white/10 bg-slate-800/50 p-6">
            <h3 class="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <Bell class="h-5 w-5 text-violet-400" />
              Related Notifications
            </h3>
            <div class="space-y-3">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="flex items-center gap-3 rounded-lg bg-white/5 p-3"
              >
                <AlertTriangle class="h-4 w-4 text-amber-400 shrink-0" />
                <div class="min-w-0 flex-1">
                  <p class="text-sm text-white truncate">{{ notification.title }}</p>
                  <p class="text-xs text-slate-400">{{ formatDate(notification.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stock Management (1 col) -->
        <div class="space-y-6">
          <div class="rounded-2xl border border-white/10 bg-slate-800/50 p-6">
            <h3 class="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <Package class="h-5 w-5 text-violet-400" />
              Stock Management
            </h3>

            <!-- Current Stock -->
            <div class="mb-6 text-center">
              <div class="text-5xl font-bold text-white mb-2">
                {{ product.stock_quantity || 0 }}
              </div>
              <span
                :class="[
                  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium',
                  stockStatus.color
                ]"
              >
                <component :is="stockStatus.icon" class="h-4 w-4" />
                {{ stockStatus.label }}
              </span>
            </div>

            <!-- Quick Adjust -->
            <div class="mb-6">
              <label class="text-xs font-medium uppercase text-slate-500 mb-2 block">Quick Adjust</label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  @click="adjustStock(-1)"
                  :disabled="saving || (product.stock_quantity || 0) <= 0"
                  class="flex items-center justify-center gap-1 rounded-lg bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
                >
                  <Minus class="h-3 w-3" />
                  1
                </button>
                <button
                  @click="adjustStock(1)"
                  :disabled="saving"
                  class="flex items-center justify-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  <Plus class="h-3 w-3" />
                  1
                </button>
                <button
                  @click="adjustStock(10)"
                  :disabled="saving"
                  class="flex items-center justify-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  <Plus class="h-3 w-3" />
                  10
                </button>
                <button
                  @click="adjustStock(50)"
                  :disabled="saving"
                  class="flex items-center justify-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
                >
                  <Plus class="h-3 w-3" />
                  50
                </button>
              </div>
            </div>

            <!-- Set Stock -->
            <div>
              <label class="text-xs font-medium uppercase text-slate-500 mb-2 block">Set Stock Manually</label>
              <input
                v-model.number="stockInput"
                type="number"
                min="0"
                @blur="handleStockBlur"
                @keydown.enter="($event.target as HTMLInputElement).blur()"
                class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              />
              <p class="mt-2 text-xs text-slate-500">Press Enter or click outside to save</p>
            </div>

            <!-- Saving indicator -->
            <div v-if="saving" class="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
              <div class="h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              Saving...
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Product Drawer -->
    <AdminProductDrawer
      v-model:open="drawerOpen"
      :product="product"
      @saved="handleDrawerSaved"
    />

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div
          v-if="deleteConfirmOpen"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          @click.self="deleteConfirmOpen = false"
        >
          <div class="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6">
            <h3 class="text-lg font-semibold text-white">Delete Product</h3>
            <p class="mt-2 text-slate-400">
              Are you sure you want to delete "{{ product?.name }}"? This action cannot be undone.
            </p>
            <div class="mt-6 flex gap-3">
              <button
                class="flex-1 rounded-xl border border-white/10 bg-transparent px-4 py-2.5 font-medium text-white transition-colors hover:bg-white/5"
                @click="deleteConfirmOpen = false"
              >
                Cancel
              </button>
              <button
                class="flex-1 rounded-xl bg-rose-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-rose-600"
                @click="handleDelete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
