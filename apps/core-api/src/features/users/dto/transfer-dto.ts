import { IsInt, IsPositive, IsString, Matches } from 'class-validator';

export class TransferDto {
  @IsInt()
  @IsPositive()
  recipientId: number;

  @IsString()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message:
      'amount must be a positive decimal with up to 2 digits after decimal point',
  })
  amount: string;
}
