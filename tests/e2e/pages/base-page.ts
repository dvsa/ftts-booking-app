import { Header } from './header';
import { Footer } from './footer';

export class BasePage {
  header: Header;

  footer: Footer;

  constructor() {
    this.header = new Header();
    this.footer = new Footer();
  }
}
