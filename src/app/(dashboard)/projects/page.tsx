'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Archive, DollarSign, Clock, ChevronRight } from 'lucide-react'
import { useProjects } from '@/lib/hooks/useProjects'
import { formatHours, randomColor, PROJECT_COLORS } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { Project } from '@/types'

interface ProjectFormData {
  name: string
  color: string
  hourly_rate: string
  is_billable: boolean
  budget_hours: string
}

const defaultForm: ProjectFormData = {
  name: '',
  color: randomColor(),
  hourly_rate: '',
  is_billable: false,
  budget_hours: '',
}

export default function ProjectsPage() {
  const { projects, loading, createProject, updateProject, deleteProject } = useProjects()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectFormData>(defaultForm)

  function openCreate() {
    setEditingId(null)
    setForm({ ...defaultForm, color: randomColor() })
    setOpen(true)
  }

  function openEdit(project: Project) {
    setEditingId(project.id)
    setForm({
      name: project.name,
      color: project.color,
      hourly_rate: project.hourly_rate?.toString() ?? '',
      is_billable: project.is_billable,
      budget_hours: project.budget_hours?.toString() ?? '',
    })
    setOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Project name is required')
      return
    }
    const hourlyRate = form.hourly_rate ? parseFloat(form.hourly_rate) : null
    const budgetHours = form.budget_hours ? parseFloat(form.budget_hours) : null

    if (editingId) {
      await updateProject(editingId, {
        name: form.name,
        color: form.color,
        hourly_rate: hourlyRate,
        is_billable: form.is_billable,
        budget_hours: budgetHours,
      })
      toast.success('Project updated')
    } else {
      await createProject(form.name, form.color, null, hourlyRate, form.is_billable, budgetHours)
      toast.success('Project created')
    }
    setOpen(false)
  }

  async function handleArchive(id: string) {
    await deleteProject(id)
    toast.success('Project archived')
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{projects.length} active projects</p>
        </div>
        <Button onClick={openCreate} size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white gap-1.5">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading...</div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 rounded-xl border border-dashed border-zinc-700"
        >
          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-zinc-500" />
          </div>
          <p className="text-zinc-400 font-medium">No projects yet</p>
          <p className="text-zinc-500 text-sm mt-1">Create a project to start tracking time</p>
          <Button onClick={openCreate} className="mt-4 bg-indigo-500 hover:bg-indigo-600 gap-1.5 text-white">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {projects.map((project) => {
              const usedHours = project.total_hours ?? 0
              const budgetPct = project.budget_hours
                ? Math.min((usedHours / project.budget_hours) * 100, 100)
                : null

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors"
                >
                  {/* Color dot */}
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: project.color }}
                  />

                  {/* Name & client */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-100">{project.name}</span>
                      {project.is_billable && (
                        <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-1.5 py-0.5 flex items-center gap-0.5">
                          <DollarSign className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    {project.client && (
                      <p className="text-xs text-zinc-500 mt-0.5">{project.client.name}</p>
                    )}
                  </div>

                  {/* Budget burn */}
                  {budgetPct !== null && (
                    <div className="w-28">
                      <div className="flex justify-between text-xs text-zinc-500 mb-1">
                        <span>Budget</span>
                        <span>{budgetPct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            budgetPct >= 90 ? 'bg-red-500' : budgetPct >= 70 ? 'bg-amber-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${budgetPct}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Rate */}
                  {project.hourly_rate && (
                    <span className="text-sm text-zinc-400 tabular-nums">
                      ${project.hourly_rate}/hr
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEdit(project)}
                      className="w-8 h-8 text-zinc-500 hover:text-zinc-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleArchive(project.id)}
                      className="w-8 h-8 text-zinc-500 hover:text-amber-400"
                      title="Archive project"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <ChevronRight className="w-4 h-4 text-zinc-700 shrink-0" />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingId ? 'Edit Project' : 'New Project'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Project name"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 focus-visible:border-indigo-500/60"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Color</Label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      form.color === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Hourly Rate ($)</Label>
                <Input
                  type="number"
                  value={form.hourly_rate}
                  onChange={(e) => setForm({ ...form, hourly_rate: e.target.value })}
                  placeholder="0.00"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 focus-visible:border-indigo-500/60"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Budget (hours)</Label>
                <Input
                  type="number"
                  value={form.budget_hours}
                  onChange={(e) => setForm({ ...form, budget_hours: e.target.value })}
                  placeholder="e.g. 40"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 focus-visible:border-indigo-500/60"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="billable"
                checked={form.is_billable}
                onChange={(e) => setForm({ ...form, is_billable: e.target.checked })}
                className="accent-indigo-500 w-4 h-4"
              />
              <label htmlFor="billable" className="text-sm text-zinc-300 cursor-pointer">
                Billable by default
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-200">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600 text-white">
              {editingId ? 'Update' : 'Create Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
