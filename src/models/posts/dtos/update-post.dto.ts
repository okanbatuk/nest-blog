import { Length } from 'class-validator';

export class UpdatePostDto {
  @Length(3, 50)
  title: string;

  @Length(10, 100)
  content: string;
}
