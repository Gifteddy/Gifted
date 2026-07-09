export interface ShippingProvider {
  name: string
  createShipment(params: ShipmentParams): Promise<ShipmentResult>
  trackShipment(trackingNumber: string): Promise<TrackingResult>
  estimateCost(params: ShipmentParams): Promise<number>
}

export interface ShipmentParams {
  origin: { city: string; state: string; address: string }
  destination: { city: string; state: string; address: string; zip?: string; phone: string; name: string }
  items: { name: string; quantity: number; weight?: number; value?: number }[]
}

export interface ShipmentResult {
  success: boolean
  trackingNumber?: string
  cost?: number
  estimatedDelivery?: string
  error?: string
}

export interface TrackingResult {
  status: string
  location?: string
  estimatedDelivery?: string
  updates: { date: string; message: string }[]
}

// ---- GIG Logistics Provider ----

class GIGProvider implements ShippingProvider {
  name = 'GIG Logistics'

  private baseUrl = 'https://api.giglogistics.com/v1'

  private async api(endpoint: string, body: unknown): Promise<Response> {
    const apiKey = import.meta.env.VITE_GIG_API_KEY as string || ''
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })
  }

  async createShipment(params: ShipmentParams): Promise<ShipmentResult> {
    try {
      const res = await this.api('/shipments', {
        pickup_address: params.origin.address,
        pickup_city: params.origin.city,
        pickup_state: params.origin.state,
        delivery_address: params.destination.address,
        delivery_city: params.destination.city,
        delivery_state: params.destination.state,
        delivery_zip: params.destination.zip || '',
        recipient_name: params.destination.name,
        recipient_phone: params.destination.phone,
        items: params.items.map(i => ({ name: i.name, quantity: i.quantity, value: i.value || 0 })),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.message || 'GIG API error' }
      return {
        success: true,
        trackingNumber: data.tracking_number,
        cost: data.cost,
        estimatedDelivery: data.estimated_delivery,
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to create shipment' }
    }
  }

  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    try {
      const res = await this.api('/track', { tracking_number: trackingNumber })
      const data = await res.json()
      if (!res.ok) return { status: 'unknown', updates: [] }
      return {
        status: data.status,
        location: data.current_location,
        estimatedDelivery: data.estimated_delivery,
        updates: (data.tracking_events || []).map((e: any) => ({
          date: e.date,
          message: e.description,
        })),
      }
    } catch {
      return { status: 'unknown', updates: [] }
    }
  }

  async estimateCost(params: ShipmentParams): Promise<number> {
    try {
      const res = await this.api('/estimate', {
        pickup_city: params.origin.city,
        delivery_city: params.destination.city,
        delivery_state: params.destination.state,
        items: params.items.map(i => ({ name: i.name, quantity: i.quantity, weight: i.weight || 1 })),
      })
      const data = await res.json()
      return data.cost || 0
    } catch {
      return 0
    }
  }
}

// ---- Factory ----

function getProvider(name?: string): ShippingProvider {
  switch (name) {
    case 'gig':
      return new GIGProvider()
    default:
      return new GIGProvider()
  }
}

export const shipping = {
  getProvider,
  async createShipment(providerName: string | undefined, params: ShipmentParams): Promise<ShipmentResult> {
    return getProvider(providerName).createShipment(params)
  },
  async trackShipment(providerName: string | undefined, trackingNumber: string): Promise<TrackingResult> {
    return getProvider(providerName).trackShipment(trackingNumber)
  },
  async estimateCost(providerName: string | undefined, params: ShipmentParams): Promise<number> {
    return getProvider(providerName).estimateCost(params)
  },
}
