vi.mock('~/server/utils/stripeInstance', () => ({
  useStripeClient: vi.fn(),
}))

import { getHeader, getQuery, getRequestURL, readBody, readRawBody, useRuntimeConfig } from '#imports'
import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { useStripeClient } from '~/server/utils/stripeInstance'
import createCheckoutSessionHandler from '~/server/api/stripe/create-checkout-session.post'
import verifySessionHandler from '~/server/api/stripe/verify-session.get'
import webhookHandler from '~/server/api/stripe/webhook.post'
import { createQueryBuilder } from '../../../fixtures/supabase'

describe('server/api/stripe/create-checkout-session.post', () => {
  const getRequestURLMock = vi.mocked(getRequestURL)
  const readBodyMock = vi.mocked(readBody)
  const serverSupabaseClientMock = vi.mocked(serverSupabaseClient)
  const serverSupabaseUserMock = vi.mocked(serverSupabaseUser)
  const useStripeClientMock = vi.mocked(useStripeClient)

  const checkoutBody = {
    items: [{ productId: 'product-1', quantity: 2 }],
    shipping: {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+30 555 1234',
      address: '42 Silicon Street',
      city: 'Athens',
      postalCode: '10558',
      country: 'GR',
    },
  }

  it('creates a Stripe checkout session using trusted database prices', async () => {
    const productsQuery = createQueryBuilder({
      data: [
        {
          id: 'product-1',
          name: 'Premium GPU',
          price: 199.99,
          images: ['https://cdn.example.com/gpu.jpg'],
        },
      ],
      error: null,
    })
    const insertOrderQuery = createQueryBuilder({
      data: {
        id: 'order-1',
        order_number: 'ORD-123',
        total: 399.98,
        status: 'pending',
      },
      error: null,
    })
    const insertOrderItemsQuery = createQueryBuilder({ error: null })
    const updateOrderQuery = createQueryBuilder({ error: null })
    let ordersCallCount = 0
    const stripeCheckoutCreate = vi.fn().mockResolvedValue({
      id: 'cs_test_1',
      url: 'https://checkout.stripe.test/session',
    })

    serverSupabaseUserMock.mockResolvedValue({
      id: 'user-1',
      email: 'buyer@example.com',
    } as never)
    serverSupabaseClientMock.mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === 'products') {
          return productsQuery
        }

        if (table === 'orders') {
          ordersCallCount += 1
          return ordersCallCount === 1 ? insertOrderQuery : updateOrderQuery
        }

        if (table === 'order_items') {
          return insertOrderItemsQuery
        }

        return createQueryBuilder({ data: null, error: null })
      }),
    } as never)
    useStripeClientMock.mockReturnValue({
      checkout: {
        sessions: {
          create: stripeCheckoutCreate,
        },
      },
    } as never)
    readBodyMock.mockResolvedValue(checkoutBody as never)
    getRequestURLMock.mockReturnValue(new URL('https://forgepc.test/checkout'))

    const result = await createCheckoutSessionHandler({} as never)

    expect(stripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'buyer@example.com',
        success_url: 'https://forgepc.test/checkout/success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://forgepc.test/cart',
        line_items: [
          expect.objectContaining({
            quantity: 2,
            price_data: expect.objectContaining({
              unit_amount: 19999,
            }),
          }),
        ],
      }),
    )
    expect(insertOrderItemsQuery.insert).toHaveBeenCalledWith([
      {
        order_id: 'order-1',
        product_id: 'product-1',
        product_name: 'Premium GPU',
        quantity: 2,
        unit_price: 199.99,
        total_price: 399.98,
      },
    ])
    expect(updateOrderQuery.update).toHaveBeenCalledWith({
      stripe_payment_intent: 'cs_test_1',
    })
    expect(result).toEqual({
      url: 'https://checkout.stripe.test/session',
      orderId: 'order-1',
      orderNumber: expect.any(String),
    })
  })

  it('rolls back the pending order when order item creation fails', async () => {
    const productsQuery = createQueryBuilder({
      data: [
        {
          id: 'product-1',
          name: 'Premium GPU',
          price: 199.99,
          images: [],
        },
      ],
      error: null,
    })
    const insertOrderQuery = createQueryBuilder({
      data: {
        id: 'order-1',
        order_number: 'ORD-123',
        total: 399.98,
        status: 'pending',
      },
      error: null,
    })
    const insertOrderItemsQuery = createQueryBuilder({
      error: { message: 'order item insert failed' },
    })
    const rollbackOrderQuery = createQueryBuilder({ error: null })
    let ordersCallCount = 0

    serverSupabaseUserMock.mockResolvedValue({
      id: 'user-1',
      email: 'buyer@example.com',
    } as never)
    serverSupabaseClientMock.mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === 'products') {
          return productsQuery
        }

        if (table === 'orders') {
          ordersCallCount += 1
          return ordersCallCount === 1 ? insertOrderQuery : rollbackOrderQuery
        }

        if (table === 'order_items') {
          return insertOrderItemsQuery
        }

        return createQueryBuilder({ data: null, error: null })
      }),
    } as never)
    useStripeClientMock.mockReturnValue({
      checkout: {
        sessions: {
          create: vi.fn(),
        },
      },
    } as never)
    readBodyMock.mockResolvedValue(checkoutBody as never)

    await expect(createCheckoutSessionHandler({} as never)).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Failed to create order items',
    })
    expect(rollbackOrderQuery.delete).toHaveBeenCalled()
    expect(rollbackOrderQuery.eq).toHaveBeenCalledWith('id', 'order-1')
  })

  it('requires a signed-in user, items in the cart, and shipping details', async () => {
    serverSupabaseUserMock.mockResolvedValue(null)
    readBodyMock.mockResolvedValue(checkoutBody as never)

    await expect(createCheckoutSessionHandler({} as never)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Unauthorized - Please log in to checkout',
    })

    serverSupabaseUserMock.mockResolvedValue({
      id: 'user-1',
      email: 'buyer@example.com',
    } as never)
    readBodyMock.mockResolvedValue({ items: [], shipping: checkoutBody.shipping } as never)

    await expect(createCheckoutSessionHandler({} as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Cart is empty',
    })

    readBodyMock.mockResolvedValue({
      items: checkoutBody.items,
      shipping: { ...checkoutBody.shipping, address: '' },
    } as never)

    await expect(createCheckoutSessionHandler({} as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Shipping information is required',
    })
  })

  it('fails when products cannot be fetched or a requested product is missing', async () => {
    serverSupabaseUserMock.mockResolvedValue({
      id: 'user-1',
      email: 'buyer@example.com',
    } as never)
    readBodyMock.mockResolvedValue(checkoutBody as never)

    serverSupabaseClientMock.mockResolvedValue({
      from: vi.fn(() =>
        createQueryBuilder({
          data: null,
          error: { message: 'products query failed' },
        }),
      ),
    } as never)
    useStripeClientMock.mockReturnValue({
      checkout: {
        sessions: {
          create: vi.fn(),
        },
      },
    } as never)

    await expect(createCheckoutSessionHandler({} as never)).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Failed to fetch products',
    })

    serverSupabaseClientMock.mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === 'products') {
          return createQueryBuilder({
            data: [],
            error: null,
          })
        }

        return createQueryBuilder({ data: null, error: null })
      }),
    } as never)

    await expect(createCheckoutSessionHandler({} as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Product not found: product-1',
    })
  })

  it('fails when the pending order cannot be created', async () => {
    const productsQuery = createQueryBuilder({
      data: [
        {
          id: 'product-1',
          name: 'Premium GPU',
          price: 199.99,
          images: [],
        },
      ],
      error: null,
    })
    const insertOrderQuery = createQueryBuilder({
      data: null,
      error: { message: 'order insert failed' },
    })

    serverSupabaseUserMock.mockResolvedValue({
      id: 'user-1',
      email: 'buyer@example.com',
    } as never)
    serverSupabaseClientMock.mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === 'products') {
          return productsQuery
        }

        if (table === 'orders') {
          return insertOrderQuery
        }

        return createQueryBuilder({ data: null, error: null })
      }),
    } as never)
    useStripeClientMock.mockReturnValue({
      checkout: {
        sessions: {
          create: vi.fn(),
        },
      },
    } as never)
    readBodyMock.mockResolvedValue(checkoutBody as never)

    await expect(createCheckoutSessionHandler({} as never)).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Failed to create order',
    })
  })
})

