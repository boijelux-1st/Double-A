import bcrypt from "bcryptjs"

// In-memory database simulation
// In production, this would be replaced with a real database

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  role: "admin" | "user" | "reseller"
  isEmailVerified: boolean
  verificationCode?: string
  verificationExpiry?: Date
  loginOtp?: string
  loginOtpExpiry?: Date
  balance: number
  transactionPin?: string
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  status?: "active" | "suspended" | "pending"
  walletBalance?: number
  totalTransactions?: number
  registrationDate?: string
}

export interface Transaction {
  id: string
  userId: string
  type: "credit" | "debit"
  amount: number
  description: string
  reference: string
  status: "pending" | "completed" | "failed"
  gateway?: string
  createdAt: Date
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  key: string
  isActive: boolean
  lastUsed?: Date
  createdAt: Date
}

export interface PricingRule {
  id: string
  service: string
  network: string
  type: string
  buyingPrice: number
  sellingPrice: number
  commission: number
  isActive: boolean
  createdAt: Date
}

export interface VTUProvider {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  isActive: boolean
  priority: number
  services: string[]
  createdAt: Date
}

export interface PaymentGateway {
  id: string
  name: string
  type: string
  publicKey: string
  secretKey: string
  webhookUrl: string
  isActive: boolean
  priority: number
  testMode?: boolean
  createdAt: Date
}

export interface BankAccount {
  id: string
  bankName: string
  bankCode: string
  accountNumber: string
  accountName: string
  isActive: boolean
  isPrimary: boolean
  createdAt: string
}

export interface EmailRedirection {
  id: string
  name: string
  description: string
  sourceEvent: string
  targetEmail: string
  isActive: boolean
  template: string
  createdAt: string
}

export interface Settings {
  id: string
  category: string
  key: string
  value: any
  updatedAt: Date
}

// Database structure
export const database = {
  users: [] as User[],
  transactions: [] as Transaction[],
  apiKeys: [] as ApiKey[],
  pricingRules: [] as PricingRule[],
  vtuProviders: [] as VTUProvider[],
  paymentGateways: [] as PaymentGateway[],
  bankAccounts: [] as BankAccount[],
  emailRedirections: [] as EmailRedirection[],
  settings: [] as Settings[],
  verificationCodes: [] as any[],
  otpCodes: [] as any[],
  commissionSettings: {
    airtimeCommission: 2.5,
    dataCommission: 3.0,
    resellerDiscount: 5.0,
    minimumProfit: 10,
    autoCalculatePrice: true,
  },
}

