

import { URL } from "url";

import { getVideoService, videoIdProcessors } from "./config";
import { IEmbedVideoOptions, IVideoId, IVideoService } from "./interfaces";


export function embedVideoHTML(type: string, id: string, options: IEmbedVideoOptions): string {
  try {
    const videoId: IVideoId = readVideoId(type, id);

    const videoService = getVideoService(videoId.service);
    const url = createUrl(videoId.id, videoService, options);
    let iframe = createIframe(url, videoService, options);
    return iframe;

  } catch (e) {
    return `<p style="color: red">Error: ${e.message}</p>`;
  }
}

function readVideoId(type: string, id: string): IVideoId {

  let videoId;
  for (let processor of videoIdProcessors) {
    videoId = processor(id);
    if (Object.keys(videoId).length !== 0) {
      return videoId as IVideoId;
    }
  }

  if (type === 'video') {
    throw new TypeError('Id could not be processed');
  }

  return {
    id: id,
    service: type.toLowerCase()
  }
}

function createUrl(videoId: string, videoService:IVideoService, options: IEmbedVideoOptions): string {

  const videoUrl = videoService.embedUrl(videoId);
  let url = new URL(videoUrl);

  if (videoService.urlProcessing) {
    url = videoService.urlProcessing(videoId, url, options);
  }

  return url.toString();
}

function createIframe(url: string, videoService:IVideoService, options: IEmbedVideoOptions) {
  let iframeNode = `<iframe 
              width="${options.width}" 
              height="${options.height}" 
              src="${url}"
              class="embedVideoIframe" 
              allowfullscreen
            ></iframe>`
  if (options.noIframeBorder) {
    iframeNode += `
      <style>
        .embedVideoIframe {
          border: 0
        }
      </style>`
  }

  if (videoService.additionalHTML) {
    iframeNode += videoService.additionalHTML;
  }

  return iframeNode;
}