describe('server/api/stripe/verify-session.get', () => {
  const getQueryMock = vi.mocked(getQuery)
  const serverSupabaseServiceRoleMock = vi.mocked(serverSupabaseServiceRole)
  const useStripeClientMock = vi.mocked(useStripeClient)

  it('marks paid sessions as paid orders and returns the order summary', async () => {
    const updateOrderQuery = createQueryBuilder({
      data: {
        id: 'order-1',
        order_number: 'ORD-123',
        total: 399.98,
      },
      error: null,
    })

    getQueryMock.mockReturnValue({ session_id: 'cs_test_1' })
    useStripeClientMock.mockReturnValue({
      checkout: {
        sessions: {
          retrieve: vi.fn().mockResolvedValue({
            id: 'cs_test_1',
            payment_status: 'paid',
            payment_intent: 'pi_1',
            metadata: {
              order_id: 'order-1',
              order_number: 'ORD-123',
            },
          }),
        },
      },
    } as never)
    serverSupabaseServiceRoleMock.mockResolvedValue({
      from: vi.fn(() => updateOrderQuery),
    } as never)

    const result = await verifySessionHandler({} as never)

    expect(updateOrderQuery.update).toHaveBeenCalledWith({
      status: 'paid',
      stripe_payment_intent: 'pi_1',
    })
    expect(result).toEqual({
      success: true,
      status: 'paid',
      orderNumber: 'ORD-123',
      total: 399.98,
      orderId: 'order-1',
    })
  })

  it('returns a non-success response for unpaid sessions', async () => {
    getQueryMock.mockReturnValue({ session_id: 'cs_test_2' })
    useStripeClientMock.mockReturnValue({
      checkout: {
        sessions: {
          retrieve: vi.fn().mockResolvedValue({
            id: 'cs_test_2',
            payment_status: 'open',
            metadata: {
              order_id: 'order-2',
            },
          }),
        },
      },
    } as never)

    const result = await verifySessionHandler({} as never)

    expect(result).toEqual({
      success: false,
      status: 'open',
      message: 'Payment not completed',
    })
  })

  it('returns a successful fallback when a paid session has no order metadata', async () => {
    getQueryMock.mockReturnValue({ session_id: 'cs_test_3' })
    useStripeClientMock.mockReturnValue({
      checkout: {
        sessions: {
          retrieve: vi.fn().mockResolvedValue({
            id: 'cs_test_3',
            payment_status: 'paid',
            metadata: {},
          }),
        },
      },
    } as never)

    const result = await verifySessionHandler({} as never)

    expect(result).toEqual({
      success: true,
      status: 'paid',
      orderNumber: null,
      message: 'Payment successful but order not found',
    })
  })

  it('throws when Stripe cannot find the checkout session', async () => {
    getQueryMock.mockReturnValue({ session_id: 'missing-session' })
    useStripeClientMock.mockReturnValue({
      checkout: {
        sessions: {
          retrieve: vi.fn().mockResolvedValue(null),
        },
      },
    } as never)

    await expect(verifySessionHandler({} as never)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Session not found',
    })
  })

  it('requires a session id', async () => {
    getQueryMock.mockReturnValue({})

    await expect(verifySessionHandler({} as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Session ID is required',
    })
  })
})

