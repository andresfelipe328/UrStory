import { useRouter } from 'next/router'
import React, { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import { GetServerSidePropsContext } from 'next'

import { doc, getDoc } from "firebase/firestore"
import {db} from '../../config/firebase'

import {
   TwitterShareButton,
   TwitterIcon,
   FacebookShareButton,
   FacebookIcon,
   LinkedinShareButton,
   LinkedinIcon,
} from 'next-share';

import {AiTwotoneLike, AiFillSave} from 'react-icons/ai'
import {gsap} from 'gsap'

import PostComment from '../../components/storyComments/PostComment'
import CommentListing from '../../components/storyComments/CommentListing'
import { useAuth } from '../../context/AuthContext'
import { MdEmail, MdMarkEmailRead } from 'react-icons/md'
import Link from 'next/link'
import { BiLogInCircle } from 'react-icons/bi'
import Image from 'next/image'

interface Props {
  story: string
  comments: string
}
const months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const PublishedStory = ({story, comments}: Props) => {
   const [yourStory, setYourStory] = useState<any>({})
   const router = useRouter()
   const [url , setUrl] = useState('')
   const {user, setStoryUpdComments, setUpdLikes, updLikes, likeStory, saveStory, followWriter, notifyFollowing, checkFollowingNotify} = useAuth()
   const [isFollowing, setIsFollowing] = useState(false)
   const [isNotify, setIsNotify] = useState(false)

   const article = useRef<HTMLDivElement>(null)
   useEffect(() => {
      // Setting up state and URL
      setYourStory(JSON.parse(story))
      const origin = window.location.origin
      const URL = `${origin}${router.asPath}`
      setUrl(URL)
      setStoryUpdComments(JSON.parse(comments))
      setUpdLikes(JSON.parse(story).likes)

      // Animation
      const articleChildren = article.current?.childNodes
      gsap.from(articleChildren!, {
         duration: 1,
         opacity: 0,
         y: 20,
         stagger: .2,
         ease: "elastic.out(1, 0.75)"
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
   },[])

   useEffect(() => {
      (async () => {
         const username = JSON.parse(story).author
         if (user.displayName !== username) {
            const ans = await checkFollowingNotify(user.displayName, username)
            setIsFollowing(ans.isFollowing)
            setIsNotify(ans.isFollowing)
         }
      })();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   const modifyDate = (timestamp:any) => {
      if (timestamp) {
         const date = new Date(timestamp.seconds*1000 + timestamp.nanoseconds/100000)
         
         const newDate = `${months[date.getMonth()]} ${date.getDay()}, ${date.getFullYear()} at ${date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
         })}`

         return <small className='text-dark_2 dark:text-light_1 font-medium opacity-70'>{newDate}</small>
      }
   }

   const handleLike = async () => {
      if (user)
         await likeStory(yourStory.slug)
      else
         router.push('/login')
   }

   const handleSave = async () => {
      if (user) {
         const savedStory = {
            slug: yourStory.slug, 
            title: yourStory.title, 
            mainImg: yourStory.mainImg, 
            category: yourStory.category, 
            authorIcon: yourStory.authorIcon, 
            author: yourStory.author, 
            timeStamp: yourStory.timeStamp, 
            wordCount: yourStory.wordCount}
         await saveStory(savedStory)
      }
      else
         router.push('/login')
   }

   const handleFollow = async () => {
      const ans = await followWriter(yourStory.author, yourStory.authorIcon)
      setIsFollowing(ans)
   }

   const handleNotify = async () => {
      const ans = await notifyFollowing(yourStory.author)
      setIsNotify(ans)
   }

   return (
      <article className='flex flex-1 flex-col lg:flex-row gap-2' ref={article}>
         <Head>
            <title>{yourStory.title}</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
         </Head>
         <div className='flex flex-col gap-2 items-start lg:w-[70%]'>
            <div className='shadow-xsShadow rounded-md w-full'>
               <div className='relative rounded-md w-full h-96'>
                  <Image 
                     src={yourStory.mainImg} 
                     alt="article main image"
                     width="100%" 
                     height="100%" 
                     layout="fill" 
                     objectFit="cover" 
                  />
               </div>
            </div>
            <div className='relative flex items-end w-full justify-between gap-2 px-2 md:px-5'>
               <div className='flex items-center gap-2'>
                  <Link href={`/profile/${yourStory.author}`}>
                     <div className='rounded-full border-2 border-dark_2 dark:border-light_1 hover:border-dark_1 hover:dark:border-light_2 transition duration-200 ease-in p-px cursor-pointer'>
                        <div className='relative w-12 h-12 rounded-full overflow-hidden'>
                           <Image 
                              src={yourStory.authorIcon} 
                              alt="user icon" 
                              width="100%" 
                              height="100%" 
                              layout="fill" 
                              objectFit="cover"
                           />
                        </div>
                     </div>
                  </Link>
                  <div className='flex flex-col gap-2'>
                     <p className='text-dark_1 dark:text-light_2 font-bold'>
                        <small className='text-dark_2 dark:text-light_1 font-semibold'>Written By: </small>
                        {yourStory.author}
                     </p>
                     {modifyDate(yourStory.timeStamp)}
                  </div>
               </div>

               <ul className='absolute right-2 md:right-5 top-0 flex gap-2'>
                  <li className='list-none m-0'>
                     <FacebookShareButton url={url}>
                        <FacebookIcon size={25} round />
                     </FacebookShareButton>
                  </li>
                  <li className='list-none m-0'>
                     <TwitterShareButton url={url}>
                        <TwitterIcon size={25} round />
                     </TwitterShareButton>
                  </li>
                  <li className='list-none m-0'>  
                     <LinkedinShareButton url={url}>
                        <LinkedinIcon size={25} round />
                     </LinkedinShareButton>
                  </li>
               </ul>

               <ul className='absolute right-3 md:right-6 top-10 flex gap-2'>
                  <button onClick={() => handleSave()}>
                     <AiFillSave className='text-xl text-dark_2/[.6] dark:text-light_1/[.6] hover:scale-[120%] transition-transform duration-200 ease-in-out'/>
                  </button>
                  <button className='flex gap-1' onClick={handleLike}>
                     <AiTwotoneLike className='text-xl text-dark_2/[.6] dark:text-light_1/[.6] hover:scale-[120%] transition-transform duration-200 ease-in-out'/>
                     {updLikes?.length > 0 && <p>{updLikes.length}</p>}
                  </button>
               </ul>
            </div>
            <h1 className='px-5 mt-5'>{yourStory.title}</h1>
            <div className='mt-1 px-5' dangerouslySetInnerHTML={{__html:yourStory.body}}/>
         </div>

         <div className='relative flex flex-col gap-2 p-5 border-t-2 lg:border-t-0 lg:p-2 lg:w-[30%] lg:border-l-2 border-dark_2/[.30] dark:border-light_1/[.30]'>
            <div className='sticky top-20'>
                  {user ?
                        user.displayName !== yourStory.author &&
                        <div className='flex flex-col gap-1 mb-5'>
                           <h2>Stay in tpuch with {yourStory.author}</h2>
                           <ul className="flex gap-2">
                              <button onClick={handleFollow} className='text-dark_2 font-semibold flex items-center justify-center gap-1 bg-[#f2b400] px-5 py-2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                                 {isFollowing ? 'Following' : 'Follow'}
                              </button>
                              <button onClick={handleNotify} className='font-semibold flex items-center justify-center gap-1 bg-[#f2b400] px-5 py-2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                                 {isNotify ? <MdMarkEmailRead className="text-xl text-dark_2"/> : <MdEmail className="text-xl text-dark_2"/>}
                              </button>
                           </ul>
                        </div>
                     :
                        <Link href='/login'>
                           <div className='w-full'>
                              <button className='flex items-center justify-center gap-1 bg-[#f2b400] px-5 py-2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                                 <BiLogInCircle className='text-dark_1 dark:text-dark_2 text-[1.15rem]'/>
                                 <p className='text-dark_2 dark:text-dark_2 font-bold'>Login</p>
                              </button>
                           </div>
                        </Link>
                  }

               <PostComment
                  storyID={yourStory.slug}
               />
               <CommentListing
                  author={yourStory.author}
                  storyID={yourStory.slug}
               />
            </div>
         </div>
      </article>
   )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
   ctx.res.setHeader(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=59'
   )
   try {
      const slug = ctx.params!.slug
      const docRef = doc(db, `publicStories/${slug}`)
      const docSnap = await getDoc(docRef)
     
      if (!docSnap.exists()) 
      return {
         notFound: true,
      }
      else {
         const story = docSnap.data()
         const commentsRef = doc(db, `publicStories/${slug}/storyComments`, 'commentsList')
         const commentsSnap = await getDoc(commentsRef)
         let commentsList:any[] = commentsSnap.exists() ? commentsSnap.data().comments : []
   
         return {
            props: {
               story: JSON.stringify(story) || JSON.stringify([]),
               comments: JSON.stringify(commentsList)
            }
         }
      }
   } catch(err) {
      return {
         props: {
            story: JSON.stringify([]),
            comments: JSON.stringify([]),

         }
      }
   }
}

export default PublishedStory