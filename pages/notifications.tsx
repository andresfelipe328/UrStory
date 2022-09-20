import Head from 'next/head'
import { useRef, useEffect, SyntheticEvent } from 'react'

import gsap from 'gsap'

import { useAuth } from '../context/AuthContext'
import Link from 'next/link'

import { FaTrashAlt, FaBell } from 'react-icons/fa'
import Image from 'next/image'

const months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const Notifications = () => {
   const {notifications, removeNotification, seeNotification } = useAuth()

   const pageTitle = useRef<HTMLHeadingElement>(null)
   const listBox = useRef<HTMLUListElement>(null)
   useEffect(() => {
      gsap.from(pageTitle.current!, {
         duration: 1,
         opacity: 0,
         x: -20,
         ease: "elastic.out(1, 0.75)"
      })
      gsap.from(listBox.current!, {
         duration: 1,
         delay: .4,
         opacity: 0,
         y: 20,
         stagger: .2,
         ease: "elastic.out(1, 0.75)"
      })
   }, [])

   const modifyDate = (timestamp:any) => {
      const date = new Date(timestamp.seconds*1000 + timestamp.nanoseconds/100000)
      
      const newDate = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${date.toLocaleString('en-US', {
         hour: '2-digit',
         minute: '2-digit',
      })}`
      
      return <small className='text-dark_2 dark:text-light_1 font-medium opacity-70'>Published: {newDate}</small>
   }

   const handleRemoveNotification = async (e:SyntheticEvent, story:any) => {
      e.stopPropagation()
      await removeNotification(story)
   }

   const handleSeenNotification = async (e:SyntheticEvent, slug:string) => {
      e.stopPropagation()
      await seeNotification(slug)
   }

   return (
      <article className='flex flex-1 flex-col gap-4'>
         <Head>
            <title>Notifications</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
         </Head>
         <h1 ref={pageTitle}>Notifications</h1>

         <ul ref={listBox} className='flex flex-1 flex-col gap-10 w-full'>
            { notifications.length !== 0 
               ?
                  notifications.map((story:any) => {
                        return (
                           <Link href={`/story/${story.slug}`} key={story.slug}>
                              <div className='relative flex items-end border-b-[1px] border-dark_1/[30%] dark:border-light_2/[30%] px-2 pt-2 rounded-md pb-5 cursor-pointer hover:bg-light_1/[30%] dark:hover:bg-dark_2/[30%] transition duration-200 ease-in-out'>
                                 { !story.seen &&
                                    <button 
                                       onClick={(e) => handleSeenNotification(e, story.slug)}
                                       className='absolute -top-5 right-4 w-10 h-10 rounded-full bg-dark_2 flex items-center justify-center shadow-mdShadow animate-wiggle'
                                    >
                                       <FaBell className='text-[#f2b400]'/>
                                    </button>
                                 }
                                 <div className='flex flex-1 flex-col gap-2'>
                                    <h3 className='uppercase text-dark_2 dark:text-light_1 font-bold'>
                                       {story.title}
                                    </h3>
                                    <div className='flex gap-1 items-end'>
                                       <Link href={`/profile/${story.author}`}>
                                          <div className="rounded-full border-2 border-dark_2 dark:border-light_1 hover:border-dark_1 hover:dark:border-light_2 transition duration-200 ease-in p-px cursor-pointer">
                                             <div className="relative w-[2.5rem] h-[2.5rem] object-cover rounded-full overflow-hidden">   
                                                <Image
                                                   src={story.authorIcon} 
                                                   alt="user icon"
                                                   width="100%" 
                                                   height="100%" 
                                                   layout="fill" 
                                                   objectFit="cover"
                                                />
                                             </div>
                                          </div>
                                       </Link>
                                       <p className='font-semibold'>{story.author}</p>
                                    </div>
                                    {modifyDate(story.timeStamp)}
                                 </div>
                                 <div className='flex items-center gap-2'>
                                    <button onClick={(e) => handleRemoveNotification(e, story)}>
                                       <FaTrashAlt className='hover:scale-[120%] text-red-600 transition-transform duration-200 ease-in-out'/>
                                    </button>
                                 </div>
                              </div>
                           </Link>
                        )
                  })
               :
                  <div className='flex flex-1 items-center justify-center'>
                     <Image 
                        src="/empty_folder.svg" 
                        alt="nothing here" 
                        width={503}
                        height={360}   
                     />
                  </div>
            }
         </ul>
      </article>
   )
}

export default Notifications