// Initialize with default data
async function initializeDatabase() {
  // Create default admin user with specified credentials
  const adminPassword = await bcrypt.hash("1st.Admin", 12)
  const adminUser: User = {
    id: "admin-1",
    firstName: "Admin",
    lastName: "User",
    email: "1st.boijelux@gmail.com",
    phone: "+234-802-356-6143",
    password: adminPassword,
    role: "admin",
    isEmailVerified: true,
    balance: 0,
    status: "active",
    walletBalance: 0,
    totalTransactions: 0,
    registrationDate: new Date().toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // Create default regular user
  const userPassword = await bcrypt.hash("user123", 12)
  const regularUser: User = {
    id: "user-1",
    firstName: "Test",
    lastName: "User",
    email: "user@example.com",
    phone: "+234-813-345-0081",
    password: userPassword,
    role: "user",
    isEmailVerified: true,
    balance: 1000,
    status: "active",
    walletBalance: 5000,
    totalTransactions: 12,
    registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // Create reseller user
  const resellerUser: User = {
    id: "reseller-1",
    firstName: "John",
    lastName: "Reseller",
    email: "reseller@example.com",
    phone: "+234-701-234-5678",
    password: userPassword,
    role: "reseller",
    isEmailVerified: true,
    balance: 25000,
    status: "active",
    walletBalance: 25000,
    totalTransactions: 45,
    registrationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  database.users.push(adminUser, regularUser, resellerUser)

  // Default pricing rules
  const defaultPricingRules: PricingRule[] = [
    {
      id: "rule-1",
      service: "airtime",
      network: "mtn",
      type: "prepaid",
      buyingPrice: 0.98,
      sellingPrice: 0.99,
      commission: 0.01,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: "rule-2",
      service: "data",
      network: "airtel",
      type: "1gb",
      buyingPrice: 280,
      sellingPrice: 300,
      commission: 20,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: "rule-3",
      service: "airtime",
      network: "glo",
      type: "prepaid",
      buyingPrice: 0.97,
      sellingPrice: 0.99,
      commission: 0.02,
      isActive: true,
      createdAt: new Date(),
    },
  ]

  database.pricingRules.push(...defaultPricingRules)

  // Default VTU providers
  const defaultProviders: VTUProvider[] = [
    {
      id: "provider-1",
      name: "Primary VTU API",
      baseUrl: "https://api.primaryvtu.com",
      apiKey: "demo-api-key-1",
      isActive: true,
      priority: 1,
      services: ["airtime", "data", "cable", "electricity"],
      createdAt: new Date(),
    },
    {
      id: "provider-2",
      name: "Backup VTU API",
      baseUrl: "https://api.backupvtu.com",
      apiKey: "demo-api-key-2",
      isActive: false,
      priority: 2,
      services: ["airtime", "data"],
      createdAt: new Date(),
    },
  ]

  database.vtuProviders.push(...defaultProviders)

  // Default payment gateways
  const defaultGateways: PaymentGateway[] = [
    {
      id: "gateway-1",
      name: "Primary Paystack",
      type: "paystack",
      publicKey: "pk_test_demo",
      secretKey: "sk_test_demo",
      webhookUrl: "/api/payments/webhook",
      isActive: true,
      priority: 1,
      testMode: true,
      createdAt: new Date(),
    },
    {
      id: "gateway-2",
      name: "Flutterwave",
      type: "flutterwave",
      publicKey: "FLWPUBK_TEST_demo",
      secretKey: "FLWSECK_TEST_demo",
      webhookUrl: "/api/payments/webhook",
      isActive: false,
      priority: 2,
      testMode: true,
      createdAt: new Date(),
    },
  ]

  database.paymentGateways.push(...defaultGateways)

  // Default bank accounts
  const defaultBankAccounts: BankAccount[] = [
    {
      id: "bank-1",
      bankName: "First Bank of Nigeria",
      bankCode: "011",
      accountNumber: "1234567890",
      accountName: "DOUBLE A DATA CENTER BAUCHI",
      isActive: true,
      isPrimary: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "bank-2",
      bankName: "Access Bank",
      bankCode: "044",
      accountNumber: "0987654321",
      accountName: "DOUBLE A DATA CENTER BAUCHI",
      isActive: true,
      isPrimary: false,
      createdAt: new Date().toISOString(),
    },
  ]

  database.bankAccounts.push(...defaultBankAccounts)

  // Default email redirections
  const defaultEmailRedirections: EmailRedirection[] = [
    {
      id: "email-1",
      name: "New User Registration",
      description: "Forward new user registrations to admin",
      sourceEvent: "user_registration",
      targetEmail: "1st.boijelux@gmail.com",
      isActive: true,
      template: "New user registered: {{user_name}} ({{user_email}})",
      createdAt: new Date().toISOString(),
    },
    {
      id: "email-2",
      name: "Login OTP Notifications",
      description: "Forward login attempts to security team",
      sourceEvent: "login_otp",
      targetEmail: "1st.boijelux@gmail.com",
      isActive: true,
      template: "Login attempt for {{user_email}} with OTP: {{otp_code}}",
      createdAt: new Date().toISOString(),
    },
  ]

  database.emailRedirections.push(...defaultEmailRedirections)

  console.log("✅ Database initialized with default data")
  console.log(`👤 Admin: 1st.boijelux@gmail.com / 1st.Admin`)
  console.log(`👤 User: user@example.com / user123`)
  console.log(`👤 Reseller: reseller@example.com / user123`)
}

// Initialize database on startup
initializeDatabase()

export { initializeDatabase }

// Database helper functions
export const db = {
  // User methods
  async getAllUsers() {
    return database.users.map((user) => ({ ...user, password: undefined }))
  },

  async getUserByEmail(email: string) {
    return database.users.find((user) => user.email === email)
  },

  async getUserById(id: string) {
    return database.users.find((user) => user.id === id)
  },

  async createUser(userData: any) {
    const newUser = {
      id: userData.id || `user-${Date.now()}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    database.users.push(newUser)
    return { ...newUser, password: undefined }
  },

  async updateUser(id: string, updates: any) {
    const userIndex = database.users.findIndex((user) => user.id === id)
    if (userIndex === -1) return null

    database.users[userIndex] = {
      ...database.users[userIndex],
      ...updates,
      updatedAt: new Date(),
    }
    return { ...database.users[userIndex], password: undefined }
  },

  async deleteUser(id: string) {
    const userIndex = database.users.findIndex((user) => user.id === id)
    if (userIndex === -1) return false

    database.users.splice(userIndex, 1)
    return true
  },

  // Payment Gateway methods
  async getPaymentGateways() {
    return database.paymentGateways
  },

  async createPaymentGateway(gatewayData: any) {
    const newGateway = {
      id: `gateway-${Date.now()}`,
      ...gatewayData,
      createdAt: new Date(),
    }
    database.paymentGateways.push(newGateway)
    return newGateway
  },

  async updatePaymentGateway(id: string, updates: any) {
    const gatewayIndex = database.paymentGateways.findIndex((gateway) => gateway.id === id)
    if (gatewayIndex === -1) return null

    database.paymentGateways[gatewayIndex] = {
      ...database.paymentGateways[gatewayIndex],
      ...updates,
    }
    return database.paymentGateways[gatewayIndex]
  },

  async togglePaymentGateway(id: string) {
    const gateway = database.paymentGateways.find((g) => g.id === id)
    if (!gateway) return null

    gateway.isActive = !gateway.isActive
    return gateway
  },

  // Bank Account methods
  async getBankAccounts() {
    return database.bankAccounts
  },

  async createBankAccount(accountData: any) {
    const newAccount = {
      id: `bank-${Date.now()}`,
      ...accountData,
      createdAt: new Date().toISOString(),
    }
    database.bankAccounts.push(newAccount)
    return newAccount
  },

  async updateBankAccount(id: string, updates: any) {
    const accountIndex = database.bankAccounts.findIndex((account) => account.id === id)
    if (accountIndex === -1) return null

    database.bankAccounts[accountIndex] = {
      ...database.bankAccounts[accountIndex],
      ...updates,
    }
    return database.bankAccounts[accountIndex]
  },

  async toggleBankAccount(id: string) {
    const account = database.bankAccounts.find((a) => a.id === id)
    if (!account) return null

    account.isActive = !account.isActive
    return account
  },

  // Email Redirection methods
  async getEmailRedirections() {
    return database.emailRedirections
  },

  async createEmailRedirection(redirectionData: any) {
    const newRedirection = {
      id: `email-${Date.now()}`,
      ...redirectionData,
      createdAt: new Date().toISOString(),
    }
    database.emailRedirections.push(newRedirection)
    return newRedirection
  },

  async updateEmailRedirection(id: string, updates: any) {
    const redirectionIndex = database.emailRedirections.findIndex((redirection) => redirection.id === id)
    if (redirectionIndex === -1) return null

    database.emailRedirections[redirectionIndex] = {
      ...database.emailRedirections[redirectionIndex],
      ...updates,
    }
    return database.emailRedirections[redirectionIndex]
  },

  async toggleEmailRedirection(id: string) {
    const redirection = database.emailRedirections.find((r) => r.id === id)
    if (!redirection) return null

    redirection.isActive = !redirection.isActive
    return redirection
  },

  // Pricing Rules methods
  async getPricingRules() {
    return database.pricingRules
  },

  async createPricingRule(ruleData: any) {
    const newRule = {
      id: `rule-${Date.now()}`,
      ...ruleData,
      createdAt: new Date(),
    }
    database.pricingRules.push(newRule)
    return newRule
  },

  async updatePricingRule(id: string, updates: any) {
    const ruleIndex = database.pricingRules.findIndex((rule) => rule.id === id)
    if (ruleIndex === -1) return null

    database.pricingRules[ruleIndex] = {
      ...database.pricingRules[ruleIndex],
      ...updates,
    }
    return database.pricingRules[ruleIndex]
  },

  async deletePricingRule(id: string) {
    const ruleIndex = database.pricingRules.findIndex((rule) => rule.id === id)
    if (ruleIndex === -1) return false

    database.pricingRules.splice(ruleIndex, 1)
    return true
  },

  async togglePricingRule(id: string) {
    const rule = database.pricingRules.find((r) => r.id === id)
    if (!rule) return null

    rule.isActive = !rule.isActive
    return rule
  },

  // Verification Code methods
  async storeVerificationCode(email: string, code: string, type = "email_verification") {
    // Remove existing codes for this email and type
    database.verificationCodes = database.verificationCodes.filter((vc) => !(vc.email === email && vc.type === type))

    const verificationCode = {
      id: `vc-${Date.now()}`,
      email,
      code,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      createdAt: new Date().toISOString(),
    }

    database.verificationCodes.push(verificationCode)
    return verificationCode
  },

  async getVerificationCode(email: string, code: string, type = "email_verification") {
    return database.verificationCodes.find(
      (vc) => vc.email === email && vc.code === code && vc.type === type && new Date(vc.expiresAt) > new Date(),
    )
  },

  async deleteVerificationCode(email: string, type = "email_verification") {
    database.verificationCodes = database.verificationCodes.filter((vc) => !(vc.email === email && vc.type === type))
  },

  // OTP Code methods
  async storeOTPCode(email: string, code: string) {
    // Remove existing OTP codes for this email
    database.otpCodes = database.otpCodes.filter((otp) => otp.email !== email)

    const otpCode = {
      id: `otp-${Date.now()}`,
      email,
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      createdAt: new Date().toISOString(),
    }

    database.otpCodes.push(otpCode)
    return otpCode
  },

  async getOTPCode(email: string, code: string) {
    return database.otpCodes.find(
      (otp) => otp.email === email && otp.code === code && new Date(otp.expiresAt) > new Date(),
    )
  },

  async deleteOTPCode(email: string) {
    database.otpCodes = database.otpCodes.filter((otp) => otp.email !== email)
  },

  // Commission Settings methods
  async getCommissionSettings() {
    return database.commissionSettings
  },

  async updateCommissionSettings(settings: any) {
    database.commissionSettings = { ...database.commissionSettings, ...settings }
    return database.commissionSettings
  },
}
