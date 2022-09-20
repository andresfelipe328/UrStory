import {useRef, useEffect, useState, SyntheticEvent} from 'react'
import { useRouter } from 'next/router'

import {gsap} from 'gsap'
import { useAuth } from '../context/AuthContext'
import {AiFillEdit} from 'react-icons/ai'
import { FaTimes } from 'react-icons/fa'

import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'

const ProfileAbout = () => {
   const [about, setAbout] = useState('')
   const [edit, setEdit] = useState(false)
   const {user, updateAbout} = useAuth()
   const router = useRouter()
   const {username} = router.query

   const aboutMe = useRef<HTMLDivElement>(null)
   useEffect(() => {
      const aboutMeChildren = aboutMe.current?.childNodes
      gsap.from(aboutMeChildren!, {
         duration: 1,
         delay: .5,
         opacity: 0,
         y: 20,
         stagger: .2,
         ease: "elastic.out(1, 0.75)"
      })

      
      const unsubscribe = onSnapshot(doc(db, 'users', username!.toString()), (doc) => {
         if (doc.exists()) {
            setAbout(doc.data().about)
         }
      })

      return () => {
         unsubscribe()
      }
   }, [router.asPath])

   const handleAbout = async (e:SyntheticEvent) => {
      e.preventDefault()
      await updateAbout(user.displayName, about)
      setEdit(!edit)
   }

   return (
      <div className='relative w-full flex flex-col gap-2' ref={aboutMe}>
         {  user?.displayName === username ?

            edit ? 
                  <button onClick={() => setEdit(!edit)} className='absolute top-2 right-2 z-10'>
                     <FaTimes className='text-[#f2b400] text-xl hover:scale-[120%] transition-transform duration-200 ease-in-out'/>
                  </button>
               :
                  <button onClick={() => setEdit(!edit)} className='absolute top-2 right-2 z-10'>
                     <AiFillEdit className='text-[#f2b400] text-xl hover:scale-[120%] transition-transform duration-200 ease-in-out'/>
                  </button>
            :
               null
         }
         <h2>About Me</h2>
         {  !edit ?
               <p className='font-medium'>
                  {about}   
               </p>
            :
               <form className='w-full flex flex-col items-center gap-1' onSubmit={handleAbout}>
                  <textarea
                     cols={30} 
                     rows={20}
                     onChange={(e) => setAbout(e.target.value)}
                     value={about}
                     className='w-full max-h-full border border-[#f2b400] rounded-md text-dark_2 dark:text-light_1'
                  />

                  <button className='w-fit px-5 py-1 rounded-md bg-[#f2b400] text-dark_1 font-semibold shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                     Submit
                  </button>
               </form>
         }
      </div>
   )
}

export default ProfileAbout