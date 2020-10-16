import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {

  constructor(private postsService: PostsService) {}

  posts: Post[] = [];
  isLoading = false;
  private postSubscription: Subscription;

  ngOnInit() {
    this.isLoading = true
    this.postsService.getPosts();
    this.postSubscription =  this.postsService.getUpdatedPosts().subscribe((posts: Post[]) => {
      this.isLoading = false;
      this.posts = posts;
    });
  }

  ngOnDestroy() {
    this.postSubscription.unsubscribe();
  }

  deletePost(postId: string) {
    this.postsService.deletePost(postId);
  }
}
