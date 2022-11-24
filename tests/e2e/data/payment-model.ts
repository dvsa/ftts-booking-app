export class PaymentModel {
  cardNumber: string;

  expiryDateMonth: string;

  expiryDateYear: string;

  securityCode: string;

  constructor(cardNumber: string, expiryDateMonth: string, expiryDateYear: string, securityCode: string) {
    this.cardNumber = cardNumber;
    this.expiryDateMonth = expiryDateMonth;
    this.expiryDateYear = expiryDateYear;
    this.securityCode = securityCode;
  }
}
