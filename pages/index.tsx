import { useRef, useEffect, useState, SyntheticEvent } from 'react'
import Image from 'next/image'
import Head from 'next/head'
import StoriesListing from '../components/storyListing/StoriesListing'

import {db} from '../config/firebase'
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { GetServerSidePropsContext } from 'next'

import {gsap} from 'gsap'
import {BiSearchAlt} from 'react-icons/bi'
import { useRouter } from 'next/router'

interface Props {
  stories: string
}

const Home = ({stories}: Props) => {
  const [storytList, setStoryList] = useState([])
  const [search ,setSearch] = useState('')
  const router = useRouter()

  const hero = useRef<HTMLDivElement>(null)
  const searchBar = useRef<HTMLFormElement>(null)
  useEffect(() => {
    setStoryList(JSON.parse(stories))

    const heroChildren = hero.current?.childNodes
    gsap.from([hero.current, heroChildren!, searchBar.current], {
      duration: .8,
      opacity: 0,
      y: -20,
      stagger: .2,
      ease: "elastic.out(1, 0.75)"
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = (e: SyntheticEvent) => {
    e.preventDefault()
    router.push(`/search/${search}`)
  }

  return (
    <article className='flex flex-1 flex-col gap-2'>
      <Head>
        <title>Home</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className='bg-yellow-400 p-6 flex items-center font-serif border-double border-4 border-dark_1' ref={hero}>
        <div>
          <h1 className='text-5xl text-dark_1 dark:text-dark_1'>
            <span className='text-8xl font-bold'>U</span><span className='text-4xl font-bold'>r</span>Story is a place to write, read, and connect
          </h1>
          <h2 className='text-[1rem] text-dark_1 dark:text-dark_1'>
            Through an easy and free process, you can share your knowledge and opinions on any topic to millions of readers around the world.
          </h2>
        </div>
      </div>

      <form className='my-2 w-full flex justify-center' onSubmit={handleSearch} ref={searchBar}>
        <div className='flex items-center rounded-md border-2 border-[#f2b400]/[.6] w-[75%]'>
          <input 
            type="text"
            onChange={(e) => setSearch(e.target.value.toLowerCase())}
            placeholder='search'
            className='flex-1 dark:text-light_1 placeholder:text-dark_2 dark:placeholder:text-light_1 font-semibold placeholder:opacity-60 border-none' 
          />
          <button className='p-2'>
            <BiSearchAlt className='text-xl text-dark_2/[.85] dark:text-light_1/[.85] hover:scale-[120%] transition-transform duration-200 ease-in-out'/>
          </button>
        </div>
      </form>

      <StoriesListing
        stories={storytList}
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
    const qDrafts = query(collection(db, `publicStories`), orderBy('timeStamp', "desc"))
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
    return {
      props: {
          stories: JSON.stringify([])
      }
    }
  }
}

export default Home