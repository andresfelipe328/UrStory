
import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import { GetServerSidePropsContext } from 'next'

import {verifyIdToken} from '../../../config/firebaseAdmin'
import { collection, query, where, getDocs } from "firebase/firestore"
import {db} from '../../../config/firebase'
import nookies from 'nookies'
import { useAuth } from '../../../context/AuthContext'
import { useQuill } from 'react-quilljs'
import StoryOverview from '../../../components/StoryOverview'

import { handleReadingTime } from '../../../utils/helperFuncts'
import {modules, formats, theme} from '../../../utils/richTextBox'
import 'quill/dist/quill.snow.css';

import { FaTimes } from 'react-icons/fa'
import { AiFillSave } from 'react-icons/ai'

import {gsap} from 'gsap'

interface Props {
  story: string
}

const UnpublishedStory = ({story}: Props) => {
   const {handleStory} = useAuth()
   const [title, setTitle] = useState('')
   const [content, setContent] = useState('')
   const [prevMainImg, setPrevMainImg] = useState<any>(null)
   const [prevCategory, setPrevCategory] = useState('')
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
      setTitle(JSON.parse(story)[0].title)
      setContent(JSON.parse(story)[0].body)
      setPrevMainImg(JSON.parse(story)[0]!.mainImg)
      setPrevCategory(JSON.parse(story)[0]!.category)
      // eslint-disable-next-line react-hooks/exhaustive-deps
   },[])

   useEffect(() => {
      if (quill) {
         if (content) {
            quill.clipboard.dangerouslyPasteHTML(content);
            setWordCount(quill.getText().split(/\s+/).length - 1)
         }
         quill.on('text-change', (delta, oldDelta, source) => {
            setContent(quill.root.innerHTML)
            setWordCount(quill.getText().split(/\s+/).length - 1)
         })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
         <title>Editing - {title}</title>
         <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div ref={quillBox} className='relative flex flex-col flex-1 w-full text-dark_2 dark:text-light_2 my-4'>
         <div className='flex w-full items-center'>
            <input 
               type="text" 
               placeholder='Title of the Story - between 4-70 characters'
               value={title}
               onChange={(e) => setTitle(e.target.value)}
               className='absolute border border-[#f2b400] w-[70%] -top-[1.5rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-2 text-sm font-semibold text-dark_1 dark:text-light_2'
            />
            <p>{handleReadingTime(wordCount)}</p>
         </div>
         <div ref={quillRef}/>
         
         {
            err ?
               <div className='absolute -bottom-[3.3rem] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-max py-1 px-8 text-sm font-semibold bg-red-600 text-center rounded-md text-light_2 shadow-mdShadow'>
                  <p>{err}</p>
                  <button onClick={() => setErr('')}>
                     <FaTimes className='absolute top-[.5rem] right-1 text-white'/>
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
            prevCategory={prevCategory}
            prevMainImg={prevMainImg}
         />  
      }
   </article>

  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
   ctx.res.setHeader(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=59'
   )
   try {
      const cookies = nookies.get(ctx)
      const token = await verifyIdToken(cookies.token)
      const {name} = token
      const slug = ctx.params!.slug
      const qDrafts = query(collection(db, `users/${name}/stories`), where('slug', '==', slug))
      const qDraftsSnap = await getDocs(qDrafts)
      let drafts:any[] = []
      
      qDraftsSnap.forEach((doc) => {
         drafts.push({...doc.data()})
      });

      return {
         props: {
            story: JSON.stringify(drafts) || JSON.stringify([])
         }
      }

   } catch(err) {
      return {
         props: {
            stories: JSON.stringify([])
         }
      }
   }
}

export default UnpublishedStory