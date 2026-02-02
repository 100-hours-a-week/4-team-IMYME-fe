import { Field, FieldLabel } from '@/shared/ui/field'
import { Progress } from '@/shared/ui/progress'

type ProgressFieldProps = {
  value: number
  stepLabel: string
}

export function ProgressField({ value, stepLabel }: ProgressFieldProps) {
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="progress-levelup">
        <span className="ml-auto">{stepLabel}</span>
      </FieldLabel>
      <Progress
        value={value}
        id="progress-levelup"
        className="self-center"
      />
    </Field>
  )
}
