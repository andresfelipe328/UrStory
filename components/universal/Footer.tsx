import { useState, useRef, useEffect } from 'react'
import {useTheme} from 'next-themes'

import {gsap} from 'gsap'

import {BsFillSunFill,BsFillMoonFill} from 'react-icons/bs'
import UserMenu from './footer/UserMenu'
import WebMenu from './footer/WebMenu'

const Footer = () => {
   const {systemTheme, theme, setTheme} = useTheme()
   const [mounted, setMounted] = useState(false)

   const mode = useRef<HTMLDivElement>(null)
   // useEffect(() => {
   //    gsap.from(mode.current, {
   //       duration: 2,
   //       opacity: 0,
   //       y: 20,
   //       delay: .4,
   //       ease: "elastic.out(1, 0.75)"
   //    })
   // }, [])
   
   useEffect(() => {
      setMounted(true)
   }, [])

   useEffect(() => {
      gsap.from(mode.current, {
         duration: 2,
         opacity: 0,
         y: 20,
         ease: "elastic.out(1, 0.75)"
      })
   }, [theme])

   const renderThemeBtn = () => {
      if (!mounted) return null

      const currentTheme = theme === 'system' ? systemTheme : theme

      if (currentTheme === 'dark')
         return (
            <button onClick={() => setTheme('light')} className='relative shadow-mdShadow bg-dark_2 w-12 h-7 p-2 rounded-full drop-shadow-md'>
               <BsFillMoonFill className='absolute text-moon transition duration-200 ease-out'/>
            </button>
         )
      else 
         return (
            <button onClick={() => setTheme('dark')} className='relative shadow-mdShadow bg-dark_2 w-12 h-7 p-2 rounded-full drop-shadow-md'>
               <BsFillSunFill className='absolute text-sun transition duration-200 ease-out'/>
            </button>
         )
   }

   return (
      <footer className='flex rounded-t-md w-full items-center justify-between py-2 px-6 max-w-7xl mx-auto fixed bottom-0 bg-light_2 dark:bg-dark_1 shadow-invXsShadow'>

         <UserMenu/>
         <WebMenu/>

         <div className='relative' ref={mode}>
            {renderThemeBtn()}
         </div>
      </footer>
   )
}

export default Footer