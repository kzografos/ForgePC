import { createPinia, setActivePinia } from 'pinia'
import { ref, useSupabaseClient, useSupabaseUser } from '#imports'
import { createQueryBuilder, createSupabaseClientMock } from '../../fixtures/supabase'
import { useCartStore, type CartProduct } from '~/stores/cart'

const product: CartProduct = {
  id: 'gpu-1',
  name: 'RTX 5080',
  slug: 'rtx-5080',
  price: 1299,
  images: ['https://cdn.example.com/gpu.webp'],
  categories: { name: 'GPU', slug: 'gpu' },
}

describe('stores/cart', () => {
  const useSupabaseClientMock = vi.mocked(useSupabaseClient)
  const useSupabaseUserMock = vi.mocked(useSupabaseUser)

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    useSupabaseUserMock.mockReturnValue(ref(null))
    useSupabaseClientMock.mockReturnValue(createSupabaseClientMock())
  })

  it('hydrates from localStorage and updates count/total', () => {
    localStorage.setItem(
      'forgepc-cart',
      JSON.stringify([
        {
          productId: product.id,
          product,
          quantity: 2,
        },
      ]),
    )

    const store = useCartStore()
    store.initFromStorage()

    expect(store.isHydrated).toBe(true)
    expect(store.items).toHaveLength(1)
    expect(store.count).toBe(2)
    expect(store.total).toBe(2598)
  })

  it('migrates a legacy kz-cart payload to the forgepc-cart key', () => {
    localStorage.setItem(
      'kz-cart',
      JSON.stringify([
        {
          productId: product.id,
          product,
          quantity: 3,
        },
      ]),
    )

    const store = useCartStore()
    store.initFromStorage()

    expect(store.count).toBe(3)
    expect(localStorage.getItem('kz-cart')).toBeNull()
    expect(JSON.parse(localStorage.getItem('forgepc-cart') ?? '[]')).toHaveLength(1)
  })

  it('adds, updates, and removes items', async () => {
    const store = useCartStore()

    store.addToCart(product)
    store.addToCart(product, 2)
    expect(store.count).toBe(3)
    expect(store.total).toBe(3897)

    store.updateQuantity(product.id, 1)
    expect(store.count).toBe(1)

    await store.removeFromCart(product.id)
    expect(store.items).toEqual([])
  })

  it('syncs local items with Supabase for authenticated users', async () => {
    const selectBuilder = createQueryBuilder({
      data: [
        {
          product_id: 'cpu-1',
          quantity: 2,
          products: {
            id: 'cpu-1',
            name: 'Ryzen 9',
            slug: 'ryzen-9',
            price: 499,
            images: null,
          },
        },
      ],
      error: null,
    })
    const upsertBuilder = createQueryBuilder({ data: null, error: null })
    const client = createSupabaseClientMock()

    client.from = vi
      .fn()
      .mockImplementationOnce(() => selectBuilder)
      .mockImplementation(() => upsertBuilder)

    useSupabaseClientMock.mockReturnValue(client)
    useSupabaseUserMock.mockReturnValue(ref({ id: 'user-1' }))

    const store = useCartStore()
    store.addToCart(product)

    await store.syncWithSupabase()

    expect(store.items.map(item => item.productId)).toEqual(['gpu-1', 'cpu-1'])
    expect(client.from).toHaveBeenCalledWith('cart_items')
    expect(upsertBuilder.upsert).toHaveBeenCalled()
  })

  it('clears the local cart and remote rows', async () => {
    const deleteBuilder = createQueryBuilder({ data: null, error: null })
    const client = createSupabaseClientMock({ from: () => deleteBuilder })

    useSupabaseClientMock.mockReturnValue(client)
    useSupabaseUserMock.mockReturnValue(ref({ id: 'user-2' }))

    const store = useCartStore()
    store.addToCart(product, 2)

    await store.clearCart()

    expect(store.items).toEqual([])
    expect(deleteBuilder.delete).toHaveBeenCalled()
  })
})
