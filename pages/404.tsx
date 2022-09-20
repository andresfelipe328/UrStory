import {useRef, useEffect} from 'react'
import { NextPage } from 'next'
import {gsap} from 'gsap'
import Image from 'next/image'

const Page404: NextPage = () => {
   const image = useRef<HTMLDivElement>(null)
   useEffect(() => {
      gsap.from(image.current, {
         duration: .8,
         opacity: 0,
         scale: 0,
         ease: "elastic.out(1, 0.75)"
      })
   }, [])

   return (
      <article className='p-4 flex flex-1 items-center justify-center'>
         <div ref={image}>
         <Image
            src='/notFound.png' 
            alt="not found"
            width={482}
            height={469}
         />
         </div>
      </article>
   )
}

export default Page404