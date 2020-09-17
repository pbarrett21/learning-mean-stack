import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) {}

  getPosts() {
    this.http
      .get<{ message: string; posts: any[] }>('http://localhost:3000/posts')
      .pipe(map((postData) => {
        return postData.posts.map(post => {
          return {
            id: post._id,
            title: post.title,
            content: post.content
          }
        })
      }))
      .subscribe(transformedPosts => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getUpdatedPosts() {
    return this.postsUpdated.asObservable();
  }

  getPost(postId: string) {
    return {...this.posts.find(post => post.id === postId)};
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title, content };
    this.http
      .post<{ message: string, id: string }>('http://localhost:3000/posts/add', post)
      .subscribe((responseData) => {
        console.log("Added!");
        this.posts.push({...post, id: responseData.id});
        this.postsUpdated.next([...this.posts]);
      });
  }

  deletePost(postId: string) {
    this.http.delete(`http://localhost:3000/posts/delete/${postId}`)
    .subscribe(() => {
      console.log("Deleted!");
      const updatedPosts = this.posts.filter(post => post.id !== postId);
      this.postsUpdated.next([...updatedPosts]);
    })
  }

  updatePost(postId: string, title: string, content: string) {
    const updatedPost: Post = {id: postId, title, content};
    this.http.put(`http://localhost:3000/posts/update/${postId}`, updatedPost)
    .subscribe(() => {
      console.log("Updated!");
      // const updatedPosts = this.posts.filter(post => post.id !== postId);
      // this.postsUpdated.next([...updatedPosts]);
    })
  }
}
