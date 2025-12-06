import { Separator } from '@/components/ui/separator'

interface DataSourceFooterProps {
  totalFields?: number
  scraperCount?: number
}

export function DataSourceFooter({
  totalFields = 146,
  scraperCount = 8
}: DataSourceFooterProps) {
  return (
    <footer className="mt-8 pt-6 border-t">
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>
          <strong>{totalFields}</strong> data fields from{' '}
          <strong>{scraperCount}</strong> data sources
        </p>
        <Separator className="my-4 max-w-xs mx-auto" />
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <span>ESPN API</span>
          <span>•</span>
          <span>nflverse</span>
          <span>•</span>
          <span>NFL Next Gen Stats</span>
        </div>
        <p className="text-xs mt-4">
          NFL Stats Platform © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
