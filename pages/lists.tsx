import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import { GetServerSidePropsContext } from 'next'

import StoriesListing from '../components/storyListing/StoriesListing'

import {gsap} from 'gsap'

import {verifyIdToken} from '../config/firebaseAdmin'
import { collection, query, getDocs, onSnapshot } from "firebase/firestore"
import {db} from '../config/firebase'
import nookies from 'nookies'
import { useAuth } from '../context/AuthContext'

interface Props {
   stories: string
}

const Lists = ({stories}: Props) => {
   const {user} = useAuth()
   const [savedList, setSavedList] = useState<any[]>([])
   
   const pageBox = useRef<HTMLHeadingElement>(null)
   // const empty = useRef<HTMLDivElement>(null)
   useEffect(() => {
      gsap.from(pageBox.current!, {
         duration: 1,
         opacity: 0,
         x: -20,
         ease: "elastic.out(1, 0.75)"
      })
   }, [])

   useEffect(() => {
      const qSaved = query(collection(db, `users/${user.displayName}/saved`));
      onSnapshot(qSaved, (querySnapshot) => {
         const savedList:any[] = [];
         querySnapshot.forEach((doc) => {
            savedList.push(doc.data());
         });
         setSavedList(savedList)
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   return (
      <article className='flex flex-1 gap-5 flex-col'>
         <Head>
            <title>Your lists</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
         </Head>
         <h1 ref={pageBox}>Saved Stories</h1>
         <StoriesListing
            stories={savedList}
            mode={'savedList'}
         />
         {/* <div className='flex flex-1 items-center justify-center' ref={empty}>
            <img 
               src="/empty_folder.svg" 
               alt="nothing here" 
               className='w-[45%]'   
            />
         </div> */}
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
      const qSavedRef = query(collection(db, `users/${name}/saved`))
      const qSavedsSnap = await getDocs(qSavedRef)
      let savedStories:any[] = []
      
      qSavedsSnap.forEach((doc) => {
         savedStories.push({...doc.data()})
      });

      return {
         props: {
            stories: JSON.stringify(savedStories) || JSON.stringify([])
         }
      }

   } catch(err) {
      console.log(err)
      return {
         redirect: {destination: '/login'}
      }
   }
}

export default Lists