export const modules = {
   toolbar: [
      [{ 'font': [] }, { header: [1, 2, 3, 4, 5, 6, false] }],
      [{size: []}],
      [{ align: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image']
   ],
   clipboard: {
      matchVisual: false,
   }
}

export const theme = 'snow'

export const formats = [
   'header', 'font', 'size',
   'bold', 'italic', 'underline', 'strike', 'blockquote',
   'list', 'bullet', 'indent',
   'link', 'image', 'script', 'align'
]