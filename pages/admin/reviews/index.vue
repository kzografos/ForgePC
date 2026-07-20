<script setup lang="ts">
import { Star, Trash2, Flag, MessageSquare, CheckCircle, Search, Filter, Eye } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Database } from '~/types/database.types'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

interface ReviewWithProduct {
  id: string
  user_id: string
  product_id: string
  rating: number
  title: string | null
  comment: string
  is_approved: boolean
  is_flagged: boolean
  created_at: string | null
  profiles: {
    full_name: string | null
    email: string | null
  } | null
  products: {
    name: string
    slug: string
  } | null
  review_responses: {
    id: string
    response: string
  }[] | null
}

const client = useSupabaseClient<Database>()

const reviews = ref<ReviewWithProduct[]>([])
const loading = ref(true)
const searchQuery = ref('')
const filterStatus = ref<'all' | 'approved' | 'flagged' | 'pending'>('all')

// Response sheet state
const showResponseSheet = ref(false)
const selectedReview = ref<ReviewWithProduct | null>(null)
const responseText = ref('')
const responseLoading = ref(false)

// Fetch reviews
const fetchReviews = async () => {
  loading.value = true
  try {
    let query = client
      .from('reviews')
      .select(`
        id,
        user_id,
        product_id,
        rating,
        title,
        comment,
        is_approved,
        is_flagged,
        created_at,
        profiles:user_id (
          full_name,
          email
        ),
        products:product_id (
          name,
          slug
        ),
        review_responses (
          id,
          response
        )
      `)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filterStatus.value === 'approved') {
      query = query.eq('is_approved', true).eq('is_flagged', false)
    } else if (filterStatus.value === 'flagged') {
      query = query.eq('is_flagged', true)
    } else if (filterStatus.value === 'pending') {
      query = query.eq('is_approved', false)
    }

    const { data, error } = await query

    if (error) throw error

    reviews.value = (data as any) || []
  } catch (error) {
    console.error('Error fetching reviews:', error)
    toast.error('Failed to fetch reviews')
  } finally {
    loading.value = false
  }
}

// Filtered reviews based on search
const filteredReviews = computed(() => {
  if (!searchQuery.value) return reviews.value
  
  const query = searchQuery.value.toLowerCase()
  return reviews.value.filter(review => 
    review.products?.name.toLowerCase().includes(query) ||
    review.profiles?.full_name?.toLowerCase().includes(query) ||
    review.profiles?.email?.toLowerCase().includes(query) ||
    review.comment.toLowerCase().includes(query) ||
    review.title?.toLowerCase().includes(query)
  )
})

// Toggle approval status
const toggleApproval = async (review: ReviewWithProduct) => {
  try {
    const { error } = await client
      .from('reviews')
      .update({ 
        is_approved: !review.is_approved,
        is_flagged: false // Clear flag when approving
      })
      .eq('id', review.id)

    if (error) throw error

    review.is_approved = !review.is_approved
    review.is_flagged = false
    toast.success(review.is_approved ? 'Review approved' : 'Review unapproved')
  } catch (error) {
    console.error('Error updating review:', error)
    toast.error('Failed to update review')
  }
}

// Toggle flag status
const toggleFlag = async (review: ReviewWithProduct) => {
  try {
    const { error } = await client
      .from('reviews')
      .update({ is_flagged: !review.is_flagged })
      .eq('id', review.id)

    if (error) throw error

    review.is_flagged = !review.is_flagged
    toast.success(review.is_flagged ? 'Review flagged' : 'Review unflagged')
  } catch (error) {
    console.error('Error flagging review:', error)
    toast.error('Failed to flag review')
  }
}

// Delete review
const { blockedInDemo } = useDemoGuard()
const deleteReview = async (review: ReviewWithProduct) => {
  if (blockedInDemo('Deleting reviews')) return
  if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return
  
  try {
    const { error } = await client
      .from('reviews')
      .delete()
      .eq('id', review.id)

    if (error) throw error

    reviews.value = reviews.value.filter(r => r.id !== review.id)
    toast.success('Review deleted')
  } catch (error) {
    console.error('Error deleting review:', error)
    toast.error('Failed to delete review')
  }
}

