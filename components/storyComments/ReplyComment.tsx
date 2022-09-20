import { SyntheticEvent, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { IoIosSend } from 'react-icons/io'
import { useAuth } from '../../context/AuthContext'

interface Props {
   commentAuthor: string,
   replyTo: string,
   setReply: Function,
   setReplyTo: Function,
   storyID: string
}

const ReplyComment = ({commentAuthor, setReply, storyID, replyTo, setReplyTo}: Props) => {
   const {user, postStoryComment} = useAuth()
   const [replyMessage ,setReplyMessage] = useState('')
   const [err, setErr] = useState('')

   const handleReplyCommentSubmit = async (e:SyntheticEvent) => {
      e.preventDefault()
      await postStoryComment(storyID, replyMessage, replyTo)
      setReplyTo('')
      setReplyMessage('')
      setReply(false)
   }

   return (
      <div className='relative flex flex-col items-center gap-2 w-full p-2 ml-2 mr-2'>
         <button className='absolute top-4 right-2' onClick={() => setReply(false)}>
            <FaTimes className='absolute top-1 right-1 text-dark_2 dark:text-light_1'/>
         </button>
         <form className='flex flex-col items-center gap-2 w-full' onSubmit={handleReplyCommentSubmit}>
            <div className='w-full flex items-center gap-2'>
               <div className="rounded-full border-2 border-dark_2 dark:border-light_1 p-px">
                  <img src={user.photoURL} alt="user icon" className="w-7 h-7 object-cover rounded-full "/>
               </div>
               <p className='font-semibold'>{user.displayName}</p>
            </div>
            <textarea 
               rows={6}
               placeholder={`reply to ${commentAuthor}'s comment`}
               className='w-full max-h-[162px] border border-dark_2/[.30] dark:border-light_1/[.30] dark:text-light_1 placeholder:text-dark_2/[.60] dark:placeholder:text-light_1/[.60] font-semibold focus:border-[#f2b400] dark:focus:border-[#f2b400]'
               value={replyMessage}
               onChange={(e) => setReplyMessage(e.target.value)}
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
                  <button className='bg-[#f2b400] w-fit py-2 px-5 text-dark_2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                     <IoIosSend className='text-[.95rem]'/>
                  </button>
            }
         </form>
      </div>
   )
}

export default ReplyComment