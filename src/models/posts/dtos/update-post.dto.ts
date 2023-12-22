import { IsOptional, Length } from 'class-validator';

export class UpdatePostDto {
  @Length(3, 100)
  @IsOptional()
  title: string;

  @Length(10)
  @IsOptional()
  content: string;
}
