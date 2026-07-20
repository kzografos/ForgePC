<script setup lang="ts">
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Database } from '~/types/database.types'
import type { ImportPreview } from '~/composables/useCsvProducts'

type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: { name: string } | null
}

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const client = useSupabaseClient<Database>()
const { blockedInDemo } = useDemoGuard()

// CSV Import/Export
const { loading: csvLoading, exportProductsToCsv, parseImportFile, importProducts } = useCsvProducts()

// State
const products = ref<Product[]>([])
const loading = ref(true)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10
const totalCount = ref(0)

// Drawer state
const drawerOpen = ref(false)
const editingProduct = ref<Product | null>(null)

// Delete confirmation
const deleteConfirmOpen = ref(false)
const productToDelete = ref<Product | null>(null)

// CSV Import modal state
const importModalOpen = ref(false)
const importPreview = ref<ImportPreview | null>(null)
const importLoading = ref(false)

// Computed
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))

// Fetch products
const fetchProducts = async () => {
  loading.value = true
  try {
    const from = (currentPage.value - 1) * pageSize
    const to = from + pageSize - 1

    let query = client
      .from('products')
      .select('*, categories(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (searchQuery.value) {
      query = query.ilike('name', `%${searchQuery.value}%`)
    }

    const { data, count, error } = await query

    if (error) throw error

    products.value = data || []
    totalCount.value = count || 0
  } catch (error) {
    console.error('Error fetching products:', error)
    toast.error('Failed to load products')
  } finally {
    loading.value = false
  }
}

// Open drawer for new product
const openNewProductDrawer = () => {
  editingProduct.value = null
  drawerOpen.value = true
}

// Open drawer for editing
const openEditDrawer = (product: Product) => {
  editingProduct.value = product
  drawerOpen.value = true
}

// Confirm delete
const confirmDelete = (product: Product) => {
  productToDelete.value = product
  deleteConfirmOpen.value = true
}

// Delete product
const handleDelete = async () => {
  if (!productToDelete.value) return
  if (blockedInDemo('Deleting products')) { deleteConfirmOpen.value = false; return }

  try {
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', productToDelete.value.id)

    if (error) throw error

    toast.success('Product deleted successfully')
    deleteConfirmOpen.value = false
    productToDelete.value = null
    fetchProducts()
  } catch (error: any) {
    console.error('Delete error:', error)
    toast.error(error.message || 'Failed to delete product')
  }
}

// Handle search
const handleSearch = () => {
  currentPage.value = 1
  fetchProducts()
}

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  }).format(value)
}

// Watch for page changes
watch(currentPage, () => {
  fetchProducts()
})

// CSV Export handler
const handleExportCsv = async () => {
  await exportProductsToCsv()
}

// CSV Import file selected handler
const handleImportFile = async (file: File) => {
  try {
    importLoading.value = true
    const preview = await parseImportFile(file)
    importPreview.value = preview
    importModalOpen.value = true
  } catch (error: any) {
    toast.error(error.message || 'Failed to parse CSV file')
  } finally {
    importLoading.value = false
  }
}

// CSV Import confirm handler
const handleImportConfirm = async (confirmedCategories: string[]) => {
  if (!importPreview.value) return
  if (blockedInDemo('Bulk product import')) { importModalOpen.value = false; return }
  
  importLoading.value = true
  try {
    const result = await importProducts(importPreview.value, confirmedCategories)
    
    if (result.errors.length > 0) {
      result.errors.forEach((err: string) => toast.error(err))
    }
    
    if (result.created > 0 || result.updated > 0) {
      toast.success(`Import complete: ${result.created} created, ${result.updated} updated`)
    }
    
    importModalOpen.value = false
    importPreview.value = null
    fetchProducts()
  } catch (error: any) {
    toast.error(error.message || 'Import failed')
  } finally {
    importLoading.value = false
  }
}

