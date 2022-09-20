import {useEffect, useState, useRef} from 'react'
import Head from 'next/head'

import { useRouter } from 'next/router'
import { Post } from '../../typings'

import gsap from 'gsap'
import {db} from '../../config/firebase'
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { GetServerSidePropsContext } from 'next'

import StoriesListing from '../../components/storyListing/StoriesListing'

interface Props {
   stories: string
}

const SearchResults = ({stories}: Props) => {
   const [searchList, setSearchList] = useState([])
   const router = useRouter()
   const {search} = router.query

   const pageBox = useRef<HTMLHeadingElement>(null)
   const empty = useRef<HTMLDivElement>(null)
   useEffect(() => {
      const storiesList = JSON.parse(stories)
      setSearchList(storiesList)

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
   },[])

   return (
      <article className='flex flex-1 flex-col gap-2'>
         <Head>
         <title>Search - {search}</title>
         <meta name="viewport" content="initial-scale=1.0, width=device-width" />
         </Head>
         <h1 ref={pageBox}>Search Results - {search}</h1>
         {searchList.length > 0 
            ?
               <StoriesListing
                  stories={searchList}
               />
            :
            <div className='flex flex-1 items-center justify-center' ref={empty}>
               <img 
                  src="/empty_folder.svg" 
                  alt="nothing here" 
                  className='w-[45%]'   
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
      const search = ctx.params!.search
      const qSearch = query(collection(db, `publicStories`), where('searchFilter', 'array-contains', search))
      const qSearchSnap = await getDocs(qSearch)
      let searchList:any[] = []
     
      qSearchSnap.forEach((doc) => {
         searchList.push({...doc.data()})
      });
 
      return {
         props: {
            stories: JSON.stringify(searchList) || JSON.stringify([])
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

export default SearchResults