import { Separator } from '@/components/ui/separator'

export function DataSourceFooter() {
  return (
    <footer className="mt-8 pt-6 border-t">
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>
          <strong>200+</strong> data fields from{' '}
          <strong>12</strong> scrapers across{' '}
          <strong>4</strong> data sources
        </p>
        <Separator className="my-4 max-w-xs mx-auto" />
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <span>ESPN API</span>
          <span>•</span>
          <span>nflverse</span>
          <span>•</span>
          <span>NFL Next Gen Stats</span>
          <span>•</span>
          <span>YouTube</span>
        </div>
        <p className="text-xs mt-4">
          NFL Stats Platform © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
