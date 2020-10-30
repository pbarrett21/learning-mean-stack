import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: any[] }>('http://localhost:3000/api/posts')
      .pipe(
        map((postData) => {
          return postData.posts.map((post) => {
            return {
              id: post._id,
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
            };
          });
        })
      )
      .subscribe((transformedPosts: Post[]) => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getUpdatedPosts() {
    return this.postsUpdated.asObservable();
  }

  getPost(postId: string) {
    return this.http.get<{ _id: string; title: string; content: string, imagePath: string }>(
      `http://localhost:3000/api/posts/byId/${postId}`
    );
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts/add',
        postData
      )
      .subscribe((responseData) => {
        console.log('Added!');
        const post: Post = {
          id: responseData.post.id,
          title: title,
          content: content,
          imagePath: responseData.post.imagePath,
        };
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    this.http
      .delete(`http://localhost:3000/api/posts/delete/${postId}`)
      .subscribe(() => {
        console.log('Deleted!');
        const updatedPosts = this.posts.filter((post) => post.id !== postId);
        this.postsUpdated.next([...updatedPosts]);
      });
  }

  updatePost(
    postId: string,
    title: string,
    content: string,
    image: File | string
  ) {
    let postData: FormData | Post;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', postId);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: postId,
        title,
        content,
        imagePath: image,
      };
    }
    this.http
      .put(`http://localhost:3000/api/posts/update/${postId}`, postData)
      .subscribe((response) => {
        console.log('Updated!');
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex((p) => p.id === postId);
        const post: Post = {
          id: postId,
          title,
          content,
          imagePath: '',
        };
        updatedPosts[oldPostIndex] = post;
        this.postsUpdated.next([...updatedPosts]);
        this.router.navigate(['/']);
        // const updatedPosts = this.posts.filter(post => post.id !== postId);
        // this.postsUpdated.next([...updatedPosts]);
      });
  }
}
