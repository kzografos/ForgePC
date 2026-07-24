vi.mock('~/server/utils/emailService', () => ({
  sendWelcomeEmail: vi.fn(),
}))

import { readBody } from '#imports'
import { serverSupabaseServiceRole } from '#supabase/server'
import { sendWelcomeEmail } from '~/server/utils/emailService'
import subscribeHandler from '~/server/api/newsletter/subscribe.post'
import { createQueryBuilder } from '../../../fixtures/supabase'

describe('server/api/newsletter/subscribe.post', () => {
  const readBodyMock = vi.mocked(readBody)
  const serverSupabaseServiceRoleMock = vi.mocked(serverSupabaseServiceRole)
  const sendWelcomeEmailMock = vi.mocked(sendWelcomeEmail)

  beforeEach(() => {
    sendWelcomeEmailMock.mockResolvedValue({ success: true })
  })

  it('creates a new subscription and sends a welcome email', async () => {
    const existingSubscriptionQuery = createQueryBuilder({ data: null, error: null })
    const insertSubscriptionQuery = createQueryBuilder({ error: null })

    serverSupabaseServiceRoleMock.mockResolvedValue({
      from: vi
        .fn()
        .mockReturnValueOnce(existingSubscriptionQuery)
        .mockReturnValueOnce(insertSubscriptionQuery),
    } as never)
    readBodyMock.mockResolvedValue({ email: ' NewUser@Example.com ' } as never)

    const result = await subscribeHandler({} as never)

    expect(existingSubscriptionQuery.eq).toHaveBeenCalledWith('email', 'newuser@example.com')
    expect(insertSubscriptionQuery.insert).toHaveBeenCalledWith({
      email: 'newuser@example.com',
    })
    expect(sendWelcomeEmailMock).toHaveBeenCalledWith('newuser@example.com')
    expect(result).toEqual({
      success: true,
      message: "Thanks — you're on the list.",
    })
  })

  it('reactivates an inactive subscription instead of inserting a duplicate row', async () => {
    const existingSubscriptionQuery = createQueryBuilder({
      data: { id: 'sub-1', is_active: false },
      error: null,
    })
    const reactivateQuery = createQueryBuilder({ error: null })

    serverSupabaseServiceRoleMock.mockResolvedValue({
      from: vi
        .fn()
        .mockReturnValueOnce(existingSubscriptionQuery)
        .mockReturnValueOnce(reactivateQuery),
    } as never)
    readBodyMock.mockResolvedValue({ email: 'returning@example.com' } as never)

    const result = await subscribeHandler({} as never)

    expect(reactivateQuery.update).toHaveBeenCalledWith({ is_active: true })
    expect(reactivateQuery.eq).toHaveBeenCalledWith('id', 'sub-1')
    expect(sendWelcomeEmailMock).toHaveBeenCalledWith('returning@example.com')
    expect(result).toEqual({
      success: true,
      message: 'Welcome back! Your subscription has been reactivated.',
    })
  })

  it('rejects already-active subscriptions with a conflict error', async () => {
    serverSupabaseServiceRoleMock.mockResolvedValue({
      from: vi.fn(() =>
        createQueryBuilder({
          data: { id: 'sub-1', is_active: true },
          error: null,
        }),
      ),
    } as never)
    readBodyMock.mockResolvedValue({ email: 'duplicate@example.com' } as never)

    await expect(subscribeHandler({} as never)).rejects.toMatchObject({
      statusCode: 409,
      statusMessage: 'This email is already subscribed to our newsletter',
    })
  })

  it('requires an email address and rejects malformed emails', async () => {
    readBodyMock.mockResolvedValue({ email: '   ' } as never)

    await expect(subscribeHandler({} as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Email is required',
    })

    readBodyMock.mockResolvedValue({ email: 'not-an-email' } as never)

    await expect(subscribeHandler({} as never)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: 'Please enter a valid email address',
    })
  })

  it('keeps the subscription active even when the welcome email fails', async () => {
    const existingSubscriptionQuery = createQueryBuilder({ data: null, error: null })
    const insertSubscriptionQuery = createQueryBuilder({ error: null })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    serverSupabaseServiceRoleMock.mockResolvedValue({
      from: vi
        .fn()
        .mockReturnValueOnce(existingSubscriptionQuery)
        .mockReturnValueOnce(insertSubscriptionQuery),
    } as never)
    sendWelcomeEmailMock.mockResolvedValue({
      success: false,
      error: 'smtp failed',
    })
    readBodyMock.mockResolvedValue({ email: 'resilient@example.com' } as never)

    const result = await subscribeHandler({} as never)

    expect(warnSpy).toHaveBeenCalled()
    expect(result).toEqual({
      success: true,
      message: "Thanks — you're on the list.",
    })
  })
})
