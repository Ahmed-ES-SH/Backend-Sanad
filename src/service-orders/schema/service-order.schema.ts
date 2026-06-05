import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/schema/user.schema';
import { Service } from '../../services/schema/service.schema';
import { Payment } from '../../payments/schema/payment.schema';
import { OrderUpdate } from './order-update.schema';
import { OrderStatus } from '../enums/order-status.enum';

@Entity('service_orders')
@Index(['userId'])
@Index(['serviceId'])
@Index(['status'])
export class ServiceOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'service_id' })
  serviceId: string;

  @ManyToOne(() => Service, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'uuid', name: 'payment_id', nullable: true, unique: true })
  paymentId: string | null;

  @OneToOne(() => Payment, { nullable: true, eager: false })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment | null;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'usd' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @OneToMany(() => OrderUpdate, (update) => update.order, { cascade: true })
  updates: OrderUpdate[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
