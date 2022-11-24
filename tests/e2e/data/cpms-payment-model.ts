import { PaymentModel } from './payment-model';

export class CpmsPaymentModel extends PaymentModel {
  name: string;

  addressLine1: string;

  addressCity: string;

  addressPostcode: string;

  password: string;

  constructor(name: string, cardNumber: string, expiryDateMonth: string, expiryDateYear: string, securityCode: string, password: string, addressLine1: string, addressCity: string, addressPostcode: string) {
    super(cardNumber, expiryDateMonth, expiryDateYear, securityCode);
    this.name = name;
    this.password = password;
    this.addressLine1 = addressLine1;
    this.addressCity = addressCity;
    this.addressPostcode = addressPostcode;
  }
}
