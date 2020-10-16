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
            };
          });
        })
      )
      .subscribe((transformedPosts) => {
        this.posts = transformedPosts;
        this.postsUpdated.next([...this.posts]);
      });
  }

  getUpdatedPosts() {
    return this.postsUpdated.asObservable();
  }

  getPost(postId: string) {
    return this.http.get<{ _id: string; title: string; content: string }>(
      `http://localhost:3000/api/posts/byId/${postId}`
    );
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title, content };
    this.http
      .post<{ message: string; id: string }>(
        'http://localhost:3000/api/posts/add',
        post
      )
      .subscribe((responseData) => {
        console.log('Added!');
        this.posts.push({ ...post, id: responseData.id });
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
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

  updatePost(postId: string, title: string, content: string) {
    const updatedPost: Post = { id: postId, title, content };
    this.http
      .put(`http://localhost:3000/api/posts/update/${postId}`, updatedPost)
      .subscribe((response) => {
        console.log('Updated!');
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(
          (p) => p.id === updatedPost.id
        );
        updatedPosts[oldPostIndex] = updatedPost;
        this.postsUpdated.next([...updatedPosts]);
        this.router.navigate(["/"]);
        // const updatedPosts = this.posts.filter(post => post.id !== postId);
        // this.postsUpdated.next([...updatedPosts]);
      });
  }
}
