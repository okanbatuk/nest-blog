import { IsNotEmpty, Length } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @Length(3, 50)
  title: string;

  @IsNotEmpty()
  @Length(10, 100)
  content: string;
}
