import { useState, useRef, useEffect, SyntheticEvent } from 'react'
import Head from 'next/head'
import { BsCameraFill } from 'react-icons/bs'
import { useAuth } from '../../context/AuthContext'


import { verifyIdToken } from '../../config/firebaseAdmin'
import nookies from 'nookies'

import {resizeImg} from '../../utils/resizeImg'
import {gsap} from 'gsap'

import { FaTimes, FaUser } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { GetServerSidePropsContext } from 'next'
import Image from 'next/image'

const SignUpTwo = () => {
   const [accImg, setAccImg] = useState<any>(null)
   const [username, setUsername] = useState('')
   const [err, setErr] = useState('')

   const {user, finishReg} = useAuth()
   const router = useRouter()

   
   const regBox = useRef(null)
   useEffect(() => {
      gsap.from(regBox.current, {
         duration: 2,
         opacity: 0,
         y: -50,
         ease: "elastic.out(1, 0.5)"
      })
   }, [])
   
   const handleAddFile = (e: any) => {
      e.target.value=""
      setErr('')
   }

   const handleAccImg = (e: SyntheticEvent) => {
      const res = resizeImg(e, 'profile', user.uid, setAccImg)
      if (!res)
         setErr('file error')
   }

   const handleCompleteSignup = async (e: SyntheticEvent) => {
      e.preventDefault()

      try {
         await finishReg(username, accImg)
         router.push('/')
      } catch(err) {
         console.log(err)
      }
      setUsername('')
      setAccImg(null)
   }

   return (
      <article className='flex items-center justify-center flex-1 gap-2'>
         <Head>
            <title>Sign-up</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
         </Head>
         <section className='flex flex-col gap-4 p-10 rounded-md shadow-mdShadow dark:bg-dark_1 bg-authBg' ref={regBox}>
            <h1 className='text-dark_1 dark:text-light_2 text-4xl font-bold uppercase'>
               Account Info
            </h1>
            
            <form className='flex flex-col gap-10 items-center' onSubmit={handleCompleteSignup}>
               <div className='relative w-[7rem] h-[7rem] rounded-full flex items-center justify-center border-2 border-dark_2 dark:border-light_1 transition duration-200 ease-in'>
                  <div className="relative w-[6.5rem] h-[6.5rem] rounded-full overflow-hidden">
                     <Image 
                        src={!accImg ? '/defaultUser.svg' : URL.createObjectURL(accImg)} 
                        alt="default user icon"
                        layout="fill" 
                        objectFit="cover"
                     />
                  </div>
                  <label
                     htmlFor="accImg-input" 
                     className='absolute cursor-pointer bottom-0 -right-[1.5rem] w-[2.5rem] h-[2.5rem] rounded-full flex items-center justify-center bg-dark_2 dark:bg-light_1 transition duration-200 ease-in'
                  >
                     <BsCameraFill className='img-input text-xl text-light_1 dark:text-dark_1 transition duration-200 ease-in'/>
                  </label>
               </div>

               <input
                  onChange={handleAccImg}
                  onClick={(e) => handleAddFile(e)}
                  type='file'
                  style={{display: 'none'}}
                  id ='accImg-input'
                  required
               />
               <div className='flex flex-row-reverse items-center gap-2 border-b border-light_1 dark:border-dark_2'>
                  <input 
                     type="text" 
                     name='username'
                     placeholder='username'
                     className='peer dark:text-light_1 placeholder:text-dark_2 dark:placeholder:text-light_1 font-semibold placeholder:opacity-60 border-none outline-none bg-transparent'
                     onChange={(e) => setUsername(e.target.value)}
                     value={username}
                  />
                  <FaUser className='peer-focus:scale-150 text-dark_2 dark:text-light_1 transition duration-200 ease-in-out'/>
               </div>
               { err ?
                     <div className='relative w-full bg-red-600 py-2 text-center rounded-md text-light_2 shadow-mdShadow'>
                        <p>{err}</p>
                        <button onClick={() => setErr('')}>
                           <FaTimes className='absolute top-1 right-1 text-white'/>
                        </button>
                     </div>
                  :
                  <button className='w-fit py-1 px-10 font-semibold bg-light_1 dark:bg-dark_2 dark:text-light_2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                     Submit
                  </button>
               }
            </form>
         </section>
      </article>
   )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
   try {
      const cookies = nookies.get(ctx)
      const token = await verifyIdToken(cookies.token)
      const {name} = token
      
      if (!name)
         return {
            props: {
               loggedIn: false,
            }
         }
      else
         return {
            redirect: {destination: '/'}
         }

   } catch(err) {
      return {
         props: {
            loggedIn: false,
         }
      }
   }
}

export default SignUpTwo