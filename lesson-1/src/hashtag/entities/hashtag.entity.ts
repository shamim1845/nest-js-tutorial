import { Tweet } from 'src/tweet/tweet.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Hashtag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    nullable: false,
    type: 'varchar',
    length: 50,
  })
  name: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToMany(() => Tweet, (tweet) => tweet.hashtags)
  tweets: Tweet[];
}
