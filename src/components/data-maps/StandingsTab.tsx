'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  STANDINGS_SECTIONS,
  SOURCE_COLORS,
  SCHEDULE_COLORS,
  getScheduleType,
} from './data-maps-config'

function getTotalFields(): number {
  return STANDINGS_SECTIONS.reduce((sum, section) => sum + section.fields.length, 0)
}

export function StandingsTab() {
  const totalFields = getTotalFields()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Standings Page Fields</CardTitle>
            <Badge variant="outline">{totalFields} fields</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Query: <code className="bg-muted px-1 rounded">standings-queries.ts</code> → <code className="bg-muted px-1 rounded">getStandings()</code>
          </p>
        </CardHeader>
      </Card>

      {STANDINGS_SECTIONS.map((section) => (
        <Card key={section.title}>
          <CardHeader className="py-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <Badge variant="secondary">{section.fields.length}</Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={SCHEDULE_COLORS[getScheduleType(section.schedule)]}>
                    {section.schedule}
                  </Badge>
                  <Badge variant="outline" className={SOURCE_COLORS[section.source]}>
                    {section.source}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                <span>Table: <code className="bg-muted px-1 rounded">{section.table}</code></span>
                <span>|</span>
                <span>PK: <code className="bg-muted px-1 rounded">{section.primaryKey}</code></span>
                {section.recordCount && (
                  <>
                    <span>|</span>
                    <span>{section.recordCount}</span>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead className="w-20">Type</TableHead>
                    <TableHead className="w-16">Key</TableHead>
                    <TableHead>Example</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.fields.map((field, index) => (
                    <TableRow key={field.field}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{field.field}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {field.key && (
                          <Badge
                            variant={field.key === 'PK' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {field.key}
                          </Badge>
                        )}
                        {field.fkRef && (
                          <span className="text-xs text-muted-foreground ml-1">
                            → {field.fkRef}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {field.example || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {field.description || '-'}
                        {!field.nullable && (
                          <Badge variant="outline" className="ml-2 text-xs">required</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
