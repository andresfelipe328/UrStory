import { ThemeProvider } from 'next-themes'
import { AuthContextProvider } from '../context/AuthContext'

import Footer from './universal/Footer'
import Navbar from './universal/Navbar'

const Layout = ({children}:any) => {

   return (
         <ThemeProvider attribute='class'>
            <AuthContextProvider>
               <main className='flex min-h-screen flex-col items-center justify-center p-2 transition duration-200 ease-in dark:bg-dark_1'>
                  <Navbar/>
                  <section className='flex-1 max-w-7xl flex flex-col w-full mt-[102px] mb-[84px] px-2'>
                     {children}
                  </section>
                  <Footer/>
               </main>
            </AuthContextProvider>
         </ThemeProvider>
      
   )
}

export default Layout