// Open response sheet
const openResponseSheet = (review: ReviewWithProduct) => {
  selectedReview.value = review
  responseText.value = review.review_responses?.[0]?.response || ''
  showResponseSheet.value = true
}

// Submit response
const submitResponse = async () => {
  if (!selectedReview.value || !responseText.value.trim()) return
  
  responseLoading.value = true
  try {
    const existingResponse = selectedReview.value.review_responses?.[0]
    
    if (existingResponse) {
      // Update existing response
      const { error } = await client
        .from('review_responses')
        .update({ response: responseText.value.trim() })
        .eq('id', existingResponse.id)
      
      if (error) throw error
    } else {
      // Create new response
      const user = useSupabaseUser()
      const { error } = await client
        .from('review_responses')
        .insert({
          review_id: selectedReview.value.id,
          admin_id: user.value!.id,
          response: responseText.value.trim()
        })
      
      if (error) throw error
    }
    
    toast.success('Response saved')
    showResponseSheet.value = false
    await fetchReviews()
  } catch (error) {
    console.error('Error saving response:', error)
    toast.error('Failed to save response')
  } finally {
    responseLoading.value = false
  }
}

// Format date
const formatDate = (date: string | null) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Generate stars display
const getStarsDisplay = (rating: number) => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

onMounted(() => {
  fetchReviews()
})

