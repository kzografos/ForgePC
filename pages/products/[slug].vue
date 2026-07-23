<script setup lang="ts">
import { ShoppingCart, Loader2, ArrowLeft, ImageOff } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCartStore } from '~/stores/cart'
import { toast } from 'vue-sonner'
import type { ReviewWithDetails, ReviewSortOption, ReviewStats } from '~/composables/useReviews'

const route = useRoute()
const { fetchProduct } = useProducts()
const {
  fetchProductReviews,
  fetchReviewStats,
  createReview,
  updateReview,
  deleteReview,
  toggleHelpfulVote,
  getUserReview
} = useReviews()
const cartStore = useCartStore()
const user = useSupabaseUser()

const slug = route.params.slug as string

// SSR-capable fetch so per-product OG/SEO meta lands in the server-rendered <head> (#8/MED-1)
const { data: product, pending: loading, error } = await useAsyncData<any>(
  `product-${slug}`,
  () => fetchProduct(slug),
)

const siteUrl = useRuntimeConfig().public.siteUrl as string
const ogImage = computed(() => {
  const img = product.value?.images?.[0]
  if (!img) return `${siteUrl}/og-image.png`
  return img.startsWith('http') ? img : `${siteUrl}${img}`
})
useSeoMeta({
  title: () => (product.value ? `${product.value.name} — KZProducts` : 'Product — KZProducts'),
  description: () => product.value?.description?.slice(0, 160) || 'Premium PC components for gaming and workstation builds.',
  ogType: 'website',
  ogUrl: () => `${siteUrl}/products/${slug}`,
  ogTitle: () => (product.value ? `${product.value.name} — KZProducts` : 'KZProducts'),
  ogDescription: () => product.value?.description?.slice(0, 160) || '',
  ogImage: () => ogImage.value,
  twitterCard: 'summary_large_image',
  twitterTitle: () => product.value?.name || 'KZProducts',
  twitterDescription: () => product.value?.description?.slice(0, 160) || '',
  twitterImage: () => ogImage.value,
})

const imageError = ref(false)
const selectedImageIndex = ref(0)

// Review state
const reviews = ref<ReviewWithDetails[]>([])
const reviewStats = ref<ReviewStats | null>(null)
const userReview = ref<any>(null)
const reviewsLoading = ref(false)
const reviewSort = ref<ReviewSortOption>('recent')
const showReviewForm = ref(false)
const isEditingReview = ref(false)
const reviewFormLoading = ref(false)

// Pagination
const reviewsPerPage = 5
const reviewsOffset = ref(0)
const hasMoreReviews = ref(false)

onMounted(async () => {
  if (product.value) {
    await loadReviewData()
  }
})

// Watch for user changes to check their review
watch(user, async (newUser) => {
  if (newUser && product.value) {
    userReview.value = await getUserReview(product.value.id)
  } else {
    userReview.value = null
  }
})

const loadReviewData = async () => {
  if (!product.value) return
  
  reviewsLoading.value = true
  try {
    // Fetch stats
    reviewStats.value = await fetchReviewStats(product.value.id)
    
    // Fetch reviews
    const fetchedReviews = await fetchProductReviews(
      product.value.id,
      reviewSort.value,
      reviewsPerPage + 1,
      0
    )
    
    hasMoreReviews.value = fetchedReviews.length > reviewsPerPage
    reviews.value = fetchedReviews.slice(0, reviewsPerPage)
    reviewsOffset.value = reviewsPerPage
    
    // Check if user has reviewed
    if (user.value) {
      userReview.value = await getUserReview(product.value.id)
    }
  } finally {
    reviewsLoading.value = false
  }
}

const handleSortChange = async (sort: ReviewSortOption) => {
  reviewSort.value = sort
  reviewsOffset.value = 0
  await loadReviewData()
}

const handleLoadMore = async () => {
  if (!product.value) return
  
  reviewsLoading.value = true
  try {
    const moreReviews = await fetchProductReviews(
      product.value.id,
      reviewSort.value,
      reviewsPerPage + 1,
      reviewsOffset.value
    )
    
    hasMoreReviews.value = moreReviews.length > reviewsPerPage
    reviews.value = [...reviews.value, ...moreReviews.slice(0, reviewsPerPage)]
    reviewsOffset.value += reviewsPerPage
  } finally {
    reviewsLoading.value = false
  }
}

const handleWriteReview = () => {
  if (userReview.value) {
    isEditingReview.value = true
  }
  showReviewForm.value = true
}

