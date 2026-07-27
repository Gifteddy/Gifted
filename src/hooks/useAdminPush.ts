import { useEffect } from 'react'
import { useAdminStore } from '@/store/admin'
import { subscribeToPush, isPushSubscribed, isPushSupported, requestPushPermission } from '@/lib/push'

export default function useAdminPush() {
  const user = useAdminStore((s) => s.user)

  useEffect(() => {
    if (!user) return

    async function maybeSubscribe() {
      const supported = await isPushSupported()
      if (!supported) return

      const alreadySubscribed = await isPushSubscribed()
      if (alreadySubscribed) return

      const permission = await requestPushPermission()
      if (permission === 'granted') {
        await subscribeToPush('admin')
      }
    }

    maybeSubscribe()
  }, [user])
}
