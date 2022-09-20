import { useState, useRef, useEffect, SyntheticEvent } from 'react'
import { GetServerSidePropsContext, NextPage } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'

import {gsap} from 'gsap'

import { verifyIdToken } from '../config/firebaseAdmin'
import nookies from 'nookies'

import {FaUser, FaUnlockAlt} from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const Login: NextPage = (session) => {
   const [email, setEmail] = useState('')
   const [pwd, setPwd] = useState('')
   const [err, setErr] = useState('')

   const {login} = useAuth()
   const router = useRouter()

   const loginBox = useRef(null)
   useEffect(() => {
      gsap.from(loginBox.current, {
         duration: 2,
         opacity: 0,
         y: -50,
         ease: "elastic.out(1, 0.5)"
      })
   }, [])

   useEffect(() => {
      setErr('')
   },[email, pwd])

   const handleLogin = async (e: SyntheticEvent) => {
      e.preventDefault()

      try {
         await login(email, pwd)
         router.push('/')
      } catch(err:any) {
         setErr(err.message)
      }
   }

   return (
      <article className='flex items-center justify-center flex-1'>
         <Head>
            <title>Login</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
         </Head>
         <section className='flex flex-col gap-4 p-10 rounded-md shadow-mdShadow dark:bg-dark_1 bg-authBg' ref={loginBox}>
            <h1 className='text-dark_1 dark:text-light_2 text-4xl font-bold uppercase'>
               Login
            </h1>

            <form className='flex flex-col gap-10 items-center' onSubmit={handleLogin}>
               <div className='flex flex-row-reverse items-center gap-2 border-b border-light_1 dark:border-dark_2'>
                  <input 
                     type="email" 
                     name='email'
                     placeholder='email'
                     className='peer dark:text-light_1 placeholder:text-dark_2 dark:placeholder:text-light_1 font-semibold placeholder:opacity-60 border-none'
                     required
                     onChange={(e) => setEmail(e.target.value)}
                  />
                  <FaUser className='peer-focus:scale-150 text-dark_2 dark:text-light_1 transition-transform duration-200 ease-in-out'/>
               </div>

               <div className='flex flex-row-reverse items-center gap-2 border-b border-light_1 dark:border-dark_2'>
                  <input
                     type="password"
                     name="pwd"
                     placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                     className='peer dark:text-light_1 placeholder:text-dark_2 dark:placeholder:text-light_1 font-semibold placeholder:opacity-60 border-none'
                     required
                     onChange={(e) => setPwd(e.target.value)}
                  />
                  <FaUnlockAlt className='peer-focus:scale-150 text-dark_2 dark:text-light_1 transition-transform duration-200 ease-in-out'/>
               </div>

               {err ?
                     <p>{err}</p>
                  :
                     <button className='w-fit py-1 px-10 font-semibold bg-light_1 dark:bg-dark_2 dark:text-light_2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                        Login
                     </button>
               }

               <div className='w-full flex flex-col items-center'>
                  <p className='text-dark_2 dark:text-light_1 font-semibold'>
                     not registered:
                  </p>
                  <Link href='sign-up'>
                     <button className='w-fit py-1 px-10 font-semibold bg-light_1 dark:bg-dark_2 dark:text-light_2 shadow-mdShadow hover:shadow-onHover transition duration-200 ease-in'>
                        Sign Up
                     </button>
                  </Link>
               </div>
            </form>
         </section>
      </article>
   )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
   try {
      const cookies = nookies.get(ctx)
      const token = await verifyIdToken(cookies.token)
      
      return {
         props: {}
      }

   } catch(err) {
      return {
         redirect: {destination: '/'}
      }
   }
}

export default Login