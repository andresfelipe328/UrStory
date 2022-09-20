import {useRef, useEffect} from 'react'
import { NextPage } from 'next'
import {gsap} from 'gsap'

const Page404: NextPage = () => {
   const image = useRef<HTMLImageElement>(null)
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
         <img 
            ref={image}
            src='/notFound.png' 
            alt="not found"
         />
      </article>
   )
}

export default Page404