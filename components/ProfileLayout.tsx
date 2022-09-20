import Link from "next/link"
import { useAuth } from "../context/AuthContext"

import { MdMarkEmailRead, MdEmail, MdOutlineMoreHoriz } from "react-icons/md"
import {RiUserFollowFill, RiUserUnfollowFill } from 'react-icons/ri'
import { FaEdit } from "react-icons/fa"

import { useRouter } from "next/router"
import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { BiLogInCircle } from "react-icons/bi"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../config/firebase"
import FollowerContainer from "./FollowerContainer"
import Image from "next/image"

interface Props {
   children: any,
   profileUser: any,
   mode: boolean,
   currPage: string,
   setCurrPage: Function
}

const ProfileLayout = ({children, profileUser, mode, currPage, setCurrPage}:Props) => {
   const {user, followWriter, notifyFollowing, checkFollowingNotify} = useAuth()
   const [followerCount, setFollowerCount] = useState(0)
   const [followingCount, setFollowingCount] = useState(0)
   const [openFollowers, setOpenFollowers] = useState(false)
   const router = useRouter()
   const {username} = router.query
   const [isFollowing, setIsFollowing] = useState(false)
   const [isNotify, setIsNotify] = useState(false)

   const profileBox = useRef<HTMLDivElement>(null)
   useEffect(() => {
      let unsubscribe:any = null
      const profileBoxChildren = profileBox.current?.childNodes
      if (profileBoxChildren!.length > 0)
         gsap.from(profileBoxChildren!, {
            duration: 1,
            opacity: 0,
            delay: .5,
            y: 20,
            stagger: .2,
            ease: "elastic.out(1, 0.75)"
         })
         
      if (mode && user) {
         unsubscribe = onSnapshot(doc(db, 'users', user.displayName), (doc) => {
            if (doc.exists()) {
               setFollowerCount(doc.data().followers || 0)
               setFollowingCount(doc.data().followings || 0)
            }
         })
      }
      else if (username) {
         unsubscribe = onSnapshot(doc(db, 'users', username.toString()), (doc) => {
            if (doc.exists()) {
               setFollowerCount(doc.data().followers || 0)
               setFollowingCount(doc.data().followings || 0)
            }
         })
      }

      (async () => {
         const ans = await checkFollowingNotify(user?.displayName, username)
         setIsFollowing(ans.isFollowing)
         setIsNotify(ans.isFollowing)
      })();

      return() => {
         if (!router.asPath.includes('/profile'))
            unsubscribe()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router.asPath])

   const handleFollow = async () => {
      const ans = await followWriter(profileUser.username, profileUser.userIcon)
      setIsFollowing(ans)
   }

   const handleNotify = async (username:string) => {
      const ans = await notifyFollowing(username)
      setIsNotify(ans)
   }

   return (
      <article className='relative flex flex-col lg:flex-row gap-2 flex-1 w-full' ref={profileBox}>
         <div className="flex flex-1 flex-col gap-2 items-start lg:w-[75%]">
            <div className="relative w-full flex flex-col gap-5">
               <button className="absolute right-0 -top-1">
                  <MdOutlineMoreHoriz className="text-dark_2 dark:text-light_1 text-3xl"/>
               </button>

               <div className="lg:hidden">
                  <div className="flex gap-2 items-center">
                     <div className='w-fit rounded-full border-2 border-dark_2 dark:border-light_1 p-px'>
                        <div className="relative w-[6.5rem] h-[6.5rem] rounded-full">
                           <Image 
                              src={profileUser.userIcon} 
                              alt="author icon"
                              width="100%" 
                              height="100%" 
                              layout="fill" 
                              objectFit="cover"
                           />
                        </div>
                     </div>
                     <div className="flex flex-col gap-1 "> 
                        <h1>{profileUser.username}</h1>
                        {  followerCount !== 0 &&
                              <button onClick={() => setOpenFollowers(!openFollowers)} className="w-fit text-dark_2/[.60] dark:text-light_1/[.60] font-semibold hover:text-dark_2 hover:dark:text-light_1 transition duration-200 ease-in">
                                 {followerCount} {followerCount > 1 ? 'Followers' : 'Follower'}
                              </button>    
                        }
                        {user && user?.displayName !== username ?
                              <ul className="flex gap-2"> 
                                 <button id='follow' onClick={handleFollow} className='text-dark_2 font-semibold flex items-center justify-center gap-1 bg-[#f2b400] px-5 py-2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                                    {isFollowing ? 'Following' : 'Follow'}
                                 </button>
                                 <button onClick={() => handleNotify(profileUser.username)} className='font-semibold flex items-center justify-center gap-1 bg-[#f2b400] px-5 py-2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                                    {isNotify ? <MdMarkEmailRead className="text-xl text-dark_2"/> : <MdEmail className="text-xl text-dark_2"/>}
                                 </button>
                              </ul>
                           :
                              !user &&
                              <Link href='/login'>
                                 <div className='w-full'>
                                    <button className='flex items-center justify-center gap-1 bg-[#f2b400] px-5 py-2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                                       <BiLogInCircle className='text-dark_1 dark:text-dark_2 text-[1.15rem]'/>
                                       <p className='text-dark_2 dark:text-dark_2 font-bold'>Login</p>
                                    </button>
                                 </div>
                              </Link>
                        }
                     </div>
                  </div>
               </div>

               <h1 className="hidden lg:inline-block">{profileUser.username}</h1>
               <ul className="flex gap-5 pb-2 border-b-2 border-[#f2b400]/[.6]">
                  <button onClick={() => setCurrPage('home')} className={`profile_menu text-dark_1 dark:text-light_1 font-semibold ${currPage === 'home' && 'before:scale-100'}`}>
                     Home
                  </button>
                  <button onClick={() => setCurrPage('about')} className={`profile_menu text-dark_1 dark:text-light_1 font-semibold ${currPage === 'about' && 'before:scale-100'}`}>
                     About
                  </button>
               </ul>
            </div>

            <div className="flex flex-1 w-full p-2 px-2">
               {children}
            </div>
         </div>

         <div className='relative flex-col gap-2 border-t-2 hidden lg:flex lg:border-t-0 lg:p-2 lg:w-[25%] lg:border-l-2 border-dark_2/[.30] dark:border-light_1/[.30]'>
            <div className="sticky top-20 flex flex-col gap-2">
               <div className="flex gap-1 items-end">
                  <div className='w-fit rounded-full border-2 border-dark_2 dark:border-light_1 p-px'>
                     <div className='relative w-[8.5rem] h-[8.5rem] rounded-full overflow-hidden'>
                        <Image 
                           src={profileUser.userIcon} 
                           alt="author icon"
                           width="100%" 
                           height="100%" 
                           layout="fill" 
                           objectFit="cover"
                        />
                     </div>
                  </div>
                  <div className="flex flex-col">
                     <h2> 
                        {profileUser.username}
                     </h2>
                     {  followerCount !== 0 &&
                           <button onClick={() => setOpenFollowers(!openFollowers)} className="w-fit text-dark_2/[.60] dark:text-light_1/[.60] font-semibold hover:text-dark_2 hover:dark:text-light_1 transition duration-200 ease-in">
                              {followerCount} {followerCount > 1 ? 'Followers' : 'Follower'}
                           </button>    
                     }
                  </div>
               </div>
               {user && user?.displayName !== username ?
                     <ul className="flex gap-2 mt-5"> 
                        <button id='follow' onClick={handleFollow} className='text-dark_2 font-semibold flex items-center justify-center gap-1 bg-[#f2b400] px-5 py-2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                           {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <button onClick={() => handleNotify(profileUser.username)} className='font-semibold flex items-center justify-center gap-1 bg-[#f2b400] px-5 py-2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                           {isNotify ? <MdMarkEmailRead className="text-xl text-dark_2"/> : <MdEmail className="text-xl text-dark_2"/>}
                        </button>
                     </ul>
                  :
                     !user &&
                     <Link href='/login'>
                        <div className='w-full'>
                           <button className='flex items-center justify-center gap-1 bg-[#f2b400] px-5 py-2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                              <BiLogInCircle className='text-dark_1 dark:text-dark_2 text-[1.15rem]'/>
                              <p className='text-dark_2 dark:text-dark_2 font-bold'>Login</p>
                           </button>
                        </div>
                     </Link>
               }
               <h3>following</h3>
               <ul className="flex flex-col gap-2">
                  {profileUser.followings?.map((following:any) => (
                     <div className='flex gap-2 items-center justify-between' key={following.username}>
                        <div className="flex gap-2 items-center">
                           <Link href={`/profile/${following.username}`}>
                              <div className="rounded-full border-2 border-dark_2 dark:border-light_1 hover:border-dark_1 hover:dark:border-light_2 transition duration-200 ease-in p-px cursor-pointer">
                                 <div className="relative w-[2.5rem] h-[2.5rem] rounded-full overflow-hidden">
                                    <Image 
                                       src={following.userIcon} 
                                       alt="user icon" 
                                       width="100%" 
                                       height="100%" 
                                       layout="fill" 
                                       objectFit="cover"
                                    />
                                 </div>
                                 
                              </div>
                           </Link>
                           <p className="font-semibold">{following.username}</p>
                        </div>
                        { user?.displayName === profileUser.username &&
                           <div className="flex gap-2">
                              <button onClick={handleFollow}>
                                 {isFollowing ? 
                                    <RiUserUnfollowFill className='text-xl text-dark_2/[.6] dark:text-light_1/[.6] hover:scale-[120%] transition-transform duration-200 ease-in-out'/>
                                 :
                                    <RiUserFollowFill className='text-xl text-dark_2/[.6] dark:text-light_1/[.6] hover:scale-[120%] transition-transform duration-200 ease-in-out'/>
                                 }
                              </button>
                              {/* <button onClick={() => handleNotify(following.username)}>
                                 {following.notify ? 
                                    <MdMarkEmailRead className='text-xl text-dark_2/[.6] dark:text-light_1/[.6] hover:scale-[120%] transition-transform duration-200 ease-in-out'/> 
                                    : 
                                    <MdEmail className='text-xl text-dark_2/[.6] dark:text-light_1/[.6] hover:scale-[120%] transition-transform duration-200 ease-in-out'/>
                                 }
                              </button> */}
                           </div>
                        }
                     </div>
                  ))}
               </ul>
            </div>
         </div>

         {  openFollowers &&
            <FollowerContainer
               followerList={profileUser.followers}
               openFollowers={openFollowers}
               setOpenFollowers={setOpenFollowers}
               followerCount={followerCount}
            />
         }

      </article>
      
   )
}

export default ProfileLayout