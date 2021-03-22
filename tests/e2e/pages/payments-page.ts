import { BasePage } from './base-page';
import { click, enter } from '../utils/helpers';
import { PaymentModel } from '../data/payment-model';
import { BookingConfirmationPage } from './booking-confirmation-page';

export class PaymentsPage extends BasePage {
  pageTitleLocator = 'h1';

  pageTitle = 'Online Payments';

  emailID = '#email';

  cardNumber = '#card-number';

  expiryDate = '#expiry-date';

  securityCode = '#security-code';

  makePaymentButton = '#submit';

  async enterPaymentDetails(paymentModel: PaymentModel, email: string): Promise<void> {
    await enter(this.emailID, email);
    await enter(this.cardNumber, paymentModel.cardNumber);
    await enter(this.expiryDate, paymentModel.expiryDate);
    await enter(this.securityCode, paymentModel.securityCode);
  }

  async submitPayment(): Promise<BookingConfirmationPage> {
    await click(this.makePaymentButton);
    return new BookingConfirmationPage();
  }

  async makePayment(paymentModel: PaymentModel, email: string): Promise<BookingConfirmationPage> {
    await this.enterPaymentDetails(paymentModel, email);
    await this.submitPayment();
    return new BookingConfirmationPage();
  }
}
