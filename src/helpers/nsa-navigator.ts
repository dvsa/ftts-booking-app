import { Request } from 'express';
import { SupportType } from '../domain/enums';
import { isOnlyStandardSupportSelected } from './support';

type DynamicRoute = {
  option: SupportType;
  url: string;
};

export class NSANavigator {
  private dynamicRoutes: DynamicRoute[] = [
    {
      option: SupportType.VOICEOVER, url: 'change-voiceover',
    },
    {
      option: SupportType.TRANSLATOR, url: 'translator',
    },
    {
      option: SupportType.OTHER, url: 'custom-support',
    },
  ];

  private selectedRoutes: DynamicRoute[] = [];

  public getNextPage = (req: Request): string => {
    const selectedSupportOptions = req.session.currentBooking?.selectSupportType;

    if (selectedSupportOptions) {
      this.selectedRoutes = this.dynamicRoutes.filter((page) => selectedSupportOptions.includes(page.option));
    }
    const index = this.selectedRoutes.map((route) => route.url).indexOf(this.getPathFromUrl(req));
    let targetUrl = this.selectedRoutes[index + 1]?.url;

    if (!targetUrl) {
      targetUrl = 'staying-nsa';

      if (!selectedSupportOptions || isOnlyStandardSupportSelected(selectedSupportOptions)) {
        targetUrl = 'leaving-nsa';
      }
    }

    return targetUrl;
  };

  public getPreviousPage = (req: Request): string => {
    const selectedSupportOptions = req.session.currentBooking?.selectSupportType;

    if (selectedSupportOptions) {
      this.selectedRoutes = this.dynamicRoutes.filter((page) => selectedSupportOptions.includes(page.option));
    }
    const routes = [...this.selectedRoutes];
    routes.reverse();
    const index = routes.map((route) => route.url).indexOf(this.getPathFromUrl(req));
    let targetUrl = routes[index + 1]?.url;

    if (!targetUrl) {
      targetUrl = 'select-support-type';
    }

    return targetUrl;
  };

  private getPathFromUrl = (req: Request): string => req.path.substring(req.path.lastIndexOf('/') + 1);
}

export default new NSANavigator();
