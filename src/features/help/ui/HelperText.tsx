type HelperTextProps = {
  message: string
  variant?: 'default' | 'error'
}

const HELPER_TEXT_VARIANT_CLASS = {
  default: 'text-black',
  error: 'text-red-600',
}

export function HelperText({ message, variant = 'default' }: HelperTextProps) {
  return <p className={`self-start text-xs ${HELPER_TEXT_VARIANT_CLASS[variant]}`}>{message}</p>
}
