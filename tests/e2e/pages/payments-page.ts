import { t } from 'testcafe';
import { BasePage } from './base-page';
import {
  click, enter, fillInFields, link, verifyIsVisible, verifyTitleContainsText,
} from '../utils/helpers';
import { PaymentModel } from '../data/payment-model';
import { BookingConfirmationPage } from './booking-confirmation-page';
import { CpmsPaymentModel } from '../data/cpms-payment-model';

export class PaymentsPage extends BasePage {
  // Real CPMS
  pageHeadingCpms = 'Card Details';

  email = '#scp_additionalInformationPage_email_input';

  emailConfirm = '#scp_additionalInformationPage_emailConfirmation_input';

  cardNumberCpms = '#scp_cardPage_cardNumber_input';

  expiryDateMonthCpms = '#scp_cardPage_expiryDate_input';

  expiryDateYearCpms = '#scp_cardPage_expiryDate_input2';

  securityCodeCpms = 'scp_cardPage_csc_input';

  cardHoldersName = '#scp_additionalInformationPage_cardholderName_input';

  billingInfoCardHoldersName = '#scp_tdsv2AdditionalInfoPage_cardholderName_input';

  billingInfoAddressLine1 = '#scp_tdsv2AdditionalInfoPage_address_1_input';

  billingInfoAddressCity = '#scp_tdsv2AdditionalInfoPage_city_input';

  billingInfoAddressPostcode = '#scp_tdsv2AdditionalInfoPage_postcode_input';

  billingInfoEmail = '#scp_tdsv2AdditionalInfoPage_email_input';

  billingInfoContinueButton = '#scp_tdsv2AdditionalInfoPage_buttons_continue_button';

  continueButtonPage1 = '#scp_cardPage_buttonsNoBack_continue_button';

  continueButtonPage2 = '#scp_additionalInformationPage_buttons_continue_button';

  makePaymentButtonCpms = '#scp_confirmationPage_buttons_payment_button';

  authPageIFrame = '#scp_threeDSecure_iframe';

  passwordField = '#password';

  continueButtonAuthPage = '#Continue';

  cancelLink = '#scp_customer_framework_cancelLink';

  // CPMS Mock
  pageHeadingLocator = 'h1';

  pageHeading = 'Online Payments';

  emailID = '#email';

  cardNumber = '#card-number';

  expiryDateMonth = '#expiry-date';

  expiryDateYear = '#expiry-date-m';

  securityCode = '#security-code';

  makePaymentButton = '#submit';

  mockCancelLink = 'Cancel';

  async enterPaymentDetailsCpms(paymentModel: CpmsPaymentModel, email: string): Promise<void> {
    // page 1 CPMS
    await verifyTitleContainsText(this.pageHeadingCpms, 10000);
    await verifyIsVisible(this.cardNumberCpms);
    await fillInFields(paymentModel.cardNumber, paymentModel.expiryDateMonth, paymentModel.expiryDateYear, paymentModel.securityCode);

    // page additional info - billing address CPMS
    await enter(this.billingInfoCardHoldersName, paymentModel.name);
    await enter(this.billingInfoAddressLine1, paymentModel.addressLine1);
    await enter(this.billingInfoAddressCity, paymentModel.addressCity);
    await enter(this.billingInfoAddressPostcode, paymentModel.addressPostcode);
    await enter(this.billingInfoEmail, email);
    await click(this.billingInfoContinueButton);

    // make payment
    await click(this.makePaymentButtonCpms);

    // verified by visa page
    await t.switchToIframe(this.authPageIFrame);
    await enter(this.passwordField, paymentModel.password);
    await click(this.continueButtonAuthPage);
    await t.switchToMainWindow();
  }

  async enterPaymentDetails(paymentModel: PaymentModel, email: string): Promise<void> {
    await enter(this.emailID, email);
    await enter(this.cardNumber, paymentModel.cardNumber);
    await enter(this.expiryDateMonth, paymentModel.expiryDateMonth);
    await enter(this.expiryDateYear, paymentModel.expiryDateYear);
    await enter(this.securityCode, paymentModel.securityCode);
  }

  async submitPayment(): Promise<BookingConfirmationPage> {
    await click(this.makePaymentButton);
    return new BookingConfirmationPage();
  }

  async cancelPayment(paymentModel: PaymentModel): Promise<void> {
    if (paymentModel instanceof CpmsPaymentModel) {
      await verifyTitleContainsText(this.pageHeadingCpms, 10000);
      await verifyIsVisible(this.cardNumberCpms);
      await fillInFields(paymentModel.cardNumber, paymentModel.expiryDateMonth, paymentModel.expiryDateYear, paymentModel.securityCode);
      await enter(this.billingInfoCardHoldersName, paymentModel.name);
      await click(this.cancelLink);
    } else {
      await link(this.mockCancelLink);
    }
  }

  async makePayment(paymentModel: PaymentModel, email: string): Promise<BookingConfirmationPage> {
    if (paymentModel instanceof CpmsPaymentModel) {
      await this.enterPaymentDetailsCpms(paymentModel, email);
    } else {
      await this.enterPaymentDetails(paymentModel, email);
      await this.submitPayment();
    }
    return new BookingConfirmationPage();
  }
}
