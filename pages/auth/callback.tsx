import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Auth error:', error)
        router.push('/')
        return
      }

      if (data.session) {
        const next = router.query.next as string || '/pod'
        router.push(next)
      } else {
        router.push('/')
      }
    }

    if (router.isReady) {
      handleAuthCallback()
    }
  }, [router, router.isReady])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Authenticating...</div>
    </div>
  )
}