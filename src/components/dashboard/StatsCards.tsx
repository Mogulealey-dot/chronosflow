'use client'

import { motion } from 'framer-motion'
import { Clock, TrendingUp, Target, Calendar } from 'lucide-react'
import { formatHours } from '@/lib/utils/format'

interface StatsCardsProps {
  todaySeconds: number
  weekSeconds: number
  monthSeconds: number
  efficiencyRatio: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

export function StatsCards({ todaySeconds, weekSeconds, monthSeconds, efficiencyRatio }: StatsCardsProps) {
  const cards = [
    {
      label: 'Today',
      value: formatHours(todaySeconds),
      icon: Clock,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      label: 'This Week',
      value: formatHours(weekSeconds),
      icon: Calendar,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
    },
    {
      label: 'This Month',
      value: formatHours(monthSeconds),
      icon: TrendingUp,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      label: 'Efficiency',
      value: `${efficiencyRatio}%`,
      icon: Target,
      color: efficiencyRatio >= 90 ? 'text-emerald-400' : efficiencyRatio >= 70 ? 'text-amber-400' : 'text-red-400',
      bg: efficiencyRatio >= 90 ? 'bg-emerald-500/10' : efficiencyRatio >= 70 ? 'bg-amber-500/10' : 'bg-red-500/10',
      border: efficiencyRatio >= 90 ? 'border-emerald-500/20' : efficiencyRatio >= 70 ? 'border-amber-500/20' : 'border-red-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          custom={i}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className={`rounded-xl border ${card.border} bg-zinc-900/60 p-4 backdrop-blur-sm`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-white mt-1.5 tabular-nums">{card.value}</p>
            </div>
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
