export class PaymentModel {
  cardNumber: string;

  expiryDate: string;

  securityCode: string;

  constructor(cardNumber: string, expiryDate: string, securityCode: string) {
    this.cardNumber = cardNumber;
    this.expiryDate = expiryDate;
    this.securityCode = securityCode;
  }
}
