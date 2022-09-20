import { useRef, useEffect, useState } from "react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"

import {gsap} from 'gsap'

const Navbar = () => {
   const {theme, systemTheme} = useTheme()
   const [mounted, setMounted] = useState(false)

   const logo = useRef<HTMLDivElement>(null)
   useEffect(() => {
      gsap.from(logo.current, {
         duration: 1.5,
         opacity: 0,
         x: -20,
         ease: "elastic.out(1, 0.75)"
      })

      setMounted(true)
   }, [theme])

   const renderLogo = () => {
      if (!mounted) return null

      const currentTheme = theme === 'system' ? systemTheme : theme

      if (currentTheme === 'dark')
         return (
            <Link href='/'>
               <div className="group flex gap-2 items-center cursor-pointer">
                  <Image
                     src='/webIcon_dark.svg'
                     alt="logo"
                     width={40}
                     height={40}
                     className="w-10 object-contain"
                  />
                  <h1 className="flex">
                     U<p className="font-bold text-[1rem]">r</p><span className="group-hover:translate-x-2 transition-transform ease-in-out">Story</span>
                  </h1>
               </div>
            </Link>
         )
      else 
         return (
            <Link href='/'>
               <div className="group flex gap-2 items-center cursor-pointer">
                  <Image
                     src='/webIcon_light.svg'
                     alt="logo"
                     width={40}
                     height={40}
                  />
                  <h1 className="flex">
                     U<p className="font-bold text-[1rem]">r</p><span className="group-hover:translate-x-2 transition-transform ease-in-out">Story</span>
                  </h1>
               </div>
            </Link>
         )
   }

   
   return (
      <header className='flex w-full rounded-b-md items-center justify-between py-4 px-6 max-w-7xl mx-auto fixed top-0 bg-light_2 dark:bg-dark_1 z-10 shadow-xsShadow'>
         <div className="logo-wrapper" ref={logo}>
            {renderLogo()}
         </div>

         <small className="absolute bottom-2 right-2 text-dark_2 dark:text-light_1 font-semibold">This is a work in progress</small>
      </header>
   )
}

export default Navbar