'use client'

import Header from '@/components/Header'
import ViewLoader from '@/components/loaders/ViewLoader'
import dynamic from 'next/dynamic'

const Blob = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Blob), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => <ViewLoader />,
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function Page() {
  return (
    <>
      <Header />

      <View className='absolute top-0 flex h-screen w-full flex-col items-center justify-center'>
        <Blob route='/' />
        <Common />
      </View>
    </>
  )
}
