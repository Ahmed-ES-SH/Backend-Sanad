import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../../categories/schema/category.schema';

@Entity('projects')
@Index(['isPublished', 'order'])
@Index(['categoryId'])
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug: string;

  @Column({ type: 'text', name: 'short_description' })
  shortDescription: string;

  @Column({ type: 'text', name: 'long_description', nullable: true })
  longDescription: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'cover_image_url',
    nullable: true,
  })
  coverImageUrl: string | null;

  @Column({ type: 'text', array: true, default: '{}' })
  images: string[];

  @Column({ type: 'text', array: true, name: 'tech_stack', default: '{}' })
  techStack: string[];

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, (category) => category.projects, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ type: 'varchar', length: 500, name: 'live_url', nullable: true })
  liveUrl: string | null;

  @Column({ type: 'varchar', length: 500, name: 'repo_url', nullable: true })
  repoUrl: string | null;

  @Column({ type: 'boolean', name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ type: 'boolean', name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
