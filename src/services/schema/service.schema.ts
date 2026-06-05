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

@Entity('services')
@Index(['isPublished', 'order'])
@Index(['categoryId'])
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'varchar', length: 160, unique: true })
  slug: string;

  @Column({ type: 'text', name: 'short_description' })
  shortDescription: string;

  @Column({ type: 'text', name: 'long_description', nullable: true })
  longDescription: string | null;

  @Column({ type: 'varchar', length: 255, name: 'icon_url', nullable: true })
  iconUrl: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'cover_image_url',
    nullable: true,
  })
  coverImageUrl: string | null;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'base_price',
    default: 0,
  })
  basePrice: number;

  @Column({ type: 'uuid', name: 'category_id', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => Category, (category) => category.services, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ type: 'boolean', name: 'is_published', default: false })
  isPublished: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
