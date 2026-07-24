import { serverSupabaseServiceRole } from '#supabase/server'
import { sendWelcomeEmail } from '~/server/utils/emailService'

export default defineEventHandler(async (event) => {
  // Parse request body
  const body = await readBody(event)
  
  // Validate email
  const email = body?.email?.trim()?.toLowerCase()
  
  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required'
    })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Please enter a valid email address'
    })
  }

  // Use service role client for admin operations (bypasses RLS)
  const supabase = await serverSupabaseServiceRole(event)

  try {
    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', email)
      .single()

    if (existing) {
      if (existing.is_active) {
        throw createError({
          statusCode: 409,
          statusMessage: 'This email is already subscribed to our newsletter'
        })
      } else {
        // Reactivate inactive subscription
        await supabase
          .from('newsletter_subscribers')
          .update({ is_active: true })
          .eq('id', existing.id)
        
        // Send welcome email again
        await sendWelcomeEmail(email)
        
        return {
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.'
        }
      }
    }

    // Create new subscription
    const { error: insertError } = await supabase
      .from('newsletter_subscribers')
      .insert({ email })

    if (insertError) {
      console.error('Failed to create subscription:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to subscribe. Please try again later.'
      })
    }

    // Send welcome email
    const emailResult = await sendWelcomeEmail(email)
    if (!emailResult.success) {
      console.warn('Welcome email failed to send:', emailResult.error)
      // Don't fail the subscription if email fails
    }

    return {
      success: true,
      message: "Thanks — you're on the list."
    }
  } catch (error: any) {
    // Re-throw createError instances
    if (error.statusCode) {
      throw error
    }
    
    console.error('Subscription error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'An unexpected error occurred. Please try again.'
    })
  }
})
