import {createContext, useContext, useEffect, useState} from 'react'
import {onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile} from 'firebase/auth'
import {auth, db, storage} from '../config/firebase'
import {doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion, Timestamp, onSnapshot, arrayRemove, deleteDoc, collection, query, getDocs, orderBy, where} from 'firebase/firestore';
import {ref, uploadBytes, getDownloadURL, getStorage, deleteObject, listAll} from 'firebase/storage'

import nookies from 'nookies'
import {v4 as uuidv4} from 'uuid'
import { useRouter } from 'next/router';

const AuthContext = createContext<any>({})

export const useAuth = () => useContext(AuthContext)

export const AuthContextProvider = ({children}: {children: React.ReactNode}) => {
   const [user, setUser] = useState<any>(null)
   const [storyUpdComments, setStoryUpdComments] = useState([])
   const [updLikes, setUpdLikes] = useState([])
   const [notifications, setNotifications] = useState<any[]>([])
   const [notify, setNotify] = useState(false)
   const [loading, setLoading] = useState<boolean>(true)
   const router = useRouter()

   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
         if (user) {
            setUser({
               uid: user.uid,
               email: user.email,
               displayName: user.displayName,
               photoURL: user.photoURL
            })
            const token = await user.getIdToken();
            nookies.set(undefined, 'token', token, { path: '/' })

            // Listen for notifications
            if (user.displayName) {
               const followingsRef = query(collection(db, `users/${user.displayName}`, 'followings'))
               const followingSnap = await getDocs(followingsRef)
               const docNotifyRef = doc(db, `users/${user.displayName}/notificationDoc`, 'notifications')
               const docNotifySnap = await getDoc(docNotifyRef)
               const currentTimeStamp = new Date()
   
               followingSnap.forEach((doc) => {
                  if (doc.data().notify) {
                     const followingUser = doc.data().username
                     const followingRef = query(collection(db, `users/${followingUser}`, 'stories'))
                     onSnapshot(followingRef, (followingSnap) => {
                        followingSnap.forEach(async (doc) => {
                           const date = new Date(doc.data().timeStamp?.seconds*1000 + doc.data().timeStamp?.nanoseconds/100000)
                           if (currentTimeStamp < date) {
                              const newNotification = {
                                 title: doc.data().title,
                                 slug: doc.data().slug,
                                 author: doc.data().author,
                                 authorIcon: doc.data().authorIcon,
                                 category: doc.data().category,
                                 timeStamp: doc.data().timeStamp,
                                 wordCount: doc.data().wordCount,
                                 seen: false
                              }
                              if (!docNotifySnap.exists()) {
                                 await setDoc(docNotifyRef, {
                                    userID: user.uid,
                                    notifications: [newNotification]
                                 })
                              }
                              else {
                                 if (!docNotifySnap.data().notifications.find((notification:any) => notification.slug === newNotification.slug))
                                    await updateDoc(docNotifyRef, {
                                       notifications: arrayUnion(newNotification)
                                    })
                              }
                           }
                        })
                     })
                  }
               })
   
               onSnapshot(docNotifyRef, (doc) => {
                  if (doc.exists()) {
                     const notifications = doc.data().notifications
                     setNotifications(notifications)
   
                     if (notifications.find((notification:any) => notification.seen == false))
                        setNotify(true)
                     else
                        setNotify(false)
                  }
               })
            }
         }
         else {
            setUser(null)
            nookies.set(undefined, 'token', '', { path: '/' })
         }
         
         setLoading(false)
      })

      return () => unsubscribe()
   }, [])

   // Authentication ==============================================================================
   const signup = (email: string, password: string) => {
      return createUserWithEmailAndPassword(auth, email, password)
   }

   const login = (email: string, password: string) => {
      return signInWithEmailAndPassword(auth, email, password)
   }

   const logout = async () => {
      setUser(null)
      await signOut(auth)
   }

   const checkUsername = async (username:string) => {
      const docRef = doc(db, "users", username)
      const docSnap = await getDoc(docRef)
  
      if (docSnap.exists()) {
        return {
          status: false,
          message: "Username already taken"
        }
      }
      else {
        try {
            await setDoc(doc(db, "users", username), {
               userID: auth.currentUser!.uid,
               about: 'This is my about me'
            })
            await updateProfile(auth.currentUser!, {
               displayName: username
            })
            setUser(auth.currentUser)
            return {
               status: true,
               message: "success"
            }
         } catch(err) {
            console.log('CheckUsername: ', err)
         }
      }
   }

   const updateUserImg = async (username:string, file:File) => {
      let fileName = `users/${username}/${file.name}`
      const storageRef = ref(storage, fileName)
      
      try {
         await uploadBytes(storageRef, file).then( async (snapshot) => {
            await getDownloadURL(snapshot.ref)
            .then( async (imageUrl) => {
               await updateProfile(auth.currentUser!, {
                  photoURL: imageUrl
               })
               const docRef = doc(db, "users", username)
               await updateDoc(docRef, {
                  userIcon: imageUrl
               });
          })
        });
    
        return {
          status: true,
          message: "success"
        }
      } catch(err) {
        console.log('UpdateUserImg: ', err)
      }
   }

   const finishReg = async (username:string, file:File) => {
      try {
         const res = await checkUsername(username)
         
         if (res!.status) {
            await updateUserImg(username, file)
         }
         
      }catch(err) {
         console.log(err)
      }

   }

   const updateAbout = async (username:string, about:string) => {
      const docRef = doc(db, "users", username)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
         try {
            await updateDoc(docRef, {
               about
            })
         } catch(err) {
            console.log('UpdateAbout: ', err)
         }
      }
   }
   // End of Authentication =======================================================================


   // Story Making ================================================================================
   const createPublicStory = async (story:any) => {
      const docRef = doc(db, `publicStories/`, story.slug)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
         try {
            await setDoc(docRef, story)
         } catch(err) {
            console.log('SubmitStory: ', err)
         }
      }
      else {
         try {
            await updateDoc(docRef, story)
         } catch(err) {
            console.log('SubmitStory: ', err)
         }
      }
   }

   const updateStoryImg = async (file:any, slug:string) => {
      let fileName = `stories/${slug}/${file.name}`
      const storageRef = ref(storage, fileName)
      let url = ''

      try {
         await uploadBytes(storageRef, file).then( async (snapshot) => {
            url = await getDownloadURL(snapshot.ref)
         });
         return url
      } catch(err) {
      console.log('UpdateUserServerImg: ', err)
      }
   }

   const handleStory = async (title:string, body:string, mode:string, wordCount:number, storyImg=null, category='none') => {
      const slug = title.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
      const searchFilter = slug.split('-')
      const docRef = doc(db, `users/${user.displayName}/stories`, slug)
      const docSnap = await getDoc(docRef)

      if (category !== 'none')
         searchFilter.push(...category.split(' '))

      const story = {
         author: user.displayName,
         authorID: user.uid,
         authorIcon: user.photoURL,
         wordCount: wordCount,
         category: category !== 'none' ? category : '',
         mainImg: mode === 'published' ? typeof storyImg === 'string' ? storyImg 
            : await updateStoryImg(storyImg, slug) : '',
         title: title,
         slug: slug,
         searchFilter,
         body: body,
         status: mode,
         likes: [],
         timeStamp: serverTimestamp()
      }
      
      if (mode === 'published') {
         await createPublicStory(story)
      }

      if (docSnap.exists()) {
         try {
            await updateDoc(docRef, story)
         } catch(err) {
            console.log('SubmitStory: ', err)
         }
      }
      else {
         try {
            await setDoc(docRef, story)
         } catch(err) {
            console.log('SubmitStory: ', err)
         }
      }
   }

   const deleteYourStory = async (slug:string, status:string) => {
      const docRef = doc(db, `users/${user.displayName}/stories`, slug)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
         try {
            const title = docSnap.data().title.replace(/\s/g, '')
            const slug = docSnap.data().slug

            await deleteStoryMainImg(title, slug)
            await deleteDoc(docRef)
            if (status = 'published') {
               const docPublishedRef = doc(db, 'publicStories', slug)
               const docPublishedSnap = await getDoc(docPublishedRef)
               
               if (docPublishedSnap.exists()) 
                  await deleteDoc(docPublishedRef) 
            }
         } catch(err) {
            console.log('DeleteYourStory', err)
         }
      }
      else
         console.log('does not exist')
   }

   const deleteStoryMainImg = async (title:string, slug:string) => {
      const storage = getStorage()
      const storageRef = ref(storage, `stories/${slug}/story_${title}`)

      try {
         await deleteObject(storageRef)
      } catch(err) {
         console.log('DeleteStoryMainImg: ', err)
      }
   }
   // End of Story Making =========================================================================


   // Comment Posting =============================================================================
   const postStoryComment = async (slug:string, message:string, replyTo=null) => {
      const docRef = doc(db, `publicStories/${slug}/storyComments`, 'commentsList')
      const docSnap = await getDoc(docRef)
      const id = uuidv4()
      const newComment = {
         id,
         replyTo: replyTo || '',
         author: user.displayName,
         authorIcon: user.photoURL,
         message,
         timeStamp: Timestamp.now()
      }

      if (docSnap.exists()) {
         await updateDoc(docRef, {
            comments: arrayUnion(newComment)
         })
      } 
      else {
         try {
            await setDoc(docRef, {
               comments: [newComment]
            })
         } catch(err) {
            console.log('SubmitStory: ', err)
         }
      }
   }

   const deleteStoryComment = async (messageID:string, slug:string) => {
      const docRef = doc(db, `publicStories/${slug}/storyComments`, 'commentsList')
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
         const prevComments = docSnap.data().comments
         const tmpComments = prevComments.filter((comment:any) => comment.id !== messageID)

         await updateDoc(docRef, {
            comments: tmpComments
         })
      }
   } 

   useEffect(() => {
      const path = router.asPath
      const slug = path.substring(path.lastIndexOf('/') + 1)
      let unsubscribe:any = null

      if (path.includes('/story')) {
         unsubscribe = onSnapshot(doc(db, `publicStories/${slug}/storyComments`, 'commentsList'), (doc) => {
            if (doc.exists()) {
               console.log('listened for comments')
               setStoryUpdComments(doc.data().comments)
            }
         })
      }

      // return() => {
      //    unsubscribe()
      // }
   }, [router.asPath])
   // End of Comment Posting ======================================================================


   // Likes =======================================================================================
   const likeStory = async (slug:string) => {
      const docRef = doc(db, 'publicStories', slug)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
         const likes = docSnap.data().likes
         if (likes.find((uid:any) => uid === user.uid)) {
            await updateDoc(docRef, {
               likes: arrayRemove(user.uid)
            })
         }
         else {
            await updateDoc(docRef, {
               likes: arrayUnion(user.uid)
            })
         }
      }
   }

   useEffect(() => {
      const path = router.asPath
      const slug = path.substring(path.lastIndexOf('/') + 1)
      let unsubscribe:any = null

      if (path.includes('/story')) {
         unsubscribe = onSnapshot(doc(db, 'publicStories', slug), (doc) => {
            if (doc.exists()) {
               console.log('listened for likes')
               setUpdLikes(doc.data().likes)
            }
         })
      }

      // return() => {
      //    unsubscribe()
      // }
   }, [router.asPath])
   // End of Likes ================================================================================

   
   // Saving Story ================================================================================
   const saveStory = async (story:any) => {
      const docRef = doc(db, `users/${user.displayName}/saved`, story.slug)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
         try {
            await setDoc(docRef, story)
         } catch(err) {
            console.log('SubmitStory: ', err)
         }
      }
   }

   const unsaveStory = async (slug:string) => {
      const docRef = doc(db, `users/${user.displayName}/saved`, slug)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
         try {
            await deleteDoc(docRef)
         } catch(err) {
            console.log('deleteMiniRoom', err)
         }
      }
   }
   // End of Save Story ===========================================================================


   // Follow ======================================================================================
   const followWriter = async (username: string, userIcon: string) => {
      const docToFollowRef = doc(db, `users/${username}/followers`, user.displayName)
      const docToFollowSnap = await getDoc(docToFollowRef)

      const docRef = doc(db, `users/${user.displayName}/followings`, username)
      const docSnap = await getDoc(docRef)
      
      const userRef = doc(db, 'users', user.displayName)
      const userSnap = await getDoc(userRef)
      const userToFolloweRef = doc(db, 'users', username)
      const userToFollowSnap = await getDoc(userToFolloweRef)
      let status = false

      if (!docToFollowSnap.exists() && !docSnap.exists() && userToFollowSnap.exists() && userSnap.exists()) {
         status = true
         try {
            await setDoc(docToFollowRef, {
               username: user.displayName,
               userIcon: user.photoURL
            })
            await setDoc(docRef, {
               username,
               userIcon,
               notify: false
            })
            await updateDoc(userToFolloweRef, {
               followers: userToFollowSnap.data().followers + 1 || 1 
            })
            await updateDoc(userRef, {
               following: userSnap.data().following + 1 || 1
            })
         } catch(err) {
            console.log('FollowWriter: ', err)
         }
      }
      else if (docToFollowSnap.exists() && docSnap.exists() && userToFollowSnap.exists() && userSnap.exists()) {
         await deleteDoc(docToFollowRef)
         await deleteDoc(docRef)

         await updateDoc(userToFolloweRef, {
            followers: userToFollowSnap.data().followers - 1
         })
         await updateDoc(userRef, {
            following: userSnap.data().following - 1
         })
      }
      return status
   }

   const notifyFollowing = async (username: string) => {
      const docRef = doc(db, `users/${user.displayName}/followings`, username)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
         try {
            await updateDoc(docRef, {
               notify: !docSnap.data().notify
            })
            return !docSnap.data().notify
         } catch(err) {
            console.log('NotifyFollowing: ', err)
         }
      }
   }

   const checkFollowingNotify = async (user:string, username:string) => {
      const docRef = doc(db, `users/${user}/followings`, username)
      const docSnap = await getDoc(docRef)
      let isFollowing = false
      let isNotify = false

      if (docSnap.exists()) {
         isFollowing = true
         isNotify = docSnap.data().notify
      }

      return {
         isFollowing,
         isNotify
      }
   } 
   // End of Follow ===============================================================================


   // Notification ================================================================================
   const removeNotification = async (notification:any) => {
      const docNotifyRef = doc(db, `users/${user.displayName}/notificationDoc`, 'notifications')
      const docNotifySnap = await getDoc(docNotifyRef)

      if (docNotifySnap.exists()) {
         await updateDoc(docNotifyRef, {
            notifications: arrayRemove(notification)
         })
      }
   }

   const seeNotification = async (slug:string) => {
      const docNotifyRef = doc(db, `users/${user.displayName}/notificationDoc`, 'notifications')
      const docNotifySnap = await getDoc(docNotifyRef)

      if (docNotifySnap.exists()) {
         const notifications = docNotifySnap.data().notifications
         notifications.find(async (notification:any, index:number) => {
            if (notification.slug === slug) {
               notification.seen = true
               await updateDoc(docNotifyRef, {
                  notifications
               })
            }
         })
      }
   }
   // End of Notification =========================================================================

   return (
      <AuthContext.Provider value={{user, signup, login, logout, updateAbout, finishReg, handleStory, 
         postStoryComment, storyUpdComments, setStoryUpdComments, updLikes, setUpdLikes, 
         deleteStoryComment, likeStory, saveStory, unsaveStory, deleteYourStory, followWriter,
         notifyFollowing, checkFollowingNotify, notifications, setNotifications, notify,
         removeNotification, seeNotification}}>
            {loading ? null : children}
      </AuthContext.Provider>
   )
}