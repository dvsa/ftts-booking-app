import config from '../config';

export class AssetFilter {
  public static asset(imgURL: string): string {
    return config.view.assetPath + imgURL;
  }
}
