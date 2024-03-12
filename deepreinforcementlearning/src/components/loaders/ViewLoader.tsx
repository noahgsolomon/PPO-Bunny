import { Loader, Loader2 } from 'lucide-react'

export default function ViewLoader() {
  return (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <Loader className='w-4 h-4 animate-spin' />
    </div>
  )
}
