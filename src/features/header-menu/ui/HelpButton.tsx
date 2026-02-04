import { toast } from 'sonner'

import { Button } from '@/shared/ui/button'

export function HelpButton() {
  const handleHelp = () => {
    toast.info('준비 중입니다!')
  }
  return (
    <Button
      variant={'modal_btn_primary'}
      onClick={handleHelp}
    >
      도움말
    </Button>
  )
}
