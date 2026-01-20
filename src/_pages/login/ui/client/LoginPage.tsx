import { LoginButton } from '@/features/auth/ui/client/LoginButton'

export function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen flex-col items-center justify-center gap-50">
      <h1 className="text-3xl font-semibold text-[rgb(var(--color-primary))]">MINE</h1>
      <LoginButton />
    </div>
  )
}
