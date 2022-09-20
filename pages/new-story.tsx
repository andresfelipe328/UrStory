import { useEffect, useRef, useState } from 'react'
import Head from 'next/head';
import {modules, formats, theme} from '../utils/richTextBox'
import { useQuill } from 'react-quilljs'
import 'quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
import {handleReadingTime} from '../utils/helperFuncts'

import {gsap} from 'gsap'

import { FaTimes } from 'react-icons/fa';
import { AiFillSave } from 'react-icons/ai';
import StoryOverview from '../components/StoryOverview';

const NewStory = () => {
   const {handleStory} = useAuth()
   const [title, setTitle] = useState('')
   const [content, setContent] = useState('')
   const [overview, setOverview] = useState(false)
   const [wordCount, setWordCount] = useState(0)
   const [err, setErr] = useState('')
   const {quill, quillRef} = useQuill({theme, modules, formats})

   const quillBox = useRef<HTMLDivElement>(null)
   useEffect(() => {
      gsap.from(quillBox.current!, {
         duration: .8,
         y: 35,
         delay: .5,
         opacity: 0,
         ease: "elastic.out(1, 0.75)"
      })
   }, [])

   useEffect(() => {
      if (quill) {
         quill.on('text-change', (delta, oldDelta, source) => {
            setContent(quill.root.innerHTML)
            setWordCount(quill.getText().split(/\s+/).length - 1)
         })
      }
   }, [quill])

   const handleOpenOverview = () => {
      if (title && quill!.getText().split(/\s+/).length - 1 > 1)
         setOverview(!overview)
      else
         setErr(`${!title && !content ? 'title and body are ' : title ? 'body is ' : 'title is ' } missing`)
   }

   const handleSaveStory = async () => {
      if (title || content) {
         await handleStory(title, content, 'unpublished', wordCount)
      }
      else
         setErr(`at least one field is needed to save`)
   }

   return (
      <article className='relative flex flex-1'>
         <Head>
            <title>New story</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
         </Head>
         <div ref={quillBox} className='relative flex flex-col flex-1 w-full my-4'>
            <div className='flex w-full items-center'>
               <input 
                  type="text" 
                  placeholder='Title of the Story - between 4-70 characters'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className='absolute border border-[#f2b400] w-[70%] -top-[1.5rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-2 text-sm font-semibold text-dark_1 dark:text-light_2'
               />
               <p className='font-semibold'>Reading Time: {handleReadingTime(wordCount)}</p>
            </div>

            <div ref={quillRef} />
            
            {
               err ?
                  <div className='absolute -bottom-[3.3rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-max py-1 px-8 text-sm font-semibold bg-red-600 text-center rounded-md text-light_2 shadow-mdShadow'>
                     <p className='text-light_2'>{err}</p>
                     <button onClick={() => setErr('')}>
                        <FaTimes className='absolute top-[.45rem] right-1 text-white'/>
                     </button>
                  </div>
               :
               <div className='absolute -bottom-[3.3rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-5'>
                  <button className='w-fit py-1 px-8 text-sm font-semibold bg-[#f2b400] shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in' type='button' onClick={handleOpenOverview}>
                     publish
                  </button>
                  <button className='w-fit py-[.25rem] px-[.5rem] text-lg font-semibold bg-[#f2b400] shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in' type='button' onClick={handleSaveStory}>
                     <AiFillSave className='text-dark_2'/>
                  </button>
               </div>
            }
         </div>
         {
            overview && 
            <StoryOverview
               title={title}
               content={content}
               overview={overview}
               wordCount={wordCount}
               setOverview={setOverview}
            />  
         }
      </article>
   )
}

export default NewStory