import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface SkeletonCardProps {
  showIcon?: boolean
  showDescription?: boolean
}

export function SkeletonCard({ showIcon = true, showDescription = true }: SkeletonCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          {showDescription && <Skeleton className="h-3 w-24" />}
        </div>
        {showIcon && <Skeleton className="h-4 w-4" />}
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}
