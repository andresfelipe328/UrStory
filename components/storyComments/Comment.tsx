
import Image from 'next/image'
import { useState } from 'react'
import { FaReply, FaTrashAlt } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'

import {Comment as CommentAttr} from '../../typings'
import ReplyComment from './ReplyComment'

interface Props {
   storyID: string,
   author: string,
   comment: CommentAttr
}

const months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const Comment = ({storyID, author, comment}: Props) => {
   const {user, storyUpdComments, deleteStoryComment} = useAuth()
   const [reply, setReply] = useState(false)
   const [replyTo, setReplyTo] = useState('')

   const modifyDate = (timeStamp: any) => {
      const date = new Date(timeStamp.seconds*1000 + timeStamp.nanoseconds/100000)
      const newDate = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} at ${date.toLocaleString('en-US', {
         hour: '2-digit',
         minute: '2-digit',
      })}`
      
      return (
         <small className='text-dark_2 dark:text-light_1 font-semibold opacity-60 right-2'>{newDate}</small>
      )
   }

   const handleReply = (commentID: string) => {
      setReplyTo(commentID)
      setReply(!reply)
   }

   const handleCommentDelete = async (comment: string) => {
      await deleteStoryComment(comment, storyID)
   }

   return (
      <>
         <div className='flex items-center gap-2'>
            <div className="rounded-full border-2 border-dark_2 dark:border-light_1 p-px">
               <div className='relative w-8 h-8 rounded-full overflow-hidden'>
                  <Image 
                     src={comment.authorIcon} 
                     alt="user icon" 
                     width="100%" 
                     height="100%" 
                     layout="fill" 
                     objectFit="cover"
                  />
               </div>
            </div>
            <div className='flex flex-col gap-1'>
               <h4 className="font-semibold">
                  {comment.author} {comment.author === author && <span className='py-1 px-3 bg-[#f2b400] text-dark_2 text-sm rounded-md shadow-xsShadow'>Author</span>}
               </h4>
               {modifyDate(comment.timeStamp)}
            </div>
         </div>
         <p className="px-4 text-dark_2 dark:text-light_1 font-medium">{comment.message}</p>
         { comment.author === user?.displayName ?
               <>
                  {user && <button className='absolute right-1 top-8' onClick={() => handleReply(comment.id)}>
                     <FaReply className='text-[.85rem] hover:scale-[120%] text-dark_2 dark:text-light_1 transition-transform duration-200 ease-in-out'/>
                  </button>}
                  <button className='absolute right-1 top-2' onClick={() => handleCommentDelete(comment.id)}>
                     <FaTrashAlt className='text-[.85rem] hover:scale-[120%] text-red-600 transition-transform duration-200 ease-in-out'/>
                  </button>
               </>
            :
               <>
                  {user && <button className='absolute right-1 top-2' onClick={() => handleReply(comment.id)}>
                     <FaReply className='text-[.85rem] hover:scale-[120%] text-dark_2 dark:text-light_1 transition-transform duration-200 ease-in-out'/>
                  </button>}
               </>
         }
         {reply && comment.id === replyTo && 
            <ReplyComment 
               commentAuthor={comment.author}
               replyTo={replyTo}
               setReplyTo={setReplyTo}
               setReply={setReply}
               storyID={storyID}
            />
         }
         <ul className='flex flex-col gap-2 mt-3'>
            {storyUpdComments.filter((replyComment:CommentAttr) =>  replyComment.replyTo === comment.id).map((subComment:CommentAttr) => (
               <li key={comment.id} className='relative flex flex-col gap-1 ml-4 p-2 border-l-[.1rem] border-dark_2/[.30] dark:border-light_1/[.30]'>
                  <Comment
                     storyID={storyID}
                     author={author}
                     comment={subComment}
                  />
               </li>
            ))}
         </ul>
      </>
   )
}

export default Comment