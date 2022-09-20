import React, { useEffect, useRef, useState } from 'react'
import { GetServerSidePropsContext } from 'next'

import {verifyIdToken} from '../../config/firebaseAdmin'
import { collection, query, where, getDocs, orderBy, onSnapshot } from "firebase/firestore"
import {db} from '../../config/firebase'
import nookies from 'nookies'
import StoriesListing from '../../components/yourStories/StoriesListing'
import Head from 'next/head'
import { useAuth } from '../../context/AuthContext'
import gsap from 'gsap'

interface Props {
   stories: string
}

const StoriesUnpublished = ({stories}: Props) => {
   const {user} = useAuth()
   const [yourStories, setYourStories] = useState<any[]>([])

   const pageBox = useRef<HTMLHeadingElement>(null)
   useEffect(() => {
      gsap.from(pageBox.current!, {
         duration: 1,
         opacity: 0,
         x: -20,
         ease: "elastic.out(1, 0.75)"
      })
   },[])

   useEffect(() => {
      const qStories = query(collection(db, `users/${user.displayName}/stories`), orderBy('timeStamp', "desc"));
         onSnapshot(qStories, (querySnapshot) => {
            const storyList:any[] = [];
            querySnapshot.forEach((doc) => {
               storyList.push(doc.data());
            });
            setYourStories(storyList)
         });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])

   return (
      <article className='flex flex-1 flex-col gap-10 px-3'>
         <Head>
            <title>Your stories - Unpublished</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
         </Head>
         <h2 ref={pageBox} className='text-3xl font-bold uppercase text-dark_1 dark:text-light_2'>
            Unpublished
         </h2>
         <StoriesListing
            status='unpublished'
            list={yourStories}
         />
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
      const qDrafts = query(collection(db, `users/${name}/stories`), where('status', '==', 'unpublished'), orderBy('timeStamp', "desc"))
      const qDraftsSnap = await getDocs(qDrafts)
      let drafts:any[] = []
      
      qDraftsSnap.forEach((doc) => {
         drafts.push({...doc.data()})
      });

      return {
         props: {
            stories: JSON.stringify(drafts) || JSON.stringify([])
         }
      }

   } catch(err) {
      console.log(err)
      return {
         props: {
            stories: JSON.stringify([])
         }
      }
   }
}

export default StoriesUnpublished