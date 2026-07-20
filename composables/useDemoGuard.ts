import { toast } from 'vue-sonner'

/**
 * Demo-mode guard (BLK-2).
 *
 * When `public.demoMode` is on, destructive admin actions are blocked in the UI
 * so a stranger using the shared demo admin account can't permanently wreck the
 * catalog for the next visitor.
 *
 * SCOPE — this is a UI-level guard only. It stops casual/accidental damage
 * (clicking Delete, running a bulk import). It does NOT stop a technical user
 * who opens devtools and calls Supabase directly with the admin session — the
 * admin RLS policies still permit those writes. Durable protection requires
 * read-only RLS for the demo admin, or a scheduled re-seed. See finding BLK-2.
 */
export const useDemoGuard = () => {
  const config = useRuntimeConfig()
  const isDemo = computed(() => Boolean((config.public as any).demoMode))

  /** Returns true if the action was blocked (caller should return early). */
  const blockedInDemo = (action = 'This action'): boolean => {
    if (!isDemo.value) return false
    toast.warning('Demo mode', {
      description: `${action} is disabled in the demo to keep the catalog intact.`,
    })
    return true
  }

  return { isDemo, blockedInDemo }
}
