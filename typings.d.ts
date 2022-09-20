export interface Post {
   author: string;
   authorID: string;
   authorIcon: string;
   category: string;
   timeStamp: Object;
   title: string;
   mainImg: string;
   slug: string;
   searchFilter: Array;
   status: string;
   body: string;
   wordCount: number;
   likes: Array;
   comments: [Comment];
}

export interface Comment {
   id: string;
   replyTo: string;
   author: string;
   authorIcon: string;
   message: string;
   timeStamp: Object
}