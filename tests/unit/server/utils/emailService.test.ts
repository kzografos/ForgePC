import { useRuntimeConfig } from '#imports'

const { createTransportMock, sendMailMock, resendSendMock, resendConstructorMock } =
  vi.hoisted(() => ({
    createTransportMock: vi.fn(),
    sendMailMock: vi.fn(),
    resendSendMock: vi.fn(),
    resendConstructorMock: vi.fn(),
  }))

vi.mock('nodemailer', () => ({
  default: {
    createTransport: createTransportMock,
  },
}))
vi.mock('resend', () => ({
  Resend: resendConstructorMock,
}))

describe('server/utils/emailService', () => {
  const useRuntimeConfigMock = vi.mocked(useRuntimeConfig)

  beforeEach(() => {
    vi.resetModules()
    useRuntimeConfigMock.mockReturnValue({
      mailtrapHost: 'sandbox.smtp.mailtrap.io',
      mailtrapPort: '2525',
      mailtrapUser: 'mailtrap-user',
      mailtrapPass: 'mailtrap-pass',
      resendApiKey: 're_test',
    })
    createTransportMock.mockReturnValue({ sendMail: sendMailMock })
    resendConstructorMock.mockImplementation(() => ({
      emails: {
        send: resendSendMock,
      },
    }))
    sendMailMock.mockResolvedValue({})
    resendSendMock.mockResolvedValue({})
  })

  it('uses Mailtrap in development mode', async () => {
    process.env.NODE_ENV = 'development'
    const { sendEmail } = await import('~/server/utils/emailService')

    await expect(
      sendEmail({
        to: 'test@example.com',
        subject: 'Hello',
        html: '<p>Hello</p>',
      }),
    ).resolves.toEqual({ success: true })

    expect(createTransportMock).toHaveBeenCalled()
    expect(sendMailMock).toHaveBeenCalled()
  })

  it('uses Resend in production mode', async () => {
    process.env.NODE_ENV = 'production'
    const { sendEmail } = await import('~/server/utils/emailService')

    await expect(
      sendEmail({
        to: 'prod@example.com',
        subject: 'Production',
        html: '<p>Prod</p>',
      }),
    ).resolves.toEqual({ success: true })

    expect(resendConstructorMock).toHaveBeenCalledWith('re_test')
    expect(resendSendMock).toHaveBeenCalled()
  })

  it('renders the welcome newsletter email', async () => {
    process.env.NODE_ENV = 'development'
    const { sendWelcomeEmail } = await import('~/server/utils/emailService')

    await sendWelcomeEmail('welcome@example.com')

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'welcome@example.com',
        subject: expect.stringContaining('Welcome to ForgePC'),
        html: expect.stringContaining('Browse Products'),
      }),
    )
  })
})
