import { createRef, forwardRef, SyntheticEvent, useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import {gsap} from 'gsap'

import { FaEdit, FaTrashAlt } from 'react-icons/fa'
import { Post } from '../../typings'
import { useAuth } from '../../context/AuthContext'
import { useRouter } from 'next/router'

interface Props {
   status: string
   list: any[]
}

const months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const StoriesListing = ({status, list}: Props) => {
   const [pages] = useState(['unpublished', 'published'])
   const {deleteYourStory} = useAuth()
   const router = useRouter()
   
   const listBox = useRef<HTMLUListElement>(null)
   useEffect(() => {
      gsap.from(listBox.current!, {
         duration: 1,
         delay: .4,
         opacity: 0,
         y: 20,
         stagger: .2,
         ease: "elastic.out(1, 0.75)"
      })
   }, [])

   const modifyDate = (timestamp:any, status:string) => {
      const date = new Date(timestamp.seconds*1000 + timestamp.nanoseconds/100000)
      
      const newDate = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${date.toLocaleString('en-US', {
         hour: '2-digit',
         minute: '2-digit',
      })}`
      
      return <small className='text-dark_2 dark:text-light_1 font-medium opacity-70'>{status === 'published' ? 'published:' : 'Last edited:'} {newDate}</small>
   }

   const handleToEdit = (e:SyntheticEvent, slug:string) => {
      e.stopPropagation()
      router.push(`/your-stories/unpublished/${slug}`)
   }

   const handleDeleteStory = async (e:SyntheticEvent, slug:string) => {
      e.stopPropagation()
      await deleteYourStory(slug, status)
   }

   return (
      <div className='flex flex-col flex-1'>
         <div className='flex-1 overflow-auto'>
            <ul ref={listBox} className='flex flex-1 flex-col gap-10 w-full'>
               { list.filter(story => story.status === status).length !== 0 
                  ?
                     list.filter(story => story.status === status).map((story:any) => {
                           return (
                              <Link href={status === 'published' ? `/story/${story.slug}` : `/your-stories/${status}/${story.slug}`} key={story.slug}>
                                 <div className='flex items-end border-b-[1px] border-dark_1/[30%] dark:border-light_2/[30%] px-2 pt-2 rounded-md pb-5 cursor-pointer hover:bg-light_1/[30%] dark:hover:bg-dark_2/[30%] transition duration-200 ease-in-out'>
                                    <div className='flex flex-1 flex-col gap-2'>
                                       <h3 className='uppercase text-dark_2 dark:text-light_1 font-bold'>
                                          {story.title}
                                       </h3>
                                       {modifyDate(story.timeStamp, story.status)}
                                    </div>
                                    <div className='flex items-center gap-2'>
                                       { status === 'published' &&
                                          <button onClick={(e) => handleToEdit(e, story.slug)}>
                                             <FaEdit className='hover:scale-[120%] text-dark_2 dark:text-light_1 transition-transform duration-200 ease-in-out'/>
                                          </button>
                                       }
                                       <button onClick={(e) => handleDeleteStory(e, story.slug)}>
                                          <FaTrashAlt className='hover:scale-[120%] text-red-600 transition-transform duration-200 ease-in-out'/>
                                       </button>
                                    </div>
                                 </div>
                              </Link>
                           )
                     })
                  :
                     <div className='flex flex-1 items-center justify-center'>
                        <img 
                           src="/empty_folder.svg" 
                           alt="nothing here" 
                           className='w-[45%]'   
                        />
                     </div>
               }
            </ul>
         </div>

         <ul className='flex items-center justify-center gap-5'>
            {pages.map((page) => {
               return (
                  <Link href={`/your-stories/${page}`} key={page}>
                     <button 
                     className={`${page === status ? 'text-dark_2 dark:text-light_2' : 'text-dark_2/[65%] dark:text-light_2/[65%]'} text-sm font-semibold transition duration-200 ease-in-out`}
                     >
                        {page}
                     </button>
                  </Link>
               )
            })}
         </ul>
      </div>
   )
}

export default StoriesListing