import { LoginButton } from '@/features/auth'
import BlurText from '@/shared/ui/BlurText'

export function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen flex-col items-center justify-center gap-50">
      <BlurText
        text="MINE"
        className="text-primary text-3xl font-semibold"
        delay={200}
        animateBy="words"
        direction="top"
      />
      <LoginButton />
    </div>
  )
}
