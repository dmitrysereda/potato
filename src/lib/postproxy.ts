import { PostProxy } from "postproxy-sdk";

let instance: PostProxy | null = null;

export default function getPostProxy(): PostProxy {
  if (!instance) {
    if (!process.env.POSTPROXY_API_KEY) {
      throw new Error("POSTPROXY_API_KEY environment variable is required");
    }
    instance = new PostProxy(process.env.POSTPROXY_API_KEY);
  }
  return instance;
}
