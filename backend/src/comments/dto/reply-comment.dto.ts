import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class ReplyCommentDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsMongoId()
  parentCommentId: string;
}