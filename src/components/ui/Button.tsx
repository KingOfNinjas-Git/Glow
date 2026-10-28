import { motion, type HTMLMotionProps } from 'framer-motion'

type Variant = 'primary' | 'soft' | 'ghost' | 'danger'

const styles: Record<Variant, string> = {
  primary: 'bg-accent-grad text-on-accent shadow-soft font-bold',
  soft: 'bg-accent-soft text-accent-strong font-semibold',
  ghost: 'bg-transparent text-ink-soft font-semibold hover:bg-surface2',
  danger: 'bg-surface2 text-[#b3261e] dark:text-[#ffb4ab] font-semibold',
}

interface Props extends HTMLMotionProps<'button'> {
  variant?: Variant
  size?: 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`inline-flex items-center justify-center gap-2 rounded-full ${
        size === 'lg' ? 'px-7 py-3.5 text-lg' : 'px-5 py-2.5 text-base'
      } disabled:opacity-50 disabled:pointer-events-none ${styles[variant]} ${className}`}
      {...rest}
    />
  )
}
