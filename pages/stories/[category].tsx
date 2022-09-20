import {useEffect, useState, useRef} from 'react'
import Head from 'next/head'

import { useRouter } from 'next/router'
import { Post } from '../../typings'

import gsap from 'gsap'
import {db} from '../../config/firebase'
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { GetServerSidePropsContext } from 'next'

import StoriesListing from '../../components/storyListing/StoriesListing'
import Image from 'next/image'

interface Props {
   stories: string
}

const CategoryStories = ({stories}: Props) => {
   const [storyList, setStoryList] = useState([])
   const router = useRouter()
   const {category} = router.query

   const pageBox = useRef<HTMLHeadingElement>(null)
   const empty = useRef<HTMLDivElement>(null)
   useEffect(() => {
      const storiesList = JSON.parse(stories)
      setStoryList(storiesList)

      gsap.from(pageBox.current!, {
         duration: 1,
         opacity: 0,
         x: -20,
         ease: "elastic.out(1, 0.75)"
      })

      if (storiesList.length < 1)
         gsap.from(empty.current!, {
            duration: 1,
            opacity: 0,
            y: -20,
            ease: "elastic.out(1, 0.75)"
         })
      // eslint-disable-next-line react-hooks/exhaustive-deps
   },[])

   return (
      <article className='flex flex-1 flex-col gap-2'>
         <Head>
         <title>Category - {category}</title>
         <meta name="viewport" content="initial-scale=1.0, width=device-width" />
         </Head>
         <h1 ref={pageBox}>Search Results - {category}</h1>
         {storyList.length > 0 
            ?
               <StoriesListing
                  stories={storyList}
               />
            :
            <div className='flex flex-1 items-center justify-center' ref={empty}>
               <Image 
                  src="/empty_folder.svg" 
                  alt="nothing here" 
                  width={503}
                  height={360}   
               />
            </div>
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
      const category = ctx.params!.category
      const cSearch = query(collection(db, `publicStories`), where('category', '==', category))
      const cSearchSnap = await getDocs(cSearch)
      let storyList:any[] = []
     
      cSearchSnap.forEach((doc) => {
         storyList.push({...doc.data()})
      });
 
      return {
         props: {
            stories: JSON.stringify(storyList) || JSON.stringify([])
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

export default CategoryStories