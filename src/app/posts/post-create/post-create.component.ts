import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent implements OnInit {
  constructor(
    private postsService: PostsService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  postCreateForm: FormGroup = new FormGroup({});
  enteredTitle = '';
  enteredContent = '';
  imagePreview: string;
  isLoading = false;
  post: Post;
  private mode = 'create';
  private postId: string;

  ngOnInit() {
    this.postCreateForm = this.fb.group({
      title: [null, [Validators.required, Validators.minLength(3)]],
      content: [null, Validators.required],
      image: [null, Validators.required, mimeType],
    });
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getPost(this.postId).subscribe((postData) => {
          this.isLoading = false;
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: null
          };
          this.postCreateForm.setValue({
            title: this.post.title,
            content: this.post.content,
          });
        });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }

  savePost() {
    if (this.postCreateForm.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(
        this.postCreateForm.value.title,
        this.postCreateForm.value.content,
        this.postCreateForm.value.image
      );
    } else {
      this.postsService.updatePost(
        this.postId,
        this.postCreateForm.value.title,
        this.postCreateForm.value.content
      );
    }
    this.postCreateForm.reset();
  }

  onImagePick(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.postCreateForm.patchValue({ image: file });
    this.postCreateForm.controls['image'].updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
