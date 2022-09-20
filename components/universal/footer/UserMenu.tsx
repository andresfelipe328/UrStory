import { useRef, useEffect, useState } from "react"
import Link from "next/link"

import {FaUser} from 'react-icons/fa'

import {gsap} from 'gsap'
import { useAuth } from "../../../context/AuthContext"
import { useRouter } from "next/router"

const UserMenu = () => {
   const {user, logout} = useAuth()
   const [openMenu, setOpenMenu] = useState(false)
   const router = useRouter()

   const userBtn = useRef<HTMLButtonElement>(null)
   const menuBox = useRef<HTMLDivElement>(null)
   useEffect(() => {
      gsap.from(userBtn.current, {
         duration: 2,
         opacity: 0,
         y: 20,
         ease: "elastic.out(1, 0.75)"
      })
   }, [])

   useEffect(() => {
      if (openMenu)
         gsap.from(menuBox.current!, {
            duration: .3,
            opacity: 0
         })
   }, [openMenu])

   useEffect(() => {
      const handleClickOutside = (e:any) => {
         if (menuBox.current && !menuBox.current.contains(e.target))
            setOpenMenu(false)
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, [menuBox]);
   
   const handleLogout = async () => {
      try {
         await logout()
      } catch(err) {
         console.log(err)
      }
   }

   const handleToProfile = () => {
      router.push(`/profile/${user.displayName}`)
      setOpenMenu(!openMenu)
   }

   return (
      <div className="relative">
         { openMenu &&
            <div id='menu' className={`absolute left-0 ${user ? '-top-[12.1rem]' : '-top-[8.75rem]'} w-[220px] p-4 shadow-mdShadow rounded-md bg-light_2 dark:bg-dark_1 origin-bottom-left`} ref={menuBox}>
               <ul className="flex flex-col gap-2">
                  <li className="m-0 list-none">
                     { user 
                        ?
                           <button onClick={handleLogout} className='text-dark_2 dark:text-light_2 font-semibold'>
                              <p className="transform hover:font-semibold transition duration-200 ease-in">
                                 Logout
                              </p>
                           </button>
                        :
                           <Link href={'/login'}>
                              <button className='text-dark_2 dark:text-light_2 font-semibold'>
                                 <p className="hover:font-semibold transition duration-200 ease-in">
                                    Login
                                 </p>
                              </button>
                           </Link>
                     }
                  </li>
                  <li className="m-0 list-none">
                     <button className='text-dark_2 dark:text-light_2 font-semibold'>
                        <p className="hover:font-semibold transition duration-200 ease-in">
                           Refine Recommendations 
                        </p>
                     </button>
                  </li>
                  <li className="m-0 list-none">
                     <button className='text-dark_2 dark:text-light_2 font-semibold'>
                        <p className="hover:font-semibold transition duration-200 ease-in">
                           Your Stats
                        </p>
                     </button>
                  </li>
                  {user &&
                     <li className="m-0 border-t-2 border-dark_2/[.30] dark:border-light_1/[.30] pt-1 list-none">
                        <button onClick={handleToProfile} className='w-full flex items-center justify-center gap-1 bg-[#f2b400] px-5 py-2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in font-semibold'>
                           View profile
                        </button>
                     </li>
                  }
               </ul>
            </div>
         }

         <button ref={userBtn} onClick={() => setOpenMenu(!openMenu)}>
            <div className="rounded-full border-2 border-dark_2 dark:border-light_1 p-px">
               <img src={user?.photoURL || '/defaultUser.svg'} alt="user icon" className="w-8 h-8 object-cover rounded-full "/>
            </div>
         </button>
      </div>
   )
}

export default UserMenu