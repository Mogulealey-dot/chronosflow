'use client'

import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ProjectEfficiency } from '@/lib/hooks/useProjectAnalytics'

interface PDFReportProps {
  data: ProjectEfficiency[]
  userName: string
}

// Lazy-loaded to avoid SSR issues with react-pdf
export function PDFReport({ data, userName }: PDFReportProps) {
  const [ready, setReady] = useState(false)
  const [PDFLink, setPDFLink] = useState<React.ComponentType<any> | null>(null)
  const [ReportDoc, setReportDoc] = useState<React.ComponentType<any> | null>(null)

  useEffect(() => {
    import('@react-pdf/renderer').then((pdf) => {
      const { Document, Page, Text, View, StyleSheet, PDFDownloadLink } = pdf

      const styles = StyleSheet.create({
        page: { padding: 36, backgroundColor: '#ffffff', fontFamily: 'Helvetica', fontSize: 10 },
        header: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#18181b', marginBottom: 4 },
        sub: { fontSize: 10, color: '#71717a', marginBottom: 24 },
        sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#71717a', marginBottom: 8, textTransform: 'uppercase' },
        row: { flexDirection: 'row', padding: '8 0', borderBottomWidth: 1, borderBottomColor: '#e4e4e7' },
        headerRow: { flexDirection: 'row', paddingVertical: 6, backgroundColor: '#f4f4f5', paddingHorizontal: 4, marginBottom: 2 },
        col1: { flex: 2 }, col: { flex: 1, textAlign: 'right' },
        bold: { fontFamily: 'Helvetica-Bold' },
        red: { color: '#ef4444' }, amber: { color: '#f59e0b' }, green: { color: '#22c55e' }, muted: { color: '#71717a' },
        footer: { position: 'absolute', bottom: 24, left: 36, right: 36, color: '#a1a1aa', fontSize: 9, textAlign: 'center' },
        summaryBox: { flex: 1, backgroundColor: '#f4f4f5', padding: 12, borderRadius: 4, marginRight: 8 },
      })

      function Doc({ projects, user }: { projects: ProjectEfficiency[]; user: string }) {
        const totalActual = projects.reduce((a, p) => a + p.actual_hours, 0)
        const totalEst = projects.reduce((a, p) => a + p.estimated_hours, 0)
        return (
          <Document>
            <Page size="A4" style={styles.page}>
              <Text style={styles.header}>ChronosFlow Report</Text>
              <Text style={styles.sub}>{user} · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>

              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                {[['Total Actual', `${totalActual.toFixed(1)}h`], ['Total Estimated', `${totalEst.toFixed(1)}h`], ['Projects', String(projects.length)]].map(([l, v]) => (
                  <View key={l} style={styles.summaryBox}>
                    <Text style={{ fontSize: 9, color: '#71717a', marginBottom: 4 }}>{l}</Text>
                    <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold' }}>{v}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Project Breakdown</Text>
              <View style={styles.headerRow}>
                <Text style={[styles.col1, styles.bold, { color: '#52525b', fontSize: 9 }]}>Project</Text>
                {['Estimated', 'Actual', 'Efficiency', 'Status'].map(h => (
                  <Text key={h} style={[styles.col, styles.bold, { color: '#52525b', fontSize: 9 }]}>{h}</Text>
                ))}
              </View>
              {projects.map((p) => {
                const c = p.status === 'Over Budget' ? styles.red : p.status === 'Warning' ? styles.amber : p.status === 'Healthy' ? styles.green : styles.muted
                return (
                  <View key={p.project_id} style={styles.row}>
                    <Text style={styles.col1}>{p.project_name}</Text>
                    <Text style={styles.col}>{p.estimated_hours.toFixed(1)}h</Text>
                    <Text style={styles.col}>{p.actual_hours.toFixed(1)}h</Text>
                    <Text style={[styles.col, c]}>{p.efficiency_ratio.toFixed(0)}%</Text>
                    <Text style={[styles.col, c]}>{p.status}</Text>
                  </View>
                )
              })}

              <Text style={styles.footer}>ChronosFlow · Confidential</Text>
            </Page>
          </Document>
        )
      }

      setReportDoc(() => Doc)
      setPDFLink(() => PDFDownloadLink)
      setReady(true)
    })
  }, [])

  if (!ready || !PDFLink || !ReportDoc) {
    return (
      <Button variant="outline" size="sm" disabled className="gap-1.5 h-8 border-zinc-700 bg-zinc-900 text-zinc-500">
        <Download className="w-3.5 h-3.5" />
        PDF Report
      </Button>
    )
  }

  return (
    <PDFLink
      document={<ReportDoc projects={data} user={userName} />}
      fileName={`chronosflow-${new Date().toISOString().split('T')[0]}.pdf`}
    >
      {({ loading: pdfLoading }: { loading: boolean }) => (
        <Button
          variant="outline"
          size="sm"
          disabled={pdfLoading}
          className="gap-1.5 h-8 border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white"
        >
          <Download className="w-3.5 h-3.5" />
          {pdfLoading ? 'Generating…' : 'PDF Report'}
        </Button>
      )}
    </PDFLink>
  )
}
