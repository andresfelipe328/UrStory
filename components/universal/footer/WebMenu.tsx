import { useRef, useEffect } from "react"
import Link from "next/link"
import { AiFillEdit } from "react-icons/ai"
import { FaBell, FaHome, FaListUl } from "react-icons/fa"
import { MdAutoStories } from "react-icons/md"

import {gsap} from 'gsap'
import { useAuth } from "../../../context/AuthContext"

const MENU = [
   {
      label: 'Home',
      icon: FaHome,
      href: '/'
   },
   {
      label: 'Notifications',
      icon: FaBell,
      href: '/notifications'
   },
   {
      label: 'Lists',
      icon: FaListUl,
      href: '/lists'
   },
   {
      label: 'Stories',
      icon: MdAutoStories,
      href: '/your-stories/unpublished'
   },
   {
      label: 'Write',
      icon: AiFillEdit,
      href: '/new-story'
   }
]

const WebMenu = () => {
   const {notify} = useAuth()

   const menu = useRef<HTMLUListElement>(null)
   useEffect(() => {
      const menuChildren = menu.current?.childNodes
      
      gsap.from(menuChildren!, {
         duration: 1,
         delay: .9,
         opacity: 0,
         y: 20,
         stagger: .2,
         ease: "elastic.out(1, 0.75)"
      })
   }, [])

   return (
      <ul className='flex gap-6 items-center justify-center' ref={menu}>
         { MENU.map((menuItem) => {
            return (
               <Link href={menuItem.href} key={menuItem.label}>
                  <div className="relative group">
                     <label className="origin-bottom-right text-xs absolute bottom-5 -right-1 scale-0 group-hover:scale-100 transition-transform duration-100 ease-in px-2 py-1 rounded-md bg-dark_2 text-light_2 font-semibold">
                        {menuItem.label}
                     </label>
                     <button>
                        <menuItem.icon className={`text-dark_1 dark:text-light_2 hover:text-dark_2 dark:hover:text-light_1 transition duration-200 ease-in ${menuItem.label === 'Notifications' && notify && 'animate-wiggle'}`}/>
                     </button>
                  </div>
               </Link>
            )
         })}
      </ul>
   )
}

export default WebMenu