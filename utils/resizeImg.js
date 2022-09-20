export const resizeImg = (e, mode, name, setAccImg) => {
   const imgFile = e.target.files[0]
   if (!imgFile.name.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG|gif)$/)) {
      return false;
   }
   else {
      let reader = new FileReader(); 
      
      reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
         var canvas = document.createElement('canvas');
         var ctx = canvas.getContext("2d");
         ctx.drawImage(img, 0, 0);

         var MAX_WIDTH = 0;
         var MAX_HEIGHT = 0;
         
         if (mode === 'user') {
            MAX_WIDTH = 350;
            MAX_HEIGHT = 350;
         } else {
            MAX_WIDTH = 890;
            MAX_HEIGHT = 384;
         }
         var width = img.width;
         var height = img.height;

         if (width > height) {
            if (width > MAX_WIDTH) {
               height *= MAX_WIDTH / width;
               width = MAX_WIDTH;
            }
         } else {
            if (height > MAX_HEIGHT) {
               width *= MAX_HEIGHT / height;
               height = MAX_HEIGHT;
            }
         }
         canvas.width = width;
         canvas.height = height;
         ctx = canvas.getContext("2d");
         ctx.drawImage(img, 0, 0, width, height);
         ctx.canvas.toBlob((blob) => {
         const file = new File([blob], `${mode}_${name.replace(/\s/g, '')}`, {
            type: 'image/jpeg',
            lastModified: Date.now()
         });
         setAccImg(file)
         }, 'image/jpeg', 1);
      };

      img.onerror = () => {
            console.log('Invalid image content.');
         return false;
      };
      //debugger
      img.src = e.target.result;
      };
      reader.readAsDataURL(imgFile);
      return true
   }
}