const handleSubmitReview = async (data: { rating: number; title: string; comment: string }) => {
  if (!product.value) return
  
  reviewFormLoading.value = true
  try {
    if (isEditingReview.value && userReview.value) {
      // Update existing review
      await updateReview(userReview.value.id, data)
      toast.success('Review updated successfully!')
    } else {
      // Create new review
      await createReview(product.value.id, data.rating, data.comment, data.title)
      toast.success('Review submitted successfully!')
    }
    
    showReviewForm.value = false
    isEditingReview.value = false
    await loadReviewData()
  } catch (e: any) {
    toast.error(e.message || 'Failed to submit review')
  } finally {
    reviewFormLoading.value = false
  }
}

const handleEditReview = (review: ReviewWithDetails) => {
  userReview.value = review
  isEditingReview.value = true
  showReviewForm.value = true
}

const handleDeleteReview = async (reviewId: string) => {
  if (!confirm('Are you sure you want to delete your review?')) return
  
  try {
    await deleteReview(reviewId)
    toast.success('Review deleted successfully!')
    await loadReviewData()
  } catch (e: any) {
    toast.error(e.message || 'Failed to delete review')
  }
}

const handleVoteHelpful = async (reviewId: string) => {
  if (!user.value) {
    toast.error('Please sign in to vote')
    return
  }
  
  await toggleHelpfulVote(reviewId)
  
  // Update local state
  const reviewIndex = reviews.value.findIndex(r => r.id === reviewId)
  if (reviewIndex !== -1) {
    const review = reviews.value[reviewIndex]
    if (review.user_has_voted) {
      review.helpful_count = (review.helpful_count || 1) - 1
      review.user_has_voted = false
    } else {
      review.helpful_count = (review.helpful_count || 0) + 1
      review.user_has_voted = true
    }
  }
}

