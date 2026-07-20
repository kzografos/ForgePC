<script setup lang="ts">
import { Plus, Pencil, Trash2, Search, FolderOpen } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Database } from '~/types/database.types'

type Category = Database['public']['Tables']['categories']['Row']

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const client = useSupabaseClient<Database>()

// State
const categories = ref<Category[]>([])
const loading = ref(true)
const searchQuery = ref('')
const drawerOpen = ref(false)
const selectedCategory = ref<Category | null>(null)
const deleteConfirm = ref<string | null>(null)

// Fetch categories
const fetchCategories = async () => {
  loading.value = true
  try {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('name')
    
    if (error) throw error
    categories.value = data || []
  } catch (error: any) {
    toast.error('Failed to load categories')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Filtered categories
const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  const query = searchQuery.value.toLowerCase()
  return categories.value.filter(cat => 
    cat.name.toLowerCase().includes(query) ||
    cat.slug.toLowerCase().includes(query)
  )
})

// Open drawer for new category
const handleAdd = () => {
  selectedCategory.value = null
  drawerOpen.value = true
}

// Open drawer for edit
const handleEdit = (category: Category) => {
  selectedCategory.value = category
  drawerOpen.value = true
}

// Delete category
const { blockedInDemo } = useDemoGuard()
const handleDelete = async (category: Category) => {
  if (blockedInDemo('Deleting categories')) return
  if (deleteConfirm.value !== category.id) {
    deleteConfirm.value = category.id
    return
  }

  try {
    const { error } = await client
      .from('categories')
      .delete()
      .eq('id', category.id)
    
    if (error) throw error
    toast.success('Category deleted successfully')
    fetchCategories()
  } catch (error: any) {
    toast.error(error.message || 'Failed to delete category')
  } finally {
    deleteConfirm.value = null
  }
}

// Get product count for category
const getProductCount = async (categoryId: string) => {
  const { count } = await client
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', categoryId)
  return count || 0
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Categories</h1>
        <p class="text-slate-400">Manage product categories for your store</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-violet-600"
        @click="handleAdd"
      >
        <Plus class="h-5 w-5" />
        Add Category
      </button>
    </div>

    <!-- Search -->
    <div class="mb-6">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search categories..."
          class="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-slate-500 outline-none transition-colors focus:border-violet-500/50"
        />
      </div>
    </div>

    <!-- Categories Grid -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>

    <div v-else-if="filteredCategories.length === 0" class="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
      <FolderOpen class="mx-auto mb-4 h-12 w-12 text-slate-500" />
      <p class="text-slate-400">
        {{ searchQuery ? 'No categories match your search' : 'No categories yet. Create your first category!' }}
      </p>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="category in filteredCategories"
        :key="category.id"
        class="group rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-violet-500/30 hover:bg-white/10"
      >
        <!-- Image -->
        <div class="mb-4 aspect-video overflow-hidden rounded-xl bg-slate-800">
          <NuxtImg
            v-if="category.image_url"
            :src="category.image_url"
            :alt="category.name"
            loading="lazy"
            format="webp"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full items-center justify-center">
            <FolderOpen class="h-12 w-12 text-slate-600" />
          </div>
        </div>

        <!-- Info -->
        <h3 class="text-lg font-semibold text-white">{{ category.name }}</h3>
        <p class="mb-4 text-sm text-slate-400">{{ category.slug }}</p>
        <p v-if="category.description" class="mb-4 line-clamp-2 text-sm text-slate-500">
          {{ category.description }}
        </p>

        <!-- Actions -->
        <div class="flex gap-2">
          <button
            class="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            @click="handleEdit(category)"
          >
            <Pencil class="mr-1 inline h-4 w-4" />
            Edit
          </button>
          <button
            :class="[
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              deleteConfirm === category.id
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-rose-400'
            ]"
            @click="handleDelete(category)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Category Drawer -->
    <AdminCategoryDrawer
      v-model:open="drawerOpen"
      :category="selectedCategory"
      @saved="fetchCategories"
    />
  </div>
</template>
