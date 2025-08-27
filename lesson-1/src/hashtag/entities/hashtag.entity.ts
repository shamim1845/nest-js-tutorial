import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  // @ManyToMany(() => Tweet, (tweet) => tweet.hashtag)
  // tweet: Tweet[];
}
