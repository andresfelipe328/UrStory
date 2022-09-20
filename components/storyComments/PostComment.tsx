import {useState, SyntheticEvent} from 'react'
import { useAuth } from '../../context/AuthContext'

import {BiLogInCircle} from 'react-icons/bi'
import {IoIosSend} from 'react-icons/io'
import {FaTimes} from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
   storyID: string
}

const PostComment = ({storyID}: Props) => {
   const {postStoryComment, user} = useAuth()
   const [message, setMessage] = useState('')
   const [err, setErr] = useState('')

   const handleCommentSubmit = async (e: SyntheticEvent) => {
      e.preventDefault()
      await postStoryComment(storyID, message)
      setMessage('')
   }

   return (
      <>
         <small className='text-[#f2b400] font-semibold'>Want to share a thought...</small>
         { user ?
               <>
                  <h2 className='font-semibold text-xl uppercase text-dark_1 dark:text-light_2'>
                     Post a Comment
                  </h2>

                  <form className='flex flex-col items-center gap-2 w-full' onSubmit={handleCommentSubmit}>
                     <div className='w-full flex items-center gap-2'>
                        <div className="rounded-full border-2 border-dark_2 dark:border-light_1 p-px">
                           <div className='relative w-8 h-8 rounded-full overflow-hidden'>
                              <Image 
                                 src={user.photoURL} 
                                 alt="user icon" 
                                 layout="fill" 
                                 objectFit="cover"
                              />
                           </div>
                        </div>
                        <p className='font-semibold'>{user.displayName}</p>
                     </div>
                     <textarea 
                        rows={10}
                        placeholder='message'
                        className='w-full border border-dark_2/[.30] dark:border-light_1/[.30] dark:text-light_1 placeholder:text-dark_2/[.60] dark:placeholder:text-light_1/[.60] font-semibold focus:border-[#f2b400] dark:focus:border-[#f2b400]'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                     />
                     {
                        err ?
                           <div className='relative w-full bg-red-600 py-2 text-center rounded-md text-light_2 shadow-mdShadow'>
                              <p>{err}</p>
                              <button onClick={() => setErr('')}>
                                 <FaTimes className='absolute top-1 right-1 text-white'/>
                              </button>
                           </div>
                        :
                           <button className='w-3/5 bg-[#f2b400] py-2 text-dark_2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                              <IoIosSend className='text-xl'/>
                           </button>
                     }
                  </form>
               </>
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
      </>
   )
}

export default PostComment