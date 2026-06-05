import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ServiceOrder } from './service-order.schema';
import { UpdateAuthor } from '../enums/update-author.enum';

@Entity('order_updates')
@Index(['orderId', 'createdAt'])
export class OrderUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @ManyToOne(() => ServiceOrder, (order) => order.updates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: ServiceOrder;

  @Column({ type: 'enum', enum: UpdateAuthor })
  author: UpdateAuthor;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