// CSV Import cancel handler
const handleImportCancel = () => {
  importPreview.value = null
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Products</h1>
        <p class="mt-1 text-slate-400">Manage your product catalog</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- CSV Import/Export -->
        <AdminCsvImportExportButtons
          :loading="csvLoading || importLoading"
          @export="handleExportCsv"
          @import="handleImportFile"
        />
        
        <!-- Add Product -->
        <button
          class="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 font-medium text-white shadow-lg shadow-violet-500/25 transition-all hover:bg-violet-600 hover:shadow-violet-500/40"
          @click="openNewProductDrawer"
        >
          <Plus class="h-5 w-5" />
          Add Product
        </button>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <div class="flex flex-col gap-4 sm:flex-row">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-white placeholder-slate-500 outline-none transition-colors focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
            @keydown.enter="handleSearch"
          />
        </div>
        <button
          class="rounded-xl bg-white/5 px-6 py-2.5 font-medium text-white transition-colors hover:bg-white/10"
          @click="handleSearch"
        >
          Search
        </button>
      </div>
    </div>

    <!-- Data Table -->
    <div class="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
      <!-- Loading state -->
      <div v-if="loading" class="p-8">
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex animate-pulse items-center gap-4">
            <div class="h-12 w-12 rounded-lg bg-white/10" />
            <div class="flex-1">
              <div class="h-4 w-48 rounded bg-white/10" />
              <div class="mt-2 h-3 w-32 rounded bg-white/10" />
            </div>
            <div class="h-4 w-20 rounded bg-white/10" />
          </div>
        </div>
      </div>

      <!-- Table -->
      <table v-else class="min-w-[640px] w-full">
        <thead class="border-b border-white/10 bg-white/5">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              Product
            </th>
            <th class="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 md:table-cell">
              Category
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
              Price
            </th>
            <th class="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 sm:table-cell">
              Stock
            </th>
            <th class="hidden px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 lg:table-cell">
              Status
            </th>
            <th class="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr
            v-for="product in products"
            :key="product.id"
            class="transition-colors hover:bg-white/5"
          >
            <!-- Product -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-4">
                <NuxtImg
                  :src="product.images?.[0] || '/placeholder.png'"
                  :alt="product.name"
                  loading="lazy"
                  width="48"
                  height="48"
                  format="webp"
                  class="h-12 w-12 rounded-lg object-cover"
                />
                <div>
                  <p class="font-medium text-white">{{ product.name }}</p>
                  <p class="text-sm text-slate-400">{{ product.slug }}</p>
                </div>
              </div>
            </td>

            <!-- Category -->
            <td class="hidden px-6 py-4 md:table-cell">
              <span class="text-slate-300">
                {{ product.categories?.name || '-' }}
              </span>
            </td>

            <!-- Price -->
            <td class="px-6 py-4">
              <span class="font-medium text-white">{{ formatCurrency(product.price) }}</span>
              <span v-if="product.compare_at_price" class="ml-2 text-sm text-slate-500 line-through">
                {{ formatCurrency(product.compare_at_price) }}
              </span>
            </td>

            <!-- Stock -->
            <td class="hidden px-6 py-4 sm:table-cell">
              <span
                :class="[
                  'font-medium',
                  (product.stock_quantity || 0) < 5 ? 'text-amber-400' : 'text-slate-300'
                ]"
              >
                {{ product.stock_quantity || 0 }}
              </span>
            </td>

            <!-- Status -->
            <td class="hidden px-6 py-4 lg:table-cell">
              <span
                :class="[
                  'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                  product.is_active
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-slate-500/20 text-slate-400'
                ]"
              >
                {{ product.is_active ? 'Active' : 'Draft' }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button
                  class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                  title="Edit"
                  @click="openEditDrawer(product)"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                  class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-rose-400"
                  title="Delete"
                  @click="confirmDelete(product)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="products.length === 0">
            <td colspan="6" class="px-6 py-12 text-center">
              <p class="text-slate-400">No products found</p>
              <button
                class="mt-4 text-violet-400 hover:text-violet-300"
                @click="openNewProductDrawer"
              >
                Create your first product
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between border-t border-white/10 px-6 py-4">
        <p class="text-sm text-slate-400">
          Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} products
        </p>
        <div class="flex items-center gap-2">
          <button
            :disabled="currentPage === 1"
            class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            @click="currentPage--"
          >
            <ChevronLeft class="h-5 w-5" />
          </button>
          <span class="px-3 text-sm text-slate-300">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            :disabled="currentPage === totalPages"
            class="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            @click="currentPage++"
          >
            <ChevronRight class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Product Drawer -->
    <AdminProductDrawer
      v-model:open="drawerOpen"
      :product="editingProduct"
      @saved="fetchProducts"
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
              Are you sure you want to delete "{{ productToDelete?.name }}"? This action cannot be undone.
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

    <!-- CSV Import Modal -->
    <AdminCsvImportModal
      v-model:open="importModalOpen"
      :preview="importPreview"
      :loading="importLoading"
      @confirm="handleImportConfirm"
      @cancel="handleImportCancel"
    />
  </div>
</template>
