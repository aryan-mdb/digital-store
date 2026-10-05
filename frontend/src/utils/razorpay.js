import { razorpayService } from '../services/orderService'

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'
let scriptPromise = null

function loadCheckoutScript() {
  if (window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Could not load Razorpay. Check your internet connection and try again.'))
    }
    document.body.appendChild(script)
  })
  return scriptPromise
}

/**
 * Opens Razorpay Checkout for one of our orders and resolves once the
 * backend has verified the payment signature.
 *
 * Resolves to { status: 'paid', order } on success or { status: 'dismissed' }
 * if the buyer closed the popup. Rejects on gateway / verification errors.
 */
export async function payWithRazorpay(orderId) {
  await loadCheckoutScript()
  const { data: checkout } = await razorpayService.create(orderId)

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: checkout.key_id,
      order_id: checkout.razorpay_order_id,
      amount: checkout.amount,
      currency: checkout.currency,
      name: checkout.name,
      description: checkout.description,
      prefill: checkout.prefill,
      theme: { color: '#1d5132' },
      handler: async (response) => {
        try {
          const { data: order } = await razorpayService.verify(orderId, response)
          resolve({ status: 'paid', order })
        } catch (error) {
          reject(error)
        }
      },
      modal: {
        ondismiss: () => resolve({ status: 'dismissed' }),
      },
    })

    rzp.on('payment.failed', (response) => {
      reject(new Error(response?.error?.description || 'Payment failed. Please try again.'))
    })

    rzp.open()
  })
}
