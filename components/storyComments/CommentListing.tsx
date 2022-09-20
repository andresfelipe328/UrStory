import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { FaTrashAlt,FaReply } from 'react-icons/fa'
import {Comment as CommentAttr} from '../../typings'
import ReplyComment from './ReplyComment'
import Comment from './Comment'

interface Props {
   // comments: [Comment]
   author: string,
   storyID: string
}

const months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const CommentListing = ({author, storyID}: Props) => {
   const {storyUpdComments} = useAuth()

   return (
      <div className='mt-3'>
         <h2 className='font-semibold text-xl uppercase text-dark_1 dark:text-light_2'>
            Comments
         </h2>

         <ul className='flex flex-col gap-2 mt-3'>
            {storyUpdComments.filter((comment:CommentAttr) =>  comment.replyTo === '').map((comment:CommentAttr) => {
               return (
                  <li key={comment.id} className='relative flex flex-col gap-1 ml-0 border-b-[.1rem] border-dark_2/[.30] dark:border-light_1/[.30] p-2'>
                     <Comment
                        storyID={storyID}
                        author={author}
                        comment={comment}
                     />
                  </li>
               )
            })}
         </ul>
      </div>
   )
}

export default CommentListing