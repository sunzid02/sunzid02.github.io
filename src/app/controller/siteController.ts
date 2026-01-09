import { siteModel, type SiteModel } from "../model/siteModel";

/**
 * Controller layer
 * future: এখানে API call / async fetch বসবে
 */
export function getSiteModel(): SiteModel {
  return siteModel;
}
