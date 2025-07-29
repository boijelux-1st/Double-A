// Real API integration utilities for VTU and Payment services

// VTU API Integrations
export class VTUAPIClient {
  private baseUrl: string
  private apiKey: string
  private headers: Record<string, string>

  constructor(provider: string, apiKey: string) {
    this.apiKey = apiKey
    this.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }

    // Set base URLs for different providers
    switch (provider.toLowerCase()) {
      case "vtu.ng":
        this.baseUrl = "https://vtu.ng/wp-json/api/v1"
        break
      case "easyaccess":
        this.baseUrl = "https://easyaccess.com.ng/api/v1"
        break
      case "clubkonnect":
        this.baseUrl = "https://clubkonnect.com/api/v1"
        break
      default:
        throw new Error(`Unsupported VTU provider: ${provider}`)
    }
  }

  async purchaseAirtime(data: {
    network: string
    phone: string
    amount: number
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/airtime`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          network: data.network,
          phone: data.phone,
          amount: data.amount,
          request_id: `airtime_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: result.code === "101" || result.status === "success",
        transactionId: result.transactionId || result.requestId,
        message: result.message || "Transaction processed",
        balance: result.balance,
      }
    } catch (error) {
      console.error("Airtime purchase error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Purchase failed",
        transactionId: null,
      }
    }
  }

  async purchaseData(data: {
    network: string
    phone: string
    planId: string
    amount: number
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/data`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          network: data.network,
          phone: data.phone,
          plan: data.planId,
          request_id: `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: result.code === "101" || result.status === "success",
        transactionId: result.transactionId || result.requestId,
        message: result.message || "Transaction processed",
        balance: result.balance,
      }
    } catch (error) {
      console.error("Data purchase error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Purchase failed",
        transactionId: null,
      }
    }
  }

  async checkBalance() {
    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        method: "GET",
        headers: this.headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        balance: result.balance || result.data?.balance || 0,
      }
    } catch (error) {
      console.error("Balance check error:", error)
      return {
        success: false,
        balance: 0,
      }
    }
  }
}

// Payment Gateway Integrations
export class PaystackClient {
  private secretKey: string
  private baseUrl = "https://api.paystack.co"

  constructor(secretKey: string) {
    this.secretKey = secretKey
  }

  async initializePayment(data: {
    email: string
    amount: number // in kobo
    reference: string
    callback_url?: string
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: result.status,
        authorization_url: result.data?.authorization_url,
        access_code: result.data?.access_code,
        reference: result.data?.reference,
      }
    } catch (error) {
      console.error("Paystack initialization error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Payment initialization failed",
      }
    }
  }

  async verifyPayment(reference: string) {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: result.status && result.data?.status === "success",
        amount: result.data?.amount,
        currency: result.data?.currency,
        transaction_date: result.data?.transaction_date,
        status: result.data?.status,
      }
    } catch (error) {
      console.error("Paystack verification error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Payment verification failed",
      }
    }
  }
}

export class FlutterwaveClient {
  private secretKey: string
  private baseUrl = "https://api.flutterwave.com/v3"

  constructor(secretKey: string) {
    this.secretKey = secretKey
  }

  async initializePayment(data: {
    tx_ref: string
    amount: number
    currency: string
    customer: {
      email: string
      phonenumber: string
      name: string
    }
    redirect_url?: string
  }) {
    try {
      const response = await fetch(`${this.baseUrl}/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: result.status === "success",
        link: result.data?.link,
        tx_ref: result.data?.tx_ref,
      }
    } catch (error) {
      console.error("Flutterwave initialization error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Payment initialization failed",
      }
    }
  }

  async verifyPayment(transactionId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${transactionId}/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: result.status === "success" && result.data?.status === "successful",
        amount: result.data?.amount,
        currency: result.data?.currency,
        transaction_date: result.data?.created_at,
        status: result.data?.status,
      }
    } catch (error) {
      console.error("Flutterwave verification error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Payment verification failed",
      }
    }
  }
}

export class MonnifyClient {
  private apiKey: string
  private secretKey: string
  private baseUrl = "https://api.monnify.com/api/v1"
  private contractCode: string

  constructor(apiKey: string, secretKey: string, contractCode: string) {
    this.apiKey = apiKey
    this.secretKey = secretKey
    this.contractCode = contractCode
  }

  private async getAccessToken() {
    try {
      const credentials = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString("base64")

      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return result.responseBody?.accessToken
    } catch (error) {
      console.error("Monnify auth error:", error)
      return null
    }
  }

  async initializePayment(data: {
    amount: number
    customerName: string
    customerEmail: string
    paymentReference: string
    paymentDescription: string
    redirectUrl?: string
  }) {
    try {
      const accessToken = await this.getAccessToken()
      if (!accessToken) {
        throw new Error("Failed to get access token")
      }

      const response = await fetch(`${this.baseUrl}/merchant/transactions/init-transaction`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: data.amount,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          paymentReference: data.paymentReference,
          paymentDescription: data.paymentDescription,
          currencyCode: "NGN",
          contractCode: this.contractCode,
          redirectUrl: data.redirectUrl,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: result.requestSuccessful,
        checkoutUrl: result.responseBody?.checkoutUrl,
        paymentReference: result.responseBody?.paymentReference,
      }
    } catch (error) {
      console.error("Monnify initialization error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Payment initialization failed",
      }
    }
  }

  async verifyPayment(paymentReference: string) {
    try {
      const accessToken = await this.getAccessToken()
      if (!accessToken) {
        throw new Error("Failed to get access token")
      }

      const response = await fetch(`${this.baseUrl}/merchant/transactions/query?paymentReference=${paymentReference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: result.requestSuccessful && result.responseBody?.paymentStatus === "PAID",
        amount: result.responseBody?.amountPaid,
        paymentStatus: result.responseBody?.paymentStatus,
        transactionReference: result.responseBody?.transactionReference,
      }
    } catch (error) {
      console.error("Monnify verification error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Payment verification failed",
      }
    }
  }
}

// API Switching Logic
export class APIManager {
  private vtuProviders: Array<{
    name: string
    client: VTUAPIClient
    isActive: boolean
    priority: number
  }> = []

