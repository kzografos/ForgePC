import { readBody } from '#imports'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import createOrderHandler from '~/server/api/orders/create.post'
import { createQueryBuilder } from '../../../fixtures/supabase'

describe('server/api/orders/create.post', () => {
  const readBodyMock = vi.mocked(readBody)
  const serverSupabaseClientMock = vi.mocked(serverSupabaseClient)
  const serverSupabaseUserMock = vi.mocked(serverSupabaseUser)

  const orderBody = {
    items: [
      {
        productId: 'product-1',
        product: {
          id: 'product-1',
          name: 'RTX Build',
          price: 1299,
        },
        quantity: 2,
      },
    ],
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

  it('creates an order, order items, and clears the cart', async () => {
    const insertOrderQuery = createQueryBuilder({
      data: {
        id: 'order-1',
        order_number: 'FP-ORDER-1',
        total: 2598,
        status: 'pending',
        created_at: '2026-01-01T00:00:00.000Z',
      },
      error: null,
    })
    const insertOrderItemsQuery = createQueryBuilder({ error: null })
    const clearCartQuery = createQueryBuilder({ error: null })
    let ordersCallCount = 0

    serverSupabaseUserMock.mockResolvedValue({ id: 'user-1' } as never)
    serverSupabaseClientMock.mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === 'orders') {
          ordersCallCount += 1
          return insertOrderQuery
        }

        if (table === 'order_items') {
          return insertOrderItemsQuery
        }

        if (table === 'cart_items') {
          return clearCartQuery
        }

        return createQueryBuilder({ data: null, error: null })
      }),
    } as never)
    readBodyMock.mockResolvedValue(orderBody as never)

    const result = await createOrderHandler({} as never)

    expect(ordersCallCount).toBe(1)
    expect(insertOrderItemsQuery.insert).toHaveBeenCalledWith([
      {
        order_id: 'order-1',
        product_id: 'product-1',
        product_name: 'RTX Build',
        quantity: 2,
        unit_price: 1299,
        total_price: 2598,
      },
    ])
    expect(clearCartQuery.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(result).toEqual({
      success: true,
      order: {
        id: 'order-1',
        orderNumber: 'FP-ORDER-1',
        total: 2598,
        status: 'pending',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    })
  })

  it('rolls back the order when order item creation fails', async () => {
    const insertOrderQuery = createQueryBuilder({
      data: {
        id: 'order-1',
        order_number: 'FP-ORDER-1',
        total: 2598,
        status: 'pending',
        created_at: '2026-01-01T00:00:00.000Z',
      },
      error: null,
    })
    const insertOrderItemsQuery = createQueryBuilder({
      error: { message: 'insert failed' },
    })
    const rollbackOrderQuery = createQueryBuilder({ error: null })
    let ordersCallCount = 0

    serverSupabaseUserMock.mockResolvedValue({ id: 'user-1' } as never)
    serverSupabaseClientMock.mockResolvedValue({
      from: vi.fn((table: string) => {
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
    readBodyMock.mockResolvedValue(orderBody as never)

    await expect(createOrderHandler({} as never)).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'Failed to create order items - transaction rolled back',
    })
    expect(rollbackOrderQuery.delete).toHaveBeenCalled()
    expect(rollbackOrderQuery.eq).toHaveBeenCalledWith('id', 'order-1')
  })

  it('requires an authenticated user and shipping details', async () => {
    serverSupabaseUserMock.mockResolvedValue(null)
    readBodyMock.mockResolvedValue(orderBody as never)

    await expect(createOrderHandler({} as never)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: 'Unauthorized - Please log in to place an order',
    })

    serverSupabaseUserMock.mockResolvedValue({ id: 'user-1' } as never)
    readBodyMock.mockResolvedValue({
      items: orderBody.items,
      shipping: {
        ...orderBody.shipping,
        address: '',
      },
    } as never)

    await expect(createOrderHandler({} as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Shipping information is required',
    })
  })

  it('still returns a successful order when cart clearing fails', async () => {
    const insertOrderQuery = createQueryBuilder({
      data: {
        id: 'order-1',
        order_number: 'FP-ORDER-1',
        total: 2598,
        status: 'pending',
        created_at: '2026-01-01T00:00:00.000Z',
      },
      error: null,
    })
    const insertOrderItemsQuery = createQueryBuilder({ error: null })
    const clearCartQuery = createQueryBuilder({
      error: { message: 'cart delete failed' },
    })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    serverSupabaseUserMock.mockResolvedValue({ id: 'user-1' } as never)
    serverSupabaseClientMock.mockResolvedValue({
      from: vi.fn((table: string) => {
        if (table === 'orders') {
          return insertOrderQuery
        }

        if (table === 'order_items') {
          return insertOrderItemsQuery
        }

        if (table === 'cart_items') {
          return clearCartQuery
        }

        return createQueryBuilder({ data: null, error: null })
      }),
    } as never)
    readBodyMock.mockResolvedValue(orderBody as never)

    const result = await createOrderHandler({} as never)

    expect(warnSpy).toHaveBeenCalled()
    expect(result).toMatchObject({
      success: true,
      order: {
        id: 'order-1',
      },
    })
  })
})
