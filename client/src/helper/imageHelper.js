import { getbaseURL } from "@/helper/baseUrlHelper";
const baseURL = getbaseURL();

export function createImageSrcSet(photoId) {
  return `${baseURL}media/${photoId} 4000w,
  ${baseURL}media/${photoId}?size=regular 2000w, 
  ${baseURL}media/${photoId}?size=small 1100w, 
  ${baseURL}media/${photoId}?size=xsmall 620w, 
  ${baseURL}media/${photoId}?size=thumb 310w`;
}
