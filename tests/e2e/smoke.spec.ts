import { expect, test, type Page } from '@playwright/test'

const hasSeededAuth =
  Boolean(process.env.SUPABASE_URL) &&
  !process.env.SUPABASE_URL?.includes('your-test-project.supabase.co') &&
  !process.env.SUPABASE_URL?.includes('test-project.supabase.co') &&
  Boolean(process.env.TEST_CUSTOMER_EMAIL) &&
  !process.env.TEST_CUSTOMER_EMAIL?.endsWith('@example.com') &&
  Boolean(process.env.TEST_ADMIN_EMAIL) &&
  !process.env.TEST_ADMIN_EMAIL?.endsWith('@example.com')

const mockProduct = {
  id: 'mock-product-1',
  name: 'RTX 4090 Founders Edition',
  slug: 'rtx-4090-founders-edition',
  description: 'A flagship GPU for 4K gaming and workstation builds.',
  price: 1999.99,
  compare_at_price: 2199.99,
  stock_quantity: 7,
  images: ['/placeholder.png'],
  is_active: true,
  created_at: '2026-01-01T12:00:00.000Z',
  category_id: 'graphics-cards',
  categories: {
    name: 'Graphics Cards',
    slug: 'graphics-cards',
  },
}

const mockCatalogRoutes = async (page: Page) => {
  await page.route('**/rest/v1/products**', async route => {
    const requestUrl = route.request().url()
    const isProductDetailRequest = requestUrl.includes(`slug=eq.${mockProduct.slug}`)

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(isProductDetailRequest ? mockProduct : [mockProduct]),
    })
  })

  await page.route('**/api/products/metrics**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        metrics: {
          [mockProduct.id]: {
            averageRating: 4.9,
            reviewCount: 42,
            soldQuantity: 128,
          },
        },
      }),
    })
  })

  await page.route('**/rest/v1/rpc/get_product_review_stats**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        average_rating: 4.9,
        total_reviews: 42,
        rating_5: 36,
        rating_4: 4,
        rating_3: 1,
        rating_2: 1,
        rating_1: 0,
      }),
    })
  })

  await page.route('**/rest/v1/reviews**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.route('**/rest/v1/review_helpful_votes**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.route('**/rest/v1/rpc/has_purchased_product**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(false),
    })
  })
}

const loginAs = async (page: Page, role: 'customer' | 'admin') => {
  const email =
    role === 'admin'
      ? process.env.TEST_ADMIN_EMAIL
      : process.env.TEST_CUSTOMER_EMAIL
  const password =
    role === 'admin'
      ? process.env.TEST_ADMIN_PASSWORD
      : process.env.TEST_CUSTOMER_PASSWORD

  if (!email || !password) {
    throw new Error(`Missing ${role} test credentials`)
  }

  await page.goto('/auth/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: /Sign In/i }).click()
}

test.describe('Recruiter-facing smoke flows', () => {
  test('home page links into the product catalog', async ({ page }) => {
    await page.goto('/')

    await expect(
      page.getByRole('heading', {
        name: /Build Your Dream PC/i,
      }),
    ).toBeVisible()

    // Wait for hydration so the click drives client-side navigation (not a lost pre-hydration click)
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: /Shop Now/i }).click()

    // Tolerate an optional trailing slash (the app resolves to /products/)
    await expect(page).toHaveURL(/\/products\/?$/)
    await expect(page.getByRole('heading', { name: /All Products/i })).toBeVisible()
  })

  test('public shoppers can search products, open details, and add an item to the cart', async ({
    page,
  }) => {
    await mockCatalogRoutes(page)
    await page.goto('/products')

    const searchInput = page.getByPlaceholder('Filter products...')
    const firstProductLink = page.locator('a[aria-label^="View "]').first()

    await expect(firstProductLink).toBeVisible()

    const firstProductLabel = await firstProductLink.getAttribute('aria-label')
    const productName = firstProductLabel?.replace(/^View\s+/, '').trim()

    expect(productName).toBeTruthy()

    await searchInput.fill(productName!)
    await expect(searchInput).toHaveValue(productName!)

    const sortTrigger = page.getByRole('combobox').first()
    await sortTrigger.click()
    await page.getByText('Price: Low to High').click()
    await expect(page).toHaveURL(/sort=price-asc/)

    await firstProductLink.click()

    await expect(page).toHaveURL(/\/products\/.+/)
    await expect(page.getByRole('heading', { name: productName! })).toBeVisible()

    await page.getByText('Add to Cart').click()
    await page.goto('/cart')

    await expect(page.getByText(productName!)).toBeVisible()
  })

  test('fresh sessions show an empty cart state', async ({ page }) => {
    await page.goto('/cart')

    await expect(page.getByRole('heading', { name: /Shopping Cart/i })).toBeVisible()
    await expect(page.getByText(/Your cart is empty/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /Start Shopping/i })).toBeVisible()
  })

  test('guest users are redirected to login from protected customer routes', async ({ page }) => {
    await page.goto('/account')

    await expect(page).toHaveURL(/\/auth\/login$/)
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()

    await page.goto('/checkout')

    await expect(page).toHaveURL(/\/auth\/login$/)
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
  })

  test('newsletter signup shows a success state', async ({ page }) => {
    await page.route('**/api/newsletter/subscribe', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Successfully subscribed!',
        }),
      })
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('Enter your email').fill('qa-success@example.com')
    await page.getByPlaceholder('Enter your email').scrollIntoViewIfNeeded()

    await Promise.all([
      page.waitForRequest(request =>
        request.url().includes('/api/newsletter/subscribe') &&
        request.method() === 'POST',
      ),
      page.getByRole('button', { name: /^Subscribe$/i }).click(),
    ])

    await expect(page.getByRole('button', { name: /Subscribed!/i })).toBeVisible()
  })

  test('newsletter signup surfaces duplicate-email errors', async ({ page }) => {
    await page.route('**/api/newsletter/subscribe', async route => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 409,
          statusMessage: 'This email is already subscribed.',
        }),
      })
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByPlaceholder('Enter your email').fill('qa-duplicate@example.com')
    await page.getByPlaceholder('Enter your email').scrollIntoViewIfNeeded()

    await Promise.all([
      page.waitForRequest(request =>
        request.url().includes('/api/newsletter/subscribe') &&
        request.method() === 'POST',
      ),
      page.getByRole('button', { name: /^Subscribe$/i }).click(),
    ])

    await expect(page.getByText('This email is already subscribed.')).toBeVisible()
    await expect(page.getByRole('button', { name: /^Subscribe$/i })).toBeVisible()
  })

  test('guest users cannot access the admin dashboard', async ({ page }) => {
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/auth\/login$/)
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
  })
})

