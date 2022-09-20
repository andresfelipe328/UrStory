import { useRef, useEffect, useState, SyntheticEvent } from 'react'
import Link from 'next/link'

import { Post } from '../../typings'

import {gsap} from 'gsap'
import { handleReadingTime } from '../../utils/helperFuncts'
import { useAuth } from '../../context/AuthContext'

import { FaTimes } from 'react-icons/fa'

interface Props {
   stories: Post[],
   mode?: string 
}
const months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const StoriesListing = ({stories, mode}: Props) => {
   const {unsaveStory} = useAuth()
   const [tmpStories, setTmpStories] = useState<Post[]>([])

   const list = useRef<HTMLUListElement>(null)
   useEffect(() => {
      setTmpStories(stories)
   }, [stories])

   useEffect(() => {
      const listChildren = list.current?.childNodes
      if (listChildren!.length > 0) {
         gsap.from(listChildren!, {
            duration: 1,
            delay: .4,
            opacity: 0,
            y: 20,
            stagger: .2,
            ease: "elastic.out(1, 0.75)"
         })
      }
   }, [tmpStories])

   const modifyDate = (timeStamp: any) => {
      const date = new Date(timeStamp?.seconds*1000 + timeStamp?.nanoseconds/100000)
      const newDate = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`

      return (
         <small className='text-dark_2/[.60] dark:text-light_1/[.60] font-semibold right-2'>{newDate}</small>
      )
   }

   const handleUnsaveStory = async (e:SyntheticEvent, slug:string) => {
      e.stopPropagation()
      await unsaveStory(slug)
   }
   
   return (
      <ul className='p-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3' ref={list}>
         {tmpStories.map((story:any) => {
            return (
               <div key={story.slug}>
                  <li className='w-full relative flex flex-col items-center gap-2 group m-0'>
                     {mode && 
                        <button className='shadow-smShadow hover:rotate-90 transition duration-200 ease-in absolute z-10 right-2 -top-2 p-2 bg-[#f2b400]' onClick={(e) => handleUnsaveStory(e, story.slug)}>
                           <FaTimes className='text-dark_2'/>
                        </button>
                     }
                     <Link href={`/story/${story.slug}`} key={story.slug}>
                        <div className='h-60 w-full shadow-xsShadow rounded-md group-hover:shadow-smShadow overflow-hidden transition duration-200 ease-in cursor-pointer'>
                           <img 
                              src={story.mainImg} 
                              alt="article image"
                              className='h-60 w-full object-cover rounded-md group-hover:scale-105 transition-transform duration-200 ease-in'
                           />
                        </div>
                     </Link>
                     <div className='-translate-y-8 shadow-xsShadow flex flex-col w-11/12 gap-2 rounded-md p-3 group-hover:shadow-onHover group-hover:-translate-y-12 transition duration-200 ease-in bg-light_2 dark:bg-dark_1'>
                        <h4 className='uppercase text-dark_1 dark:text-light_2 font-bold'>
                           {story.title}
                        </h4>
                        <Link href={`/stories/${story.category}`}>
                        <small className='w-fit text-dark_2/[.60] dark:text-light_1/[.60] font-bold hover:text-dark_2 hover:dark:text-light_1 transition duration-200 ease-in cursor-pointer'>
                           @{story.category}
                        </small>
                        </Link>
                        <div className='flex gap-2 items-end justify-between'>
                           <div className='flex gap-2 items-end relative'>
                              <Link href={`/profile/${story.author}`}>
                                 <div className='rounded-full border-2 border-dark_2/[.60] dark:border-light_1/[.60] hover:border-dark_2 hover:dark:border-light_1 transition duration-200 p-px cursor-pointer'>
                                    <img 
                                       src={story.authorIcon} 
                                       alt="author icon"
                                       className='w-12 h-12 object-cover rounded-full'
                                    />
                                 </div>
                              </Link>
                              <div className='flex flex-col gap-1'>
                                 <p className='text-dark_1 dark:text-light_2 font-bold'>
                                    {story.author}
                                 </p>
                                 {modifyDate(story.timeStamp)}
                              </div>
                           </div>
                        </div>
                        <small className='absolute text-dark_2/[.60] dark:text-light_1/[.60] font-semibold right-3 bottom-3'>
                           {handleReadingTime(story.wordCount)}
                        </small>
                     </div>
                  </li>
               </div>
            )
         })}
      </ul>
   )
}

export default StoriesListing