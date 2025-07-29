// VTU API clients and switching logic

export interface VTUProvider {
  name: string
  baseUrl: string
  apiKey: string
  isActive: boolean
  priority: number
}

export const vtuProviders: VTUProvider[] = [
  {
    name: "VTU.ng",
    baseUrl: "https://vtu.ng/wp-json/api/v1",
    apiKey: process.env.VTU_NG_API_KEY || "",
    isActive: true,
    priority: 1,
  },
  {
    name: "EasyAccess",
    baseUrl: "https://easyaccess.com.ng/api/v1",
    apiKey: process.env.EASYACCESS_API_KEY || "",
    isActive: true,
    priority: 2,
  },
  {
    name: "ClubKonnect",
    baseUrl: "https://clubkonnect.com/api/v1",
    apiKey: process.env.CLUBKONNECT_API_KEY || "",
    isActive: true,
    priority: 3,
  },
]

export async function purchaseVTU(data: any): Promise<any> {
  const activeProviders = vtuProviders.filter((provider) => provider.isActive).sort((a, b) => a.priority - b.priority)

  for (const provider of activeProviders) {
    try {
      const result = await callVTUProvider(provider, data)
      if (result.success) {
        return result
      }
    } catch (error) {
      console.error(`VTU provider ${provider.name} failed:`, error)
      continue
    }
  }

  throw new Error("All VTU providers failed")
}

async function callVTUProvider(provider: VTUProvider, data: any) {
  const endpoint = data.serviceType === "airtime" ? "/airtime" : "/data"

  const response = await fetch(`${provider.baseUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      network: data.network,
      phone: data.phoneNumber,
      amount: data.amount,
      plan: data.dataBundle,
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return await response.json()
}

export function switchVTUProvider(providerName: string, isActive: boolean) {
  const provider = vtuProviders.find((p) => p.name === providerName)
  if (provider) {
    provider.isActive = isActive
  }
}
