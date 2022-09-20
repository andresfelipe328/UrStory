import Link from 'next/link'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next'
import { SyntheticEvent, useEffect, useRef, useState } from 'react'

import { useAuth } from '../../context/AuthContext'

import gsap from 'gsap'
import {verifyIdToken} from '../../config/firebaseAdmin'
import nookies from 'nookies'

import { FaTrashAlt } from 'react-icons/fa'
import { AiFillSave } from 'react-icons/ai'
import ProfileLayout from '../../components/ProfileLayout'
import { collection, onSnapshot, orderBy, query, where, getDocs, doc, getDoc, limit } from 'firebase/firestore'
import { db } from '../../config/firebase'
import ProfileAbout from '../../components/ProfileAbout'
import Image from 'next/image'


const months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

// interface ProfileUser {
//    username: string,
//    userIcon: string,
//    followerCount: number,
//    following: []
// }

interface Props {
   stories: string,
   mode: boolean,
   userInfo: string
}

const Profile = ({stories, mode, userInfo}: Props) => {
   const {user, saveStory, deleteYourStory} = useAuth()
   const [profileUser, setProfileUser] = useState({})
   const [yourStories, setYourStories] = useState<any[]>([])
   const [currPage, setCurrPage] = useState('home')
   const router = useRouter()
   const {username} = router.query

   const listBox = useRef<HTMLUListElement>(null)
   useEffect(() => {
      const listChildren = listBox.current?.childNodes
      if (listChildren && listChildren!.length > 0)
         gsap.from(listChildren!, {
            duration: 1,
            delay: .5,
            opacity: 0,
            y: 20,
            stagger: .2,
            ease: "elastic.out(1, 0.75)"
         })
   }, [yourStories, currPage])

   useEffect(() => {
      const userProfileInfo = JSON?.parse(userInfo)
      let unsubscribe:any = null
      setProfileUser({
         username: username,
         userIcon: !mode ? userProfileInfo.userIcon : user?.photoURL,
         followers: userProfileInfo.followers,
         followings: userProfileInfo.followings
      })

      if (mode && user) {
         const qStories = query(collection(db, `users/${user.displayName}/stories`), orderBy('timeStamp', "desc"));
         unsubscribe = onSnapshot(qStories, (querySnapshot) => {
            const storyList:any[] = [];
            querySnapshot.forEach((doc) => {
               storyList.push(doc.data());
            });
            setYourStories(storyList)
         });
      }
      else {
         setYourStories(JSON.parse(stories))
      }

      return() => {
         if (!router.asPath.includes('/profile'))
            unsubscribe()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [router.asPath])

   const modifyDate = (timeStamp: any) => {
      const date = new Date(timeStamp?.seconds*1000 + timeStamp?.nanoseconds/100000)
      const newDate = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`

      return (
         <small className='text-dark_2/[.60] dark:text-light_1/[.60] font-semibold right-2'>{newDate}</small>
      )
   }

   const handleSave = async (e:SyntheticEvent, story:any) => {
      e.stopPropagation()
      if (user) {
         const savedStory = {
            slug: story.slug, 
            title: story.title, 
            mainImg: story.mainImg, 
            category: story.category, 
            authorIcon: story.authorIcon, 
            author: story.author, 
            timeStamp: story.timeStamp, 
            wordCount: story.wordCount}
         await saveStory(savedStory)
      }
      else
         router.push('/login')
   }

   const handleDeleteStory = async (e:SyntheticEvent, slug:string) => {
      e.stopPropagation()
      await deleteYourStory(slug)
   }

   return (
      <ProfileLayout profileUser={profileUser} mode={mode} currPage={currPage} setCurrPage={setCurrPage}>
         <Head>
            <title>Profile - {username}</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
         </Head>

         {currPage === 'home' ?
               <ul className='w-full flex flex-col gap-5' ref={listBox}>
                  {yourStories.map((story:any) => {
                     return (
                        <Link href={`/story/${story.slug}`} key={story.slug}>
                           <li key={story.slug} className='ml-0 flex flex-col lg:flex-row gap-2 cursor-pointer group'>
                              <div className='relative h-60 w-full lg:w-[45%] shadow-xsShadow rounded-md group-hover:shadow-smShadow overflow-hidden transition duration-200 ease-in'>
                                 {story.mainImg && 
                                    <Image
                                       src={story.mainImg}
                                       alt="article image"
                                       layout="fill" 
                                       objectFit="cover"
                                       priority={true}
                                       className='rounded-md group-hover:scale-105 transition-transform duration-200 ease-in'
                                    />
                                 }
                              </div>
                              <div className='flex flex-col lg:w-[55%]'>
                                 <h2>{story.title}</h2>
                                 {modifyDate(story.timeStamp)}
                                 <div className='my-3' dangerouslySetInnerHTML={{__html:story.body.slice(0,300) + '...'}}/>
                                 <div className='flex justify-between mt-auto'>
                                    <Link href={`/${story.category}/stories`}>
                                       <small className='text-dark_2/[.60] dark:text-light_1/[.60] font-bold hover:text-dark_2 hover:dark:text-light_1 transition duration-200 ease-in'>
                                          @{story.category}
                                       </small>
                                    </Link>
                                    <div className='flex gap-2 items-center'>
                                       {user?.displayName === story.author &&
                                          <button onClick={(e) => handleDeleteStory(e, story.slug)}>
                                             <FaTrashAlt className='hover:scale-[120%] text-red-600 transition-transform duration-200 ease-in-out'/>
                                          </button>
                                       }   
                                       <button onClick={(e) => handleSave(e, story)}>
                                          <AiFillSave className='text-xl text-dark_2/[.6] dark:text-light_1/[.6] hover:scale-[120%] transition-transform duration-200 ease-in-out'/>
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           </li>
                        </Link>
                     )
                  })}
               </ul>
            :
               <ProfileAbout/>
         }
      </ProfileLayout>
   )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
   ctx.res.setHeader(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=59'
   )
   try {
      const username = ctx.params!.username?.toString()

      const cookies = nookies.get(ctx)
      const token = await verifyIdToken(cookies.token)
      const {name} = token
      let isYourProfile = true
      let stories:any[] = []
      let followers:any[] = []
      let followings:any[] = []
      let userInfo = {}

      if (username && name !== username) {
         const qStoriesRef = query(collection(db, `publicStories`), where('author', '==', username), orderBy('timeStamp', "desc"))
         const qStoriesSnap = await getDocs(qStoriesRef)
         isYourProfile = false
         
         qStoriesSnap.forEach((doc) => {
            stories.push({...doc.data()})
         });

         const userRef = doc(db, 'users', username)
         const userSnap = await getDoc(userRef)
         if (userSnap.exists())
            userInfo = {
               userIcon: userSnap.data().userIcon
            }
      }

      const followerRef = query(collection(db, `users/${username}`, 'followers'), orderBy('username'), limit(10))
      const followerSnap = await getDocs(followerRef)
      followerSnap.forEach((doc) => {
         followers.push({...doc.data()})
      })
      
      const followingRef = query(collection(db, `users/${username}`, 'followings'), orderBy('username'), limit(10))
      const followingSnap = await getDocs(followingRef)
      followingSnap.forEach((doc) => {
         followings.push({...doc.data()})
      })
      
      userInfo = {
         ...userInfo,
         followers,
         followings
      }
      
      return {
         props: {
            stories: JSON.stringify(stories),
            userInfo: JSON.stringify(userInfo),
            mode: isYourProfile
         }
      }
   } catch(err) {
      console.log(err)
      return {
         redirect: {destination: '/login'}
      }
   }
}

export default Profile