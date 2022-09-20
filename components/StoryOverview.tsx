import { useState, useEffect, useRef, SyntheticEvent } from 'react'

import { useAuth } from '../context/AuthContext'
import { resizeImg } from '../utils/resizeImg'
import {handleReadingTime} from '../utils/helperFuncts'

import {gsap} from 'gsap'

import { BsCameraFill } from 'react-icons/bs'
import { FaTimes } from 'react-icons/fa'
import CircleLoader from 'react-spinners/CircleLoader'
import Image from 'next/image'


interface Props {
   title: string,
   content: string,
   wordCount: number,
   overview: boolean,
   setOverview: Function,
   prevCategory?:string,
   prevMainImg?:string
}

const StoryOverview = ({title, content, overview, wordCount, setOverview, prevCategory, prevMainImg}: Props) => {
   const [storyImg, setStoryImg] = useState<any>(null)
   const [category, setCategory] = useState('')
   const [loading, setLoading] = useState(false)
   const [err, setErr] = useState('')

   const {handleStory} = useAuth()

   const overlay = useRef<HTMLDivElement>(null)
   useEffect(() => {
      if (prevCategory)
         setCategory(prevCategory)
      
      if (overview)
         gsap.from(overlay.current!, {
            duration: .8,
            y: 35,
            opacity: 0,
            ease: "elastic.out(1, 0.75)"
         })
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [overview])

   const handleCloseOverview = () => {
      setStoryImg(null)
      setOverview(!overview)
   }

   const handleAddFile = (e: any) => {
      e.target.value=""
      setErr('')
   }

   const handleStoryImg = (e: SyntheticEvent) => {
      const res = resizeImg(e, 'story', title, setStoryImg)
      if (!res)
         setErr('file error')
   }

   const handleSubmitStory = async () => {
      if ((!storyImg || !category) && (!prevCategory || !prevMainImg))
         setErr('fill out all fields')
      else {
         setLoading(!loading)
         await handleStory(title, content, 'published', wordCount, storyImg || prevMainImg, category.toLowerCase())
         setLoading(!loading)
         setOverview(!overview)
      }
   }

   return (
      <div className='absolute flex items-center justify-center w-full h-full rounded-md bg-light_1/[.95] dark:bg-dark_2/[.95]' ref={overlay}>
         <div className='relative w-[425px] mx-4 py-8 px-10 shadow-xsShadow rounded-md flex flex-col items-center gap-4 bg-light_1 dark:bg-dark_2'>
            <button onClick={handleCloseOverview}>
               <FaTimes className='absolute top-1 right-1 text-dark_2 dark:text-light_1'/>
            </button>
            <h2>story overview:</h2>
            <div className='w-full flex flex-col gap-1 items-center'>
               <p className='font-semibold'>Add main image:</p>
               <div className='relative w-full rounded-md'>
                  <div className='relative h-48 w-full'>
                     <Image 
                        src={prevMainImg && !storyImg ? prevMainImg : !storyImg ? '/defaultImg.svg' : URL.createObjectURL(storyImg)}
                        alt="user icon" 
                        width="100%" 
                        height="100%" 
                        layout="fill" 
                        objectFit="cover"
                     />
                  </div>
                  <label
                     htmlFor="accImg-input" 
                     className='absolute cursor-pointer -bottom-[.5rem] -right-[1.25rem] w-[2.5rem] h-[2.5rem] rounded-md flex items-center justify-center bg-dark_2 dark:bg-light_1 transition duration-200 ease-in'
                  >
                     <BsCameraFill className='img-input text-xl text-light_1 dark:text-dark_1 transition duration-200 ease-in'/>
                  </label>
               </div>
               <input
                  type='file'
                  onChange={handleStoryImg}
                  onClick={(e) => handleAddFile(e)}
                  style={{display: 'none'}}
                  id ='accImg-input'
               />
            </div>
            <input 
               type="text"
               value={prevCategory && prevCategory}
               placeholder='main category'
               className='w-full border border-dark_2/[.30] dark:border-light_1/[.30] dark:text-light_1 placeholder:text-dark_2 dark:placeholder:text-light_1 font-semibold placeholder:opacity-60 focus:border-[#f2b400] dark:focus:border-[#f2b400]'
               onChange={(e) => setCategory(e.target.value)}
            />
            <p className='font-semibold'>Reading Time: {handleReadingTime(wordCount)}</p>
            {
               err ?
                  <div className='relative w-max py-1 px-8 text-sm font-semibold bg-red-600 text-center rounded-md text-light_2 shadow-mdShadow'>
                     <p className='text-light_2'>{err}</p>
                     <button onClick={() => setErr('')}>
                        <FaTimes className='absolute top-[.45rem] right-1 text-white'/>
                     </button>
                  </div>
               :
                  loading ?
                     <CircleLoader
                        color='#CC5500'
                     />
                  :
                     <button className='w-fit py-1 px-8 text-sm font-semibold bg-[#f2b400] shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in' type='button' onClick={handleSubmitStory}>
                        publish
                     </button>
            }
         </div>
      </div> 
  )
}

export default StoryOverview