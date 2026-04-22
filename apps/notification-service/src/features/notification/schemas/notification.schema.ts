import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  senderId!: number;

  @Prop({ required: true })
  recipientId!: number;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  transferredAt!: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
