import { useState, useRef, useEffect, SyntheticEvent } from 'react'
import { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../../context/AuthContext'

import { verifyIdToken } from '../../config/firebaseAdmin'
import nookies from 'nookies'

import {gsap} from 'gsap'

import {FaUser, FaUnlockAlt} from 'react-icons/fa'
import {MdEmail} from 'react-icons/md'
import { match } from 'assert'

const SignUp: NextPage = () => {
   const [email, setEmail] = useState('')
   const [pdw, setPwd] = useState('')
   const [confirmPdw, setConfirmPwd] = useState('')
   const [err, setErr] = useState('')

   const {signup} = useAuth()
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

   useEffect(() => {
      setErr('')
   },  [email, pdw, confirmPdw])

   const handleSignup = async (e: SyntheticEvent) => {
      e.preventDefault()

      if (pdw !== confirmPdw) {
         setErr("passwords don't match")
         return
      }

      try {
         await signup(email, pdw)
         setEmail('')
         setPwd('')
         setConfirmPwd('')
         router.push('sign-up/part-two')
      } catch(err) {
         console.log(err)
      }
   }

   return (
      <article className='flex items-center justify-center flex-1' onSubmit={handleSignup}>
         <Head>
            <title>Sign-up</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
         </Head>
         <section className='flex flex-col gap-4 p-10 rounded-md shadow-mdShadow dark:bg-dark_1 bg-authBg' ref={regBox}>
            <h1 className='text-dark_1 dark:text-light_2 text-4xl font-bold uppercase'>
               Sign Up
            </h1>

            <form className='flex flex-col gap-10 items-center'>
               <div className='flex flex-row-reverse items-center gap-2 border-b border-light_1 dark:border-dark_2'>
                  <input 
                     type="email" 
                     name='email'
                     placeholder='email'
                     className='peer dark:text-light_1 placeholder:text-dark_2 dark:placeholder:text-light_1 font-semibold placeholder:opacity-60 border-none outline-none bg-transparent'
                     onChange={(e) => setEmail(e.target.value)}
                  />
                  <MdEmail className='peer-focus:scale-150 text-dark_2 dark:text-light_1 transition-transform duration-200 ease-in-out'/>
               </div>

               <div className='flex flex-row-reverse items-center gap-2 border-b border-light_1 dark:border-dark_2'>
                  <input
                     type="password"
                     name="pwd"
                     placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                     className='peer dark:text-light_1 placeholder:text-dark_2 dark:placeholder:text-light_1 font-semibold placeholder:opacity-60 border-none outline-none bg-transparent'
                     onChange={(e) => setPwd(e.target.value)}
                  />
                  <FaUnlockAlt className='peer-focus:scale-150 text-dark_2 dark:text-light_1 transition-transform duration-200 ease-in-out'/>
               </div>
               
               <div className='flex flex-row-reverse items-center gap-2 border-b border-light_1 dark:border-dark_2'>
                  <input
                     type="password"
                     name="pwd"
                     placeholder="confirm password"
                     className='peer dark:text-light_1 placeholder:text-dark_2 dark:placeholder:text-light_1 font-semibold placeholder:opacity-60 border-none outline-none bg-transparent'
                     onChange={(e) => setConfirmPwd(e.target.value)}
                  />
                  <FaUnlockAlt className='peer-focus:scale-150 text-dark_2 dark:text-light_1 transition-transform duration-200 ease-in-out'/>
               </div>
               { err ?
                     <p>{err}</p>
                  :
                     <button className='w-fit py-1 px-10 font-semibold bg-light_1 dark:bg-dark_2 dark:text-light_2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                        Sign Up
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
      
      if (token && !name)
         return {
            redirect: {destination: '/sign-up/part-two'}
         }

   } catch(err) {
      return {
         redirect: {destination: '/'}
      }
   }
}

export default SignUp