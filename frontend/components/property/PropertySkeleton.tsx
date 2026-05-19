'use client'

export function PropertySkeleton() {
  return (
    <div className="bg-card rounded-3xl overflow-hidden">
      <div className="skeleton aspect-[4/3]" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-4 w-3/4 rounded-full" />
        <div className="flex gap-3">
          <div className="skeleton h-3 w-20 rounded-full" />
          <div className="skeleton h-3 w-20 rounded-full" />
        </div>
        <div className="skeleton h-5 w-28 rounded-full" />
      </div>
    </div>
  )
}

export function PropertyDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="skeleton aspect-[16/9] w-full rounded-3xl mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="skeleton h-8 w-3/4 rounded-2xl" />
          <div className="skeleton h-4 w-1/2 rounded-full" />
          <div className="skeleton h-40 w-full rounded-2xl" />
        </div>
        <div className="skeleton h-80 w-full rounded-3xl" />
      </div>
    </div>
  )
}
