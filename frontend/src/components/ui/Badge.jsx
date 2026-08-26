import clsx from 'clsx'

const palettes = {
  slate: 'bg-slate-100 text-slate-700',
  green: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
}

const statusPalette = {
  active: 'green',
  completed: 'green',
  paid: 'green',
  inactive: 'slate',
  pending: 'amber',
  blocked: 'red',
  failed: 'red',
  cancelled: 'red',
  expired: 'red',
  admin: 'blue',
  basic_user: 'slate',
}

export default function Badge({ status, children, color }) {
  const palette = color || statusPalette[status] || 'slate'

  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', palettes[palette])}>
      {children ?? status?.replace('_', ' ')}
    </span>
  )
}