// Watch filter changes
watch(filterStatus, () => {
  fetchReviews()
})
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-white">Reviews</h1>
      <p class="mt-1 text-slate-400">Manage customer reviews and responses</p>
    </div>

    <!-- Toolbar -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <!-- Search -->
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          v-model="searchQuery"
          placeholder="Search reviews..."
          class="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
        />
      </div>
      
      <!-- Filters -->
      <div class="flex items-center gap-3">
        <Select v-model="filterStatus">
          <SelectTrigger class="w-[150px] bg-white/5 border-white/10 text-white">
            <Filter class="mr-2 h-4 w-4 text-slate-400" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>

    <!-- Empty State -->
    <div 
      v-else-if="filteredReviews.length === 0" 
      class="rounded-2xl border border-white/10 bg-white/5 p-12 text-center backdrop-blur-md"
    >
      <Star class="mx-auto h-12 w-12 text-slate-600" />
      <h3 class="mt-4 text-lg font-medium text-white">No reviews found</h3>
      <p class="mt-2 text-slate-400">
        {{ searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Reviews will appear here once customers submit them' }}
      </p>
    </div>

    <!-- Reviews Table -->
    <div v-else class="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
      <table class="min-w-[760px] w-full">
        <thead>
          <tr class="border-b border-white/10 text-left text-sm text-slate-400">
            <th class="px-4 py-3 font-medium">Product</th>
            <th class="px-4 py-3 font-medium">Customer</th>
            <th class="px-4 py-3 font-medium">Rating</th>
            <th class="px-4 py-3 font-medium hidden lg:table-cell">Comment</th>
            <th class="px-4 py-3 font-medium">Date</th>
            <th class="px-4 py-3 font-medium">Status</th>
            <th class="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr 
            v-for="review in filteredReviews" 
            :key="review.id" 
            class="hover:bg-white/5 transition-colors"
          >
            <!-- Product -->
            <td class="px-4 py-4">
              <NuxtLink 
                :to="`/products/${review.products?.slug}`"
                class="font-medium text-white hover:text-violet-400 transition-colors line-clamp-1"
              >
                {{ review.products?.name || 'Unknown Product' }}
              </NuxtLink>
            </td>
            
            <!-- Customer -->
            <td class="px-4 py-4">
              <div>
                <p class="text-white">{{ review.profiles?.full_name || 'Anonymous' }}</p>
                <p class="text-xs text-slate-400">{{ review.profiles?.email }}</p>
              </div>
            </td>
            
            <!-- Rating -->
            <td class="px-4 py-4">
              <span class="text-violet-400">{{ getStarsDisplay(review.rating) }}</span>
            </td>
            
            <!-- Comment -->
            <td class="px-4 py-4 hidden lg:table-cell">
              <p class="text-slate-300 line-clamp-2 max-w-xs">
                <span v-if="review.title" class="font-medium">{{ review.title }}: </span>
                {{ review.comment }}
              </p>
            </td>
            
            <!-- Date -->
            <td class="px-4 py-4 text-slate-400">
              {{ formatDate(review.created_at) }}
            </td>
            
            <!-- Status -->
            <td class="px-4 py-4">
              <div class="flex flex-col gap-1">
                <Badge 
                  v-if="review.is_flagged"
                  variant="outline"
                  class="border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs"
                >
                  Flagged
                </Badge>
                <Badge 
                  v-else-if="review.is_approved"
                  variant="outline"
                  class="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs"
                >
                  Approved
                </Badge>
                <Badge 
                  v-else
                  variant="outline"
                  class="border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs"
                >
                  Pending
                </Badge>
                <Badge 
                  v-if="review.review_responses?.length"
                  variant="outline"
                  class="border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs"
                >
                  Responded
                </Badge>
              </div>
            </td>
            
            <!-- Actions -->
            <td class="px-4 py-4">
              <div class="flex items-center justify-end gap-2">
                <!-- Approve/Unapprove -->
                <Button
                  variant="ghost"
                  size="sm"
                  :class="review.is_approved ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-400 hover:text-white'"
                  @click="toggleApproval(review)"
                  :title="review.is_approved ? 'Unapprove' : 'Approve'"
                >
                  <CheckCircle class="h-4 w-4" />
                </Button>
                
                <!-- Flag -->
                <Button
                  variant="ghost"
                  size="sm"
                  :class="review.is_flagged ? 'text-rose-400 hover:text-rose-300' : 'text-slate-400 hover:text-white'"
                  @click="toggleFlag(review)"
                  :title="review.is_flagged ? 'Unflag' : 'Flag'"
                >
                  <Flag class="h-4 w-4" />
                </Button>
                
                <!-- Respond -->
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-slate-400 hover:text-violet-400"
                  @click="openResponseSheet(review)"
                  title="Respond"
                >
                  <MessageSquare class="h-4 w-4" />
                </Button>
                
                <!-- Delete -->
                <Button
                  variant="ghost"
                  size="sm"
                  class="text-slate-400 hover:text-rose-400"
                  @click="deleteReview(review)"
                  title="Delete"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Response Sheet -->
    <Sheet v-model:open="showResponseSheet">
      <SheetContent class="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Respond to Review</SheetTitle>
        </SheetHeader>
        
        <div v-if="selectedReview" class="mt-6 space-y-6">
          <!-- Review Details -->
          <div class="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-slate-400">{{ selectedReview.profiles?.full_name || 'Anonymous' }}</span>
              <span class="text-violet-400">{{ getStarsDisplay(selectedReview.rating) }}</span>
            </div>
            <p v-if="selectedReview.title" class="font-medium text-white">{{ selectedReview.title }}</p>
            <p class="text-slate-300">{{ selectedReview.comment }}</p>
          </div>
          
          <!-- Response Form -->
          <div class="space-y-3">
            <Label class="text-white">Your Response</Label>
            <Textarea
              v-model="responseText"
              placeholder="Write a response to this review..."
              rows="5"
              class="bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none"
            />
            <p class="text-xs text-slate-500">
              This response will be publicly visible on the product page.
            </p>
          </div>
          
          <!-- Actions -->
          <div class="flex justify-end gap-3">
            <Button
              variant="ghost"
              class="text-slate-400 hover:text-white"
              @click="showResponseSheet = false"
            >
              Cancel
            </Button>
            <Button
              :disabled="!responseText.trim() || responseLoading"
              class="bg-violet-600 hover:bg-violet-500 text-white"
              @click="submitResponse"
            >
              {{ responseLoading ? 'Saving...' : (selectedReview.review_responses?.length ? 'Update Response' : 'Submit Response') }}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>
