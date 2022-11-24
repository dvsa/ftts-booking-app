import config from '../config';

export class AssetFilter {
  public static asset(path: string): string {
    return `${config.view.assetPath}/${path}?v=${config.buildVersion}`;
  }
}
