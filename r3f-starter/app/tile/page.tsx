'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })
const Cube = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Cube), { ssr: false })

export default function Page() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <View className=' mx-auto bg-black flex flex-row max-w-96 max-h-96 w-full h-full justify-center items-start'>
          <Cube />
          <Common />
        </View>
      </Suspense>
    </>
  )
}
