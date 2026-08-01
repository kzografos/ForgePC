import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database.types'

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `FP-${timestamp}-${random}`
}

interface CartItem {
  productId: string
  product: {
    id: string
    name: string
    price: number
  }
  quantity: number
}

interface ShippingAddress {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
}

interface CreateOrderBody {
  items: CartItem[]
  shipping: ShippingAddress
}

export default defineEventHandler(async (event) => {
  // Get authenticated user
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Please log in to place an order'
    })
  }

  // Get request body
  const body = await readBody<CreateOrderBody>(event)
  
  if (!body.items || body.items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cart is empty'
    })
  }

  if (!body.shipping || !body.shipping.fullName || !body.shipping.address) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Shipping information is required'
    })
  }

  const client = await serverSupabaseClient<Database>(event)
  
  // Calculate totals
  const subtotal = body.items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)
  const shipping = 0 // Free shipping
  const tax = 0 // No tax for now
  const total = subtotal + shipping + tax
  
  const orderNumber = generateOrderNumber()

  try {
    // Start transaction by creating the order first
    const { data: order, error: orderError } = await client
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total,
        status: 'pending',
        notes: JSON.stringify(body.shipping) // Store shipping as JSON in notes for now
      })
      .select()
      .single()

    if (orderError || !order) {
      console.error('Order creation failed:', orderError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create order'
      })
    }

    // Create order items
    const orderItems = body.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.product.price * item.quantity
    }))

    const { error: itemsError } = await client
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Order items creation failed:', itemsError)
      // Rollback: Delete the order if items failed
      await client.from('orders').delete().eq('id', order.id)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create order items - transaction rolled back'
      })
    }

    // Clear user's cart from Supabase
    const { error: cartError } = await client
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (cartError) {
      console.warn('Failed to clear cart:', cartError)
      // Non-critical error, don't fail the order
    }

    // Return success with order details
    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        total: order.total,
        status: order.status,
        createdAt: order.created_at
      }
    }

  } catch (error: any) {
    console.error('Order creation error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'An unexpected error occurred'
    })
  }
})