describe('server/api/stripe/webhook.post', () => {
  const getHeaderMock = vi.mocked(getHeader)
  const readRawBodyMock = vi.mocked(readRawBody)
  const serverSupabaseServiceRoleMock = vi.mocked(serverSupabaseServiceRole)
  const useRuntimeConfigMock = vi.mocked(useRuntimeConfig)
  const useStripeClientMock = vi.mocked(useStripeClient)

  beforeEach(() => {
    readRawBodyMock.mockResolvedValue('webhook-body' as never)
    getHeaderMock.mockImplementation((_event, header) =>
      header === 'stripe-signature' ? 'sig_test' : undefined,
    )
    useRuntimeConfigMock.mockReturnValue({
      stripeWebhookSecret: 'whsec_test',
    })
  })

  it('processes completed checkout sessions and notifies admins', async () => {
    const updateOrderQuery = createQueryBuilder({ error: null })
    const clearCartQuery = createQueryBuilder({ error: null })
    const orderLookupQuery = createQueryBuilder({
      data: {
        order_number: 'ORD-123',
        total: 399.98,
      },
      error: null,
    })
    const customerProfileQuery = createQueryBuilder({
      data: {
        full_name: 'Jane Doe',
        email: 'buyer@example.com',
      },
      error: null,
    })
    const adminsQuery = createQueryBuilder({
      data: [{ id: 'admin-1' }],
      error: null,
    })
    const insertNotificationsQuery = createQueryBuilder({ error: null })
    let ordersCallCount = 0
    let profilesCallCount = 0

    useStripeClientMock.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_1',
              payment_intent: 'pi_1',
              metadata: {
                order_id: 'order-1',
                order_number: 'ORD-123',
                user_id: 'user-1',
              },
            },
          },
        })),
      },
    } as never)
    serverSupabaseServiceRoleMock.mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === 'orders') {
          ordersCallCount += 1
          return ordersCallCount === 1 ? updateOrderQuery : orderLookupQuery
        }

        if (table === 'cart_items') {
          return clearCartQuery
        }

        if (table === 'profiles') {
          profilesCallCount += 1
          return profilesCallCount === 1 ? customerProfileQuery : adminsQuery
        }

        if (table === 'admin_notifications') {
          return insertNotificationsQuery
        }

        return createQueryBuilder({ data: null, error: null })
      }),
    } as never)

    const result = await webhookHandler({} as never)

    expect(updateOrderQuery.update).toHaveBeenCalledWith({
      status: 'paid',
      stripe_payment_intent: 'pi_1',
    })
    expect(clearCartQuery.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(insertNotificationsQuery.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        admin_id: 'admin-1',
        type: 'new_order',
        related_id: 'order-1',
        metadata: expect.objectContaining({
          customerName: 'Jane Doe',
          total: 399.98,
        }),
      }),
    ])
    expect(result).toEqual({ received: true })
  })

  it('processes failed payment intents and notifies admins', async () => {
    const orderLookupQuery = createQueryBuilder({
      data: {
        order_number: 'ORD-456',
        total: 259.99,
      },
      error: null,
    })
    const adminsQuery = createQueryBuilder({
      data: [{ id: 'admin-1' }],
      error: null,
    })
    const insertNotificationsQuery = createQueryBuilder({ error: null })

    useStripeClientMock.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          type: 'payment_intent.payment_failed',
          data: {
            object: {
              id: 'pi_failed_1',
              amount: 25999,
              metadata: {
                order_id: 'order-2',
                order_number: 'ORD-456',
              },
              last_payment_error: {
                message: 'Card declined',
              },
            },
          },
        })),
      },
    } as never)
    serverSupabaseServiceRoleMock.mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === 'orders') {
          return orderLookupQuery
        }

        if (table === 'profiles') {
          return adminsQuery
        }

        if (table === 'admin_notifications') {
          return insertNotificationsQuery
        }

        return createQueryBuilder({ data: null, error: null })
      }),
    } as never)

    const result = await webhookHandler({} as never)

    expect(insertNotificationsQuery.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        admin_id: 'admin-1',
        type: 'payment_failure',
        metadata: expect.objectContaining({
          amount: 259.99,
          failureReason: 'Card declined',
          paymentIntentId: 'pi_failed_1',
        }),
      }),
    ])
    expect(result).toEqual({ received: true })
  })

  it('returns an error response when completed sessions are missing order metadata', async () => {
    useStripeClientMock.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_2',
              metadata: {},
            },
          },
        })),
      },
    } as never)
    serverSupabaseServiceRoleMock.mockResolvedValue({
      from: vi.fn(() => createQueryBuilder({ data: null, error: null })),
    } as never)

    const result = await webhookHandler({} as never)

    expect(result).toEqual({ received: true, error: 'No order_id in metadata' })
  })

  it('marks expired checkout sessions as expired orders', async () => {
    const expireOrderQuery = createQueryBuilder({ error: null })

    useStripeClientMock.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          type: 'checkout.session.expired',
          data: {
            object: {
              metadata: {
                order_id: 'order-1',
              },
            },
          },
        })),
      },
    } as never)
    serverSupabaseServiceRoleMock.mockResolvedValue({
      from: vi.fn(() => expireOrderQuery),
    } as never)

    const result = await webhookHandler({} as never)

    expect(expireOrderQuery.update).toHaveBeenCalledWith({ status: 'expired' })
    expect(result).toEqual({ received: true })
  })

  it('surfaces missing webhook secrets and invalid signatures', async () => {
    useRuntimeConfigMock.mockReturnValue({})

    await expect(webhookHandler({} as never)).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Webhook secret not configured',
    })

    useRuntimeConfigMock.mockReturnValue({
      stripeWebhookSecret: 'whsec_test',
    })
    useStripeClientMock.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => {
          throw new Error('invalid signature')
        }),
      },
    } as never)

    await expect(webhookHandler({} as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Webhook Error: invalid signature',
    })
  })

  it('returns a received error when paid orders cannot be updated', async () => {
    const updateOrderQuery = createQueryBuilder({
      error: { message: 'update failed' },
    })

    useStripeClientMock.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn(() => ({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_test_3',
              payment_intent: 'pi_failed',
              metadata: {
                order_id: 'order-1',
              },
            },
          },
        })),
      },
    } as never)
    serverSupabaseServiceRoleMock.mockResolvedValue({
      from: vi.fn(() => updateOrderQuery),
    } as never)

    const result = await webhookHandler({} as never)

    expect(result).toEqual({ received: true, error: 'Failed to update order' })
  })

  it('requires both the raw body and Stripe signature', async () => {
    readRawBodyMock.mockResolvedValue(null as never)

    await expect(webhookHandler({} as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Missing body or signature',
    })
  })
})