const handleAddToCart = () => {
  if (product.value) {
    cartStore.addToCart(product.value)
    toast.success(`${product.value.name} added to cart!`, {
      description: 'Click the cart icon to view your items.',
    })
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(price)
}

const handleImageError = () => {
  imageError.value = true
}

const imageSrc = computed(() => {
  if (imageError.value) return '/placeholder.png'
  return product.value?.images?.[selectedImageIndex.value] || product.value?.images?.[0] || '/placeholder.png'
})

const selectImage = (index: number) => {
  selectedImageIndex.value = index
  imageError.value = false
}
</script>

<template>
  <div class="container py-6 sm:py-8">
    <Button variant="ghost" class="mb-6 hover:bg-transparent hover:text-primary" as-child>
      <NuxtLink to="/products">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back to Products
      </NuxtLink>
    </Button>

    <div v-if="loading" class="flex justify-center py-20">
      <Loader2 class="h-10 w-10 animate-spin text-primary" />
    </div>

    <div v-else-if="error || !product" class="text-center py-20">
      <h2 class="text-2xl font-bold mb-2">Product not found</h2>
      <p class="text-muted-foreground">{{ error || "The product you're looking for doesn't exist." }}</p>
      <Button as-child class="mt-4">
        <NuxtLink to="/products">Browse All Products</NuxtLink>
      </Button>
    </div>

    <div v-else>
      <!-- Product Details Grid -->
      <div class="grid md:grid-cols-2 gap-8 lg:gap-12">
        <!-- Image Gallery -->
        <div class="space-y-4">
          <div class="relative h-[320px] w-full overflow-hidden rounded-lg sm:h-[400px]">
            <NuxtImg 
              :src="imageSrc" 
              :alt="product.name" 
              preset="product"
              loading="eager"
              fetchpriority="high"
              width="800"
              height="800"
              class="h-full w-full object-cover object-left"
              @error="handleImageError"
            />
            <!-- Image Error Overlay -->
            <div 
              v-if="imageError" 
              class="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 text-muted-foreground"
            >
              <ImageOff class="w-12 h-12 mb-2 opacity-50" />
              <span class="text-sm">Image unavailable</span>
            </div>
          </div>
          <div class="grid grid-cols-4 gap-4" v-if="product.images?.length > 1">
            <div 
              v-for="(img, i) in product.images" 
              :key="i" 
              class="aspect-square bg-muted rounded-md overflow-hidden cursor-pointer border-2 transition-colors"
              :class="selectedImageIndex === i ? 'border-primary' : 'border-transparent hover:border-primary/50'"
              @click="selectImage(Number(i))"
            >
              <NuxtImg :src="img" loading="lazy" width="100" height="100" format="webp" class="object-cover w-full h-full" />
            </div>
          </div>
        </div>

        <!-- Details -->
        <div class="space-y-6">
          <div>
            <div v-if="product.categories" class="text-sm text-primary font-medium mb-1">
              {{ product.categories.name }}
            </div>
            <h1 class="text-3xl font-bold tracking-tight">{{ product.name }}</h1>
            
            <!-- Rating Display -->
            <div v-if="reviewStats && reviewStats.total_reviews > 0" class="flex items-center gap-2 mt-2">
              <StarRating :rating="reviewStats.average_rating" size="md" show-value />
              <span class="text-sm text-muted-foreground">
                ({{ reviewStats.total_reviews }} {{ reviewStats.total_reviews === 1 ? 'review' : 'reviews' }})
              </span>
            </div>
          </div>

          <div class="flex items-baseline gap-3">
            <span class="text-3xl font-bold text-primary">{{ formatPrice(product.price) }}</span>
            <span 
              v-if="product.compare_at_price && product.compare_at_price > product.price" 
              class="text-lg text-muted-foreground line-through"
            >
              {{ formatPrice(product.compare_at_price) }}
            </span>
          </div>

          <div class="prose dark:prose-invert max-w-none text-muted-foreground">
            <p>{{ product.description }}</p>
          </div>

          <div class="pt-6 border-t space-y-4">
            <Button 
              size="lg" 
              class="w-full md:w-auto shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow" 
              @click="handleAddToCart" 
              :disabled="product.stock_quantity === 0"
            >
              <ShoppingCart class="mr-2 h-5 w-5" />
              {{ product.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock' }}
            </Button>
            <p v-if="product.stock_quantity > 0 && product.stock_quantity < 5" class="text-sm text-amber-500">
              Only {{ product.stock_quantity }} left in stock!
            </p>
          </div>

          <!-- Metadata Specs -->
          <div v-if="product.metadata && Object.keys(product.metadata).length" class="pt-6 border-t">
            <h3 class="font-semibold mb-4">Specifications</h3>
            <dl class="space-y-2 text-sm">
              <div 
                v-for="(val, key) in product.metadata" 
                :key="key" 
                class="grid gap-1 border-b pb-2 sm:grid-cols-3"
              >
                <dt class="font-medium capitalize text-muted-foreground">{{ String(key).replace(/_/g, ' ') }}</dt>
                <dd class="sm:col-span-2">{{ val }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="mt-16 pt-8 border-t">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 class="text-2xl font-bold">Customer Reviews</h2>
          <Button
            v-if="user && !userReview"
            class="gap-2 bg-violet-600 hover:bg-violet-500 text-white"
            @click="handleWriteReview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Write a Review
          </Button>
          <Button
            v-else-if="user && userReview"
            variant="outline"
            class="gap-2 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
            @click="handleWriteReview"
          >
            Edit Your Review
          </Button>
          <Button
            v-else
            as-child
            variant="outline"
            class="gap-2 border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          >
            <NuxtLink to="/login">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Sign in to Review
            </NuxtLink>
          </Button>
        </div>
        
        <!-- Review Summary -->
        <div class="mb-8">
          <LazyReviewSummary :stats="reviewStats" :loading="reviewsLoading && !reviews.length" />
        </div>
        
        <!-- Review Form Sheet -->
        <Sheet v-model:open="showReviewForm">
          <SheetContent side="right" class="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader class="pb-4">
              <SheetTitle>{{ isEditingReview ? 'Edit Your Review' : 'Write a Review' }}</SheetTitle>
              <SheetDescription class="text-slate-400">
                Share your experience with this product. Minimum 10 characters required.
              </SheetDescription>
            </SheetHeader>
            <LazyReviewForm
              :initial-rating="userReview?.rating || 0"
              :initial-title="userReview?.title || ''"
              :initial-comment="userReview?.comment || ''"
              :is-editing="isEditingReview"
              :loading="reviewFormLoading"
              @submit="handleSubmitReview"
              @cancel="showReviewForm = false"
            />
          </SheetContent>
        </Sheet>
        
        <!-- Reviews List -->
        <LazyReviewList
          :reviews="reviews"
          :loading="reviewsLoading"
          :has-more="hasMoreReviews"
          @sort-change="handleSortChange"
          @load-more="handleLoadMore"
          @write-review="handleWriteReview"
          @vote-helpful="handleVoteHelpful"
          @edit-review="handleEditReview"
          @delete-review="handleDeleteReview"
        />
      </div>
    </div>
  </div>
</template>