  private paymentGateways: Array<{
    name: string
    client: PaystackClient | FlutterwaveClient | MonnifyClient
    isActive: boolean
  }> = []

  addVTUProvider(name: string, apiKey: string, priority = 1) {
    this.vtuProviders.push({
      name,
      client: new VTUAPIClient(name, apiKey),
      isActive: true,
      priority,
    })

    // Sort by priority
    this.vtuProviders.sort((a, b) => a.priority - b.priority)
  }

  addPaymentGateway(name: string, config: any) {
    let client

    switch (name.toLowerCase()) {
      case "paystack":
        client = new PaystackClient(config.secretKey)
        break
      case "flutterwave":
        client = new FlutterwaveClient(config.secretKey)
        break
      case "monnify":
        client = new MonnifyClient(config.apiKey, config.secretKey, config.contractCode)
        break
      default:
        throw new Error(`Unsupported payment gateway: ${name}`)
    }

    this.paymentGateways.push({
      name,
      client,
      isActive: true,
    })
  }

  async purchaseVTU(type: "airtime" | "data", data: any) {
    const activeProviders = this.vtuProviders.filter((p) => p.isActive)

    for (const provider of activeProviders) {
      try {
        let result
        if (type === "airtime") {
          result = await provider.client.purchaseAirtime(data)
        } else {
          result = await provider.client.purchaseData(data)
        }

        if (result.success) {
          return { ...result, provider: provider.name }
        }
      } catch (error) {
        console.error(`VTU provider ${provider.name} failed:`, error)
        continue
      }
    }

    throw new Error("All VTU providers failed")
  }

  async initializePayment(gateway: string, data: any) {
    const paymentGateway = this.paymentGateways.find(
      (g) => g.name.toLowerCase() === gateway.toLowerCase() && g.isActive,
    )

    if (!paymentGateway) {
      throw new Error(`Payment gateway ${gateway} not found or inactive`)
    }

    if (paymentGateway.client instanceof PaystackClient) {
      return await paymentGateway.client.initializePayment(data)
    } else if (paymentGateway.client instanceof FlutterwaveClient) {
      return await paymentGateway.client.initializePayment(data)
    } else if (paymentGateway.client instanceof MonnifyClient) {
      return await paymentGateway.client.initializePayment(data)
    }

    throw new Error("Unsupported payment gateway client")
  }
}

// Export singleton instance
export const apiManager = new APIManager()

// Initialize with environment variables (in a real app)
if (process.env.VTU_NG_API_KEY) {
  apiManager.addVTUProvider("vtu.ng", process.env.VTU_NG_API_KEY, 1)
}

if (process.env.EASYACCESS_API_KEY) {
  apiManager.addVTUProvider("easyaccess", process.env.EASYACCESS_API_KEY, 2)
}

if (process.env.CLUBKONNECT_API_KEY) {
  apiManager.addVTUProvider("clubkonnect", process.env.CLUBKONNECT_API_KEY, 3)
}

if (process.env.PAYSTACK_SECRET_KEY) {
  apiManager.addPaymentGateway("paystack", {
    secretKey: process.env.PAYSTACK_SECRET_KEY,
  })
}

if (process.env.FLUTTERWAVE_SECRET_KEY) {
  apiManager.addPaymentGateway("flutterwave", {
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
  })
}

if (process.env.MONNIFY_API_KEY && process.env.MONNIFY_SECRET_KEY && process.env.MONNIFY_CONTRACT_CODE) {
  apiManager.addPaymentGateway("monnify", {
    apiKey: process.env.MONNIFY_API_KEY,
    secretKey: process.env.MONNIFY_SECRET_KEY,
    contractCode: process.env.MONNIFY_CONTRACT_CODE,
  })
}
