import { defineStore, skipHydrate } from 'pinia'
import type { Ref } from 'vue'
import type { Database } from '~/types/database.types'

export interface CartProduct {
  id: string
  name: string
  slug: string
  price: number
  images?: string[] | null
  categories?: { name: string; slug: string } | null
}

export interface CartItem {
  productId: string
  product: CartProduct
  quantity: number
}

const CART_STORAGE_KEY = 'forgepc-cart'
// Legacy key from the KZProducts branding - read once, then migrate and drop it.
const LEGACY_CART_STORAGE_KEY = 'kz-cart'
const hasBrowserStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const toCartProduct = (product: CartProduct): CartProduct => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  price: product.price,
  images: product.images ?? null,
  categories: product.categories ?? null,
})

export const useCartStore = defineStore('cart', () => {
  // State - skipHydrate prevents SSR/client mismatch
  const items = ref<CartItem[]>([]) as Ref<CartItem[]>
  const isHydrated = ref(false)
  const isSyncing = ref(false)
  
  // Get Supabase client and user (only on client-side)
  const getSupabaseClient = () => {
    if (!hasBrowserStorage()) return null
    return useSupabaseClient<Database>()
  }
  
  const getSupabaseUser = () => {
    if (!hasBrowserStorage()) return null
    return useSupabaseUser()
  }

  // Initialize from localStorage (client-side only)
  const initFromStorage = () => {
    if (hasBrowserStorage() && !isHydrated.value) {
      try {
        let saved = localStorage.getItem(CART_STORAGE_KEY)
        if (!saved) {
          const legacy = localStorage.getItem(LEGACY_CART_STORAGE_KEY)
          if (legacy) {
            localStorage.setItem(CART_STORAGE_KEY, legacy)
            saved = legacy
          }
        }
        if (saved) {
          items.value = JSON.parse(saved)
        }
        localStorage.removeItem(LEGACY_CART_STORAGE_KEY)
      } catch (e) {
        console.warn('Failed to load cart from localStorage:', e)
      }
      isHydrated.value = true
    }
  }

  // Persist to localStorage whenever items change
  const saveToStorage = () => {
    if (hasBrowserStorage()) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items.value))
      } catch (e) {
        console.warn('Failed to save cart to localStorage:', e)
      }
    }
  }

  // Sync cart with Supabase for authenticated users
  const syncWithSupabase = async () => {
    const client = getSupabaseClient()
    const user = getSupabaseUser()
    
    if (!client || !user?.value || isSyncing.value) return
    
    isSyncing.value = true
    try {
      // Fetch user's cart from database
      const { data: dbItems, error } = await client
        .from('cart_items')
        .select('id, product_id, quantity, products(*)')
        .eq('user_id', user.value.id)
      
      if (error) {
        console.error('Error fetching cart from DB:', error)
        return
      }
      
      // Merge local cart with DB cart
      if (dbItems && dbItems.length > 0) {
        for (const dbItem of dbItems) {
          const existingLocal = items.value.find(i => i.productId === dbItem.product_id)
          if (!existingLocal && dbItem.products) {
            // Add DB item to local cart
            items.value.push({
              productId: dbItem.product_id,
              product: toCartProduct(dbItem.products as CartProduct),
              quantity: dbItem.quantity
            })
          } else if (existingLocal) {
            // If exists in both, keep higher quantity
            existingLocal.quantity = Math.max(existingLocal.quantity, dbItem.quantity)
          }
        }
      }
      
      // Push all local items to DB
      for (const item of items.value) {
        await client
          .from('cart_items')
          .upsert({
            user_id: user.value.id,
            product_id: item.productId,
            quantity: item.quantity
          }, {
            onConflict: 'user_id,product_id'
          })
      }
    } catch (e) {
      console.error('Cart sync error:', e)
    } finally {
      isSyncing.value = false
    }
  }

  // Watch for changes and persist
  watch(items, () => {
    saveToStorage()
    // Also sync to Supabase if user is logged in
    const user = getSupabaseUser()
    if (user?.value && !isSyncing.value) {
      syncWithSupabase()
    }
  }, { deep: true })

  // Actions
  const addToCart = (product: CartProduct, quantity = 1) => {
    initFromStorage() // Ensure hydrated
    
    const existing = items.value.find(i => i.productId === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        productId: product.id,
        product: toCartProduct(product),
        quantity
      })
    }
  }

  const removeFromCart = async (productId: string) => {
    const idx = items.value.findIndex(i => i.productId === productId)
    if (idx > -1) {
      items.value.splice(idx, 1)
      
      // Also remove from DB if user logged in
      const client = getSupabaseClient()
      const user = getSupabaseUser()
      if (client && user?.value) {
        await client
          .from('cart_items')
          .delete()
          .eq('user_id', user.value.id)
          .eq('product_id', productId)
      }
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const item = items.value.find(i => i.productId === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  const clearCart = async () => {
    items.value = []
    
    // Also clear from DB if user logged in
    const client = getSupabaseClient()
    const user = getSupabaseUser()
    if (client && user?.value) {
      await client
        .from('cart_items')
        .delete()
        .eq('user_id', user.value.id)
    }
  }

  // Getters
  const count = computed(() => 
    items.value.reduce((acc, item) => acc + item.quantity, 0)
  )

  const total = computed(() => 
    items.value.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  )

  return {
    // State (skip hydrate to prevent SSR mismatch)
    items: skipHydrate(items),
    isHydrated: skipHydrate(isHydrated),
    isSyncing: skipHydrate(isSyncing),
    // Actions
    initFromStorage,
    syncWithSupabase,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    // Getters
    count,
    total
  }
})