test.describe('Authenticated recruiter flows', () => {
  test.skip(!hasSeededAuth, 'Seeded Supabase test users are required for authenticated E2E flows.')

  test('authenticated customers can complete the mocked checkout redirect', async ({ page }) => {
    await loginAs(page, 'customer')
    await page.goto('/products')

    const firstProductLink = page.locator('a[aria-label^="View "]').first()
    const firstProductLabel = await firstProductLink.getAttribute('aria-label')
    const productName = firstProductLabel?.replace(/^View\s+/, '').trim()

    expect(productName).toBeTruthy()

    await firstProductLink.click()
    await page.getByText('Add to Cart').click()

    await page.route('**/api/stripe/create-checkout-session', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          url: 'http://127.0.0.1:3000/checkout/success?session_id=mock-session',
        }),
      })
    })

    await page.route('**/api/stripe/verify-session**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          status: 'paid',
          orderNumber: 'ORD-E2E-001',
          total: 199.99,
        }),
      })
    })

    await page.goto('/checkout')
    await page.getByLabel('Email Address').fill(process.env.TEST_CUSTOMER_EMAIL!)
    await page.getByLabel('Phone Number').fill('+30 210 555 1212')
    await page.getByLabel('Full Name').fill('Test Customer')
    await page.getByLabel('Street Address').fill('123 Test Street')
    await page.getByLabel('City').fill('Athens')
    await page.getByLabel('Postal Code').fill('10557')
    await page.getByRole('button', { name: /Pay Now/i }).click()

    await expect(page).toHaveURL(/\/checkout\/success\?session_id=mock-session/)
    await expect(page.getByRole('heading', { name: /Payment Successful!/i })).toBeVisible()
  })

  test('authenticated customers can submit and edit a review', async ({ page }) => {
    await loginAs(page, 'customer')
    await page.goto('/products')

    await page.locator('a[aria-label^="View "]').first().click()
    await page.getByRole('button', { name: /Write a Review/i }).click()
    await page.locator('form button[type="button"]').nth(4).click()
    await page.getByLabel(/Review Title/i).fill('Great upgrade')
    await page.getByLabel(/Your Review/i).fill('This test review confirms the seeded E2E flow works well.')
    await page.getByRole('button', { name: /Submit Review/i }).click()

    await expect(page.getByRole('button', { name: /Edit Your Review/i })).toBeVisible()

    await page.getByRole('button', { name: /Edit Your Review/i }).click()
    await page.getByLabel(/Review Title/i).fill('Updated review title')
    await page.getByLabel(/Your Review/i).fill('This updated E2E review verifies the edit path as well.')
    await page.getByRole('button', { name: /Update Review/i }).click()

    await expect(page.getByText('Updated review title')).toBeVisible()
  })

  test('admin users can reach the admin dashboard', async ({ page }) => {
    await loginAs(page, 'admin')
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible()
  })
})
