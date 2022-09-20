import {useRef, useEffect} from 'react'

import gsap from 'gsap'
import { useAuth } from '../context/AuthContext'
import { FaTimes } from 'react-icons/fa'
import { useRouter } from 'next/router'

interface Props {
   followerList: [],
   followerCount: number,
   openFollowers: boolean,
   setOpenFollowers: Function
}

const FollowerContainer = ({followerList, followerCount, openFollowers, setOpenFollowers}: Props) => {
   const {user, followWriter} = useAuth()
   const router = useRouter()

   const overlay = useRef<HTMLDivElement>(null)
   useEffect(() => {
      if (openFollowers)
         gsap.from(overlay.current!, {
            duration: .8,
            y: 35,
            opacity: 0,
            ease: "elastic.out(1, 0.75)"
         })
   }, [openFollowers])

   const handleFollow = async (username:string) => {
      await followWriter(username)
   }

   const handleToProfile = (username:string) => {
      setOpenFollowers(!openFollowers)
      router.push(`/profile/${username}`)
   }

   return (
      <div className='absolute flex flex-col p-2 gap-2 items-center w-full h-full rounded-md bg-light_1/[.95] dark:bg-dark_2/[.95]' ref={overlay}>
         <button onClick={() => setOpenFollowers(!openFollowers)}>
            <FaTimes className='absolute top-3 right-3 text-dark_2 dark:text-light_1'/>
         </button>
         <h1 className='mb-2'>Followers ({followerCount})</h1>
         <ul className='bg-light w-full'>
            {followerList.map((follower:any) => (
               <div key={follower.username} className='w-full flex items-center justify-around gap-2 m-0'>
                  <div className='flex gap-2 items-center'>
                     <button onClick={() => handleToProfile(follower.username)} className="rounded-full border-2 border-dark_2 dark:border-light_1 p-px">
                        <img src={follower.userIcon} alt="user icon" className="w-[3.5rem] h-[3.5rem] object-cover rounded-full "/>
                     </button>
                     <p className='font-semibold'>{follower.username}</p>
                  </div>
                  {follower.username === user.displayName ?
                        <div className='text-dark_2 rounded-md font-semibold flex items-center justify-center gap-1 bg-[#f2b400] px-5 py-2 shadow-mdShadow'>
                           You
                        </div>
                     :
                        <button onClick={() => handleFollow(follower.username)} className='text-dark_2 font-semibold flex items-center justify-center gap-1 bg-[#f2b400] px-5 py-2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                           Follow
                        </button>
                  }
               </div>
            ))}
         </ul>
      </div>
   )
}

export default FollowerContainer