export const handleReadingTime = (wordCount) => {
   let minutes = Math.floor(wordCount / 200)
   if (minutes < 1)
      return (
         '1 min read'
      )

   const remainder = Math.abs(Math.floor(wordCount / 200) - wordCount / 200)
   const seconds = Math.floor((remainder * .60) * 100)

   if (seconds > 30)
      minutes += 1

   return (
      `${minutes} min read`
   